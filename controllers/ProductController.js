import path from "path";
import Product from "../models/Product.js";
import SubCategory from "../models/SubCategory.js";
import { Op } from "sequelize";

// Create Product
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      weight,
      quantity,
      originalPrice,
      discountPercentage,
      description,
      additionalInfo,
      subCategoryId,
    } = req.body;

    if (!name || !weight || !quantity || !originalPrice || !discountPercentage || !description || !subCategoryId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const image = req.file;
    if (!image) {
      return res.status(400).json({
        success: false,
        message: "Image is required",
      });
    }

    const imagePath = path.join(image.destination, image.filename);
    const price = originalPrice - (originalPrice * discountPercentage) / 100;

    const product = await Product.create({
      name,
      weight,
      quantity,
      originalPrice,
      discountPercentage,
      price,
      image: imagePath,
      description,
      additionalInfo,
      subCategoryId,
    });

    return res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    console.error("Error creating product:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the product",
      data: { error: error.message },
    });
  }
};

// Get All Products
export const getProducts = async (req, res) => {
  try {
    let { page = 1, limit = 10, search, minPrice, maxPrice, subCategoryId, availability } = req.query;

    page = parseInt(page, 10);
    limit = parseInt(limit, 10);

    const whereClause = {};

    if (minPrice && maxPrice) {
      whereClause.originalPrice = { [Op.between]: [parseFloat(minPrice), parseFloat(maxPrice)] };
    } else if (minPrice) {
      whereClause.originalPrice = { [Op.gte]: parseFloat(minPrice) };
    } else if (maxPrice) {
      whereClause.originalPrice = { [Op.lte]: parseFloat(maxPrice) };
    }

    if (search) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    if (subCategoryId) {
      whereClause.subCategoryId = parseInt(subCategoryId, 10);
    }

    if (availability !== undefined) {
      whereClause.isAvailable = availability.toLowerCase() === "true";
    }

    const offset = (page - 1) * limit;

    const { count, rows } = await Product.findAndCountAll({
      where: whereClause,
      include: [{ model: SubCategory, as: "subCategory", attributes: ["name"] }],
      attributes: [
        "id",
        "name",
        "weight",
        "quantity",
        "originalPrice",
        "discountPercentage",
        "price",
        "image",
        "description",
        "additionalInfo",
        "isAvailable",
        "createdAt",
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });

    const formattedProducts = rows.map((product) => ({
      ...product.toJSON(),
      availabilityStatus: product.isAvailable ? "Available" : "Out of Stock",
    }));

    return res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: {
        totalProducts: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
        products: formattedProducts,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching products",
      data: { error: error.message },
    });
  }
};

// Get Product By ID
export const getProductById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findByPk(id, {
      include: [{ model: SubCategory, as: "subCategory", attributes: ["name"] }],
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
        data: null,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Product fetched successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the product",
      data: { error: error.message },
    });
  }
};

// Update Product
export const updateProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const {
      name,
      weight,
      quantity,
      originalPrice,
      discountPercentage,
      description,
      additionalInfo,
      subCategoryId,
    } = req.body;
    const image = req.file;

    const product = await Product.findByPk(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    const updateField = (field, value, parser = (v) => v) => {
      if (value !== undefined && value !== null && value.toString().trim() !== "") {
        product[field] = parser(value);
      }
    };

    updateField("name", name);
    updateField("weight", weight, parseFloat);
    updateField("quantity", quantity, parseInt);
    updateField("originalPrice", originalPrice, parseFloat);
    updateField("discountPercentage", discountPercentage, parseFloat);
    updateField("description", description);
    updateField("additionalInfo", additionalInfo);
    updateField("subCategoryId", subCategoryId, parseInt);

    if (image) {
      product.image = path.join(image.destination, image.filename);
    }

    await product.save();

    return res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the product",
      data: { error: error.message },
    });
  }
};

// Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findByPk(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    await product.destroy();

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: null,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the product",
      data: { error: error.message },
    });
  }
};
