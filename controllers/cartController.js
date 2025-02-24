import Cart from "../models/Cart.js";
import Product from "../models/Product.js";
import { Op } from "sequelize";

export const addToCart = async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    const [cartItem, created] = await Cart.findOrCreate({
      where: { userId, productId },
      defaults: { quantity },
    });

    if (!created) {
      cartItem.quantity += quantity;
      await cartItem.save();
    }

    return res.status(201).json({
      success: true,
      message: "Item added to cart successfully",
      data: cartItem,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding to cart",
      data: { error: error.message },
    });
  }
};

export const getCart = async (req, res) => {
  const { userId } = req.params;
  const {
    page = 1,
    limit = 10,
    productId,
    search,
    sortBy = "createdAt",
    order = "desc",
  } = req.query;

  try {
    const offset = (page - 1) * limit;
    const whereCondition = { userId };

    if (productId) {
      whereCondition.productId = productId;
    }

    const cartItems = await Cart.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: Product,
          as: "product",
          where: search ? { name: { [Op.iLike]: `%${search}%` } } : {}, 
        },
      ],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!cartItems.rows.length) {
      return res.status(404).json({
        success: false,
        message: "Cart is empty",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Cart items fetched successfully",
      totalItems: cartItems.count,
      totalPages: Math.ceil(cartItems.count / limit),
      currentPage: parseInt(page),
      data: cartItems.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching cart",
      data: { error: error.message },
    });
  }
};

// Remove from Cart
export const removeFromCart = async (req, res) => {
  const { cartId } = req.params;

  try {
    const cartItem = await Cart.findByPk(cartId);
    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Cart item not found",
        data: null,
      });
    }

    await cartItem.destroy();

    return res.status(200).json({
      success: true,
      message: "Item removed from cart",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error removing from cart",
      data: { error: error.message },
    });
  }
};
