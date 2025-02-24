import Order from "../models/Order.js";
import OrderTransaction from "../models/OrderTransaction.js";
import Product from "../models/Product.js";
import Cart from "../models/Cart.js";
import sequelize from "../config/sequelize.js";
import User from "../models/User.js";
import { Op } from "sequelize";

// Create Order
export const createOrder = async (req, res) => {
  const { userId, shippingAddress, paymentMethod } = req.body;

  try {
    if (!userId || !shippingAddress || !paymentMethod) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
    });

    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    let totalPrice = 0;
    const transactionId = `TXN${Date.now()}`;

    for (const item of cartItems) {
      if (item.quantity > item.product.quantity) {
        return res.status(400).json({
          success: false,
          message: `Not enough stock for ${item.product.name}. Available: ${item.product.quantity}`,
        });
      }
      totalPrice += item.quantity * item.product.price;
    }

    const transaction = await sequelize.transaction();

    try {
      const order = await Order.create(
        {
          userId,
          totalPrice,
          shippingAddress,
          paymentMethod,
          status: "pending",
        },
        { transaction }
      );

      for (const item of cartItems) {
        await OrderTransaction.create(
          {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: item.product.price,
            transactionId,
            amount: item.quantity * item.product.price,
            paymentMethod,
          },
          { transaction }
        );

        await Product.update(
          { quantity: item.product.quantity - item.quantity },
          { where: { id: item.productId }, transaction }
        );
      }

      await Cart.destroy({ where: { userId }, transaction });
      await transaction.commit();

      return res.status(201).json({
        success: true,
        message: "Order placed successfully",
        data: { orderId: order.id, transactionId },
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({
        success: false,
        message: "Order creation failed",
        error: error.message,
      });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Server error", error: error.message });
  }
};

// Get All Orders with Pagination, Filtering, and Sorting
export const getAllOrders = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      userId,
      status,
      paymentMethod,
      search,
    } = req.query;
    const offset = (page - 1) * limit;

    const whereCondition = {};
    if (userId) whereCondition.userId = userId;
    if (status) whereCondition.status = status;
    if (paymentMethod)
      whereCondition["$transaction.paymentMethod$"] = paymentMethod;
    if (search) {
      whereCondition[Op.or] = [
        { id: { [Op.like]: `%${search}%` } },
        { "$transaction.transactionId$": { [Op.like]: `%${search}%` } },
      ];
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "firstName", "lastName", "email"],
        },
        {
          model: OrderTransaction,
          as: "transaction",
          attributes: ["transactionId", "amount", "paymentMethod"],
        },
      ],
      limit: parseInt(limit),
      offset,
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      data: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        orders,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error fetching orders",
        error: error.message,
      });
  }
};

// Update Order Status with Stock Management
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    const validStatuses = [
      "pending",
      "processing",
      "shipping",
      "delivered",
      "cancelled",
    ];
    if (!validStatuses.includes(status)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order status" });
    }

    const order = await Order.findByPk(orderId, {
      include: [{ model: OrderTransaction, as: "transaction" }],
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    const validTransitions = {
      pending: ["processing", "cancelled"],
      processing: ["shipping", "cancelled"],
      shipping: ["delivered"],
      delivered: [],
      cancelled: [],
    };

    const allowedTransitions = validTransitions[order.status];
    if (!allowedTransitions.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from '${
          order.status
        }' to '${status}'. Allowed: ${allowedTransitions.join(", ")}`,
      });
    }

    if (status === "cancelled") {
      for (const item of order.transaction) {
        await Product.increment("quantity", {
          by: item.quantity,
          where: { id: item.productId },
        });
      }
    }

    order.status = status;
    await order.save();

    return res
      .status(200)
      .json({
        success: true,
        message: "Order status updated successfully",
        data: order,
      });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error updating order status",
        error: error.message,
      });
  }
};

// Get Monthly Orders and Earnings
export const getMonthlyOrders = async (req, res) => {
  try {
    const { year } = req.query;

    const monthlyOrders = await Order.findAll({
      attributes: [
        [sequelize.fn("MONTH", sequelize.col("createdAt")), "month"],
        [sequelize.fn("COUNT", sequelize.col("id")), "orderCount"],
        [sequelize.fn("SUM", sequelize.col("totalPrice")), "totalValue"],
      ],
      where: {
        [Op.and]: [
          sequelize.where(
            sequelize.fn("YEAR", sequelize.col("createdAt")),
            year
          ),
          { status: "delivered" },
        ],
      },
      group: ["month"],
      order: [[sequelize.fn("MONTH", sequelize.col("createdAt")), "ASC"]],
      raw: true,
    });

    const monthlyOrdersData = Array(12).fill(0);
    const monthlyEarningsData = Array(12).fill(0);

    monthlyOrders.forEach((order) => {
      monthlyOrdersData[order.month - 1] = order.orderCount;
      monthlyEarningsData[order.month - 1] = parseFloat(order.totalValue) || 0;
    });

    return res.status(200).json({
      success: true,
      message: "Monthly orders and earnings fetched successfully",
      data: {
        monthlyOrders: monthlyOrdersData,
        monthlyEarnings: monthlyEarningsData,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Error fetching monthly orders",
        error: error.message,
      });
  }
};
