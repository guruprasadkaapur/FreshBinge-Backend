import Subcategory from "../models/SubCategory.js";
import Category from "../models/Category.js";

// Create Subcategory
export const createSubcategory = async (req, res) => {
  try {
    const { name, description, categoryId } = req.body;

    if (!name || !description || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Name, description, and categoryId are required",
      });
    }

    // Validate if category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Invalid categoryId: Category does not exist",
      });
    }

    const subcategory = await Subcategory.create({ name, description, categoryId });

    return res.status(201).json({
      success: true,
      message: "Subcategory created successfully",
      data: subcategory,
    });
  } catch (error) {
    console.error("Error creating subcategory:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while creating the subcategory",
      data: { error: error.message },
    });
  }
};

// Get All Subcategories
export const getAllSubcategories = async (req, res) => {
  try {
    const subcategories = await Subcategory.findAll({
      include: [{ model: Category, attributes: ["id", "name", "description"] }],
    });

    return res.status(200).json({
      success: true,
      message: subcategories.length ? "Subcategories fetched successfully" : "No subcategories found",
      data: subcategories.length ? subcategories : null,
    });
  } catch (error) {
    console.error("Error fetching subcategories:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching subcategories",
      data: { error: error.message },
    });
  }
};

// Get Subcategory By ID
export const getSubcategoryById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
    }

    const subcategory = await Subcategory.findByPk(id, {
      include: [{ model: Category, attributes: ["id", "name", "description"] }],
    });

    if (!subcategory) {
      return res.status(404).json({ success: false, message: "Subcategory not found", data: null });
    }

    return res.status(200).json({ success: true, message: "Subcategory fetched successfully", data: subcategory });
  } catch (error) {
    console.error("Error fetching subcategory:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the subcategory",
      data: { error: error.message },
    });
  }
};

// Update Subcategory
export const updateSubcategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
    }

    const { name, description, categoryId } = req.body;

    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: "Subcategory not found", data: null });
    }

    // Validate categoryId if provided
    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Invalid categoryId: Category does not exist",
        });
      }
      subcategory.categoryId = categoryId;
    }

    // Update only provided fields
    const updateField = (field, value) => {
      if (value !== undefined && value !== null && value.toString().trim() !== "") {
        subcategory[field] = value;
      }
    };

    updateField("name", name);
    updateField("description", description);

    await subcategory.save();

    return res.status(200).json({
      success: true,
      message: "Subcategory updated successfully",
      data: subcategory,
    });
  } catch (error) {
    console.error("Error updating subcategory:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the subcategory",
      data: { error: error.message },
    });
  }
};

// Delete Subcategory
export const deleteSubcategory = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, message: "Invalid subcategory ID" });
    }

    const subcategory = await Subcategory.findByPk(id);
    if (!subcategory) {
      return res.status(404).json({ success: false, message: "Subcategory not found", data: null });
    }

    await subcategory.destroy();

    return res.status(200).json({
      success: true,
      message: "Subcategory deleted successfully",
      data: null,
    });
  } catch (error) {
    console.error("Error deleting subcategory:", error);

    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the subcategory",
      data: { error: error.message },
    });
  }
};
