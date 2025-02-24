import Deal from "../models/Deal.js";
import Product from "../models/Product.js";
import { Op } from "sequelize";

// Create a New Deal
export const createDeal = async (req, res) => {
  try {
    const {
      productId,
      startDate,
      endDate,
      discountPercentage,
      specialOfferDetails,
      isDealOfTheDay,
    } = req.body;

    if (!productId || !startDate || !endDate || !discountPercentage) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    const product = await Product.findByPk(productId);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const deal = await Deal.create({
      productId,
      startDate,
      endDate,
      discountPercentage,
      specialOfferDetails,
      isDealOfTheDay,
    });

    if (isDealOfTheDay) {
      product.dealOfTheDay = true;
      product.dealDiscountPercentage = discountPercentage;
    } else {
      product.dealOfTheDay = false;
      product.dealDiscountPercentage = 0;
    }
    await product.save();

    return res
      .status(201)
      .json({
        success: true,
        message: "Deal created successfully",
        data: deal,
      });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error creating deal",
      data: { error: error.message },
    });
  }
};

// Get Deals of the Day (with Pagination, Filtering, Searching, Sorting)
export const getDealsOfTheDay = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      productId,
      search,
      sortBy = "startDate",
      order = "desc",
    } = req.query;

    const offset = (page - 1) * limit;
    const whereCondition = { isDealOfTheDay: true };

    if (productId) whereCondition.productId = productId;
    if (search)
      whereCondition.specialOfferDetails = { [Op.iLike]: `%${search}%` };

    const deals = await Deal.findAndCountAll({
      where: whereCondition,
      include: [{ model: Product, as: "product" }],
      order: [[sortBy, order]],
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    return res.status(200).json({
      success: true,
      message: "Deals fetched successfully",
      totalDeals: deals.count,
      totalPages: Math.ceil(deals.count / limit),
      currentPage: parseInt(page),
      data: deals.rows,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching deals",
      data: { error: error.message },
    });
  }
};

// Get a Single Deal by ID
export const getDealById = async (req, res) => {
  try {
    const { id } = req.params;
    const deal = await Deal.findByPk(id, {
      include: [{ model: Product, as: "product" }],
    });

    if (!deal) {
      return res
        .status(404)
        .json({ success: false, message: "Deal not found" });
    }

    return res.status(200).json({ success: true, data: deal });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching deal",
      data: { error: error.message },
    });
  }
};

// Update a Deal
export const updateDeal = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      productId,
      startDate,
      endDate,
      discountPercentage,
      specialOfferDetails,
      isDealOfTheDay,
    } = req.body;

    const deal = await Deal.findByPk(id);
    if (!deal) {
      return res
        .status(404)
        .json({ success: false, message: "Deal not found" });
    }

    if (productId) deal.productId = productId;
    if (startDate) deal.startDate = startDate;
    if (endDate) deal.endDate = endDate;
    if (discountPercentage) deal.discountPercentage = discountPercentage;
    if (specialOfferDetails) deal.specialOfferDetails = specialOfferDetails;
    if (isDealOfTheDay !== undefined) deal.isDealOfTheDay = isDealOfTheDay;

    await deal.save();

    // Update the associated product's deal-related fields
    const product = await Product.findByPk(deal.productId);
    if (product) {
      product.dealOfTheDay = isDealOfTheDay || false;
      product.dealDiscountPercentage = isDealOfTheDay ? discountPercentage : 0;
      await product.save();
    }

    return res
      .status(200)
      .json({ success: true, message: "Deal updated successfully", deal });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error updating deal",
      data: { error: error.message },
    });
  }
};

// Delete a Deal
export const deleteDeal = async (req, res) => {
  try {
    const { id } = req.params;

    const deal = await Deal.findByPk(id);
    if (!deal) {
      return res
        .status(404)
        .json({ success: false, message: "Deal not found" });
    }

    // Reset the associated product's deal-related fields
    const product = await Product.findByPk(deal.productId);
    if (product) {
      product.dealOfTheDay = false;
      product.dealDiscountPercentage = 0;
      await product.save();
    }

    await deal.destroy();

    return res
      .status(200)
      .json({ success: true, message: "Deal deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting deal",
      data: { error: error.message },
    });
  }
};
