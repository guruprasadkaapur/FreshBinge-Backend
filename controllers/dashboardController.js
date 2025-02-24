import Order from "../models/Order.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import { Op, fn, col, literal } from "sequelize";

// Get Total Orders
export const getTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.count();
    res.status(200).json({ success: true, totalOrders });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching total orders",
      data: { error: error.message },
    });
  }
};

// Get Total Customers
export const getTotalCustomers = async (req, res) => {
  try {
    const totalCustomers = await User.count();
    res.status(200).json({ success: true, totalCustomers });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching total customers",
      data: { error: error.message },
    });
  }
};

// Get Earnings & Monthly Breakdown
export const getEarnings = async (req, res) => {
  try {
    const totalEarnings =
      (await Order.sum("totalPrice", { where: { status: "delivered" } })) || 0;

    const monthlyEarnings = await Order.findAll({
      attributes: [
        [fn("DATE_FORMAT", col("createdAt"), "%Y-%m"), "month"],
        [fn("SUM", col("totalPrice")), "earnings"],
      ],
      where: { status: "delivered" },
      group: ["month"],
      order: [[literal("month"), "DESC"]],
      limit: 6,
      raw: true,
    });

    res.status(200).json({
      success: true,
      totalEarnings,
      monthlyEarnings: monthlyEarnings.map((data) => ({
        label: data.month,
        amount: parseFloat(data.earnings),
      })),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching earnings",
      data: { error: error.message },
    });
  }
};

// Get Top Customers (Sorted by Total Spent)
export const getTopCustomers = async (req, res) => {
  try {
    const topCustomers = await User.findAll({
      attributes: ["id", "firstName", "lastName", "email", "totalSpent"],
      order: [["totalSpent", "DESC"]],
      limit: 5,
    });

    res.status(200).json({ success: true, topCustomers });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching top customers",
      data: { error: error.message },
    });
  }
};

// Get Top Selling Products (Sorted by Sales)
export const getTopSellingProducts = async (req, res) => {
  try {
    const topSellingProducts = await Product.findAll({
      attributes: ["id", "name", "sales", "price", "image"],
      order: [["sales", "DESC"]],
      limit: 5,
    });

    res.status(200).json({ success: true, topSellingProducts });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching top selling products",
      data: { error: error.message },
    });
  }
};
