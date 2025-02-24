import path from "path";
import Category from "../models/Category.js";

// Create Category
export const createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const image = req.file;

    if (!name || !description || !image) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and image are required",
      });
    }

    const category = await Category.create({
      name,
      description,
      image: path.join(image.destination, image.filename),
    });

    return res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error creating category:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the category",
      data: { error: error.message },
    });
  }
};

// Get All Categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();

    return res.status(200).json({
      success: true,
      message: categories.length ? "Categories fetched successfully" : "No categories found",
      data: categories.length ? categories : null,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching categories",
      data: { error: error.message },
    });
  }
};

// Get Category By ID
export const getCategoryById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found", data: null });
    }

    return res.status(200).json({ success: true, message: "Category fetched successfully", data: category });
  } catch (error) {
    console.error("Error fetching category by ID:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the category",
      data: { error: error.message },
    });
  }
};

// Update Category
export const updateCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const { name, description } = req.body;
    const image = req.file;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found", data: null });
    }

    const updateField = (field, value) => {
      if (value !== undefined && value !== null && value.toString().trim() !== "") {
        category[field] = value;
      }
    };

    updateField("name", name);
    updateField("description", description);
    if (image) {
      category.image = path.join(image.destination, image.filename);
    }

    await category.save();

    return res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Error updating category:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the category",
      data: { error: error.message },
    });
  }
};

// Delete Category
export const deleteCategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid category ID" });
    }

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({ success: false, message: "Category not found", data: null });
    }

    await category.destroy();

    return res.status(200).json({
      success: true,
      message: "Category deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting category:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the category",
      data: { error: error.message },
    });
  }
};
