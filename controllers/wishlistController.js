import Wishlist from "../models/Wishlist.js";
import User from "../models/User.js";
import Product from "../models/Product.js";

export const addToWishlist = async (req, res) => {
  const { userId, productId } = req.body;

  try {
    if (!userId || !productId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User ID and Product ID are required",
        });
    }

    const user = await User.findByPk(userId);
    const product = await Product.findByPk(productId);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    const existingWishlistItem = await Wishlist.findOne({
      where: { userId, productId },
    });

    if (existingWishlistItem) {
      return res
        .status(400)
        .json({ success: false, message: "Product already in wishlist" });
    }

    const wishlistItem = await Wishlist.create({ userId, productId });

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: wishlistItem,
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error",
        data: { error: error.message },
      });
  }
};

export const removeFromWishlist = async (req, res) => {
  const { userId, productId } = req.params;

  try {
    if (!userId || !productId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "User ID and Product ID are required",
        });
    }

    const wishlistItem = await Wishlist.findOne({
      where: { userId, productId },
    });

    if (!wishlistItem) {
      return res
        .status(404)
        .json({ success: false,
         message: "Wishlist item not found" });
    }

    await wishlistItem.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Product removed from wishlist" });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error",
        data: { error: error.message },
      });
  }
};

export const getUserWishlist = async (req, res) => {
  const { userId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  try {
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, message: "User ID is required" });
    }

    const offset = (page - 1) * limit;

    const { count, rows: wishlistItems } = await Wishlist.findAndCountAll({
      where: { userId },
      include: [{ model: Product, as: "product" }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["createdAt", "DESC"]],
    });

    if (!wishlistItems.length) {
      return res
        .status(404)
        .json({ success: false, message: "Wishlist is empty" });
    }

    return res.status(200).json({
      success: true,
      message: "Wishlist fetched successfully",
      data: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        data:wishlistItems,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({
        success: false,
        message: "Server error",
        data: { error: error.message },
      });
  }
};
