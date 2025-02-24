import Feedback from "../models/Feedback.js";
import User from "../models/User.js";
import Product from "../models/Product.js";
import sequelize from "../config/sequelize.js";
import { Op } from "sequelize";

// Add Feedback
export const addFeedback = async (req, res) => {
  const { userId, productId, rating, comment } = req.body;

  try {
    if (!userId || !productId || rating === undefined) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const user = await User.findByPk(userId);
    const product = await Product.findByPk(productId);

    if (!user || !product) {
      return res
        .status(404)
        .json({ success: false, message: "User or Product not found" });
    }

    const existingFeedback = await Feedback.findOne({
      where: { userId, productId },
    });

    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "Feedback already exists for this product",
      });
    }

    const feedback = await Feedback.create({
      userId,
      productId,
      rating,
      comment,
    });

    await updateProductAverageRating(productId);

    return res.status(201).json({
      success: true,
      message: "Feedback added successfully",
      feedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error adding feedback",
      data: { error: error.message },
    });
  }
};

// Update Feedback
export const updateFeedback = async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  try {
    if (!rating || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const feedback = await Feedback.findByPk(id);

    if (!feedback) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    }

    feedback.rating = rating;
    feedback.comment = comment || feedback.comment;
    await feedback.save();

    await updateProductAverageRating(feedback.productId);

    return res.status(200).json({
      success: true,
      message: "Feedback updated successfully",
      feedback,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating feedback",
      data: { error: error.message },
    });
  }
};

// Delete Feedback
export const deleteFeedback = async (req, res) => {
  const { id } = req.params;

  try {
    const feedback = await Feedback.findByPk(id);

    if (!feedback) {
      return res
        .status(404)
        .json({ success: false, message: "Feedback not found" });
    }

    await feedback.destroy();
    await updateProductAverageRating(feedback.productId);

    return res
      .status(200)
      .json({ success: true, message: "Feedback deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting feedback",
      data: { error: error.message },
    });
  }
};

// Get Product Feedback with Pagination, Sorting & Searching
export const getProductFeedback = async (req, res) => {
  const { productId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "rating",
    order = "desc",
    search,
  } = req.query;

  try {
    const offset = (page - 1) * limit;
    const whereCondition = { productId };

    if (search) {
      whereCondition.comment = { [Op.iLike]: `%${search}%` };
    }

    const { count, rows: feedbacks } = await Feedback.findAndCountAll({
      where: whereCondition,
      include: [
        {
          model: User,
          as: "user",
          attributes: ["id", "email", "mobileNumber"],
        },
      ],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    if (!feedbacks.length) {
      return res
        .status(404)
        .json({ success: false, message: "No feedback found", data: null });
    }

    return res.status(200).json({
      success: true,
      message: "Feedback fetched successfully",
      data: {
        totalFeedbacks: count,
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        data: feedbacks,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching feedback",
      data: { error: error.message },
    });
  }
};

// Update Product's Average Rating
export const updateProductAverageRating = async (productId) => {
  try {
    const feedbackData = await Feedback.findAll({
      where: { productId },
      attributes: [
        [sequelize.fn("AVG", sequelize.col("rating")), "averageRating"],
      ],
      raw: true,
    });

    const averageRating = parseFloat(
      feedbackData[0]?.averageRating || 0
    ).toFixed(1);

    await Product.update({ averageRating }, { where: { id: productId } });
  } catch (error) {
    console.error("Error updating product average rating:", error);
  }
};
