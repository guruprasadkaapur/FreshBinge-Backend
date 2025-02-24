import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { checkRole } from "../middleware/authMiddleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

// Create a new category
router.post(
  "/create",
  upload.single("image"),
  checkRole("admin"),
  createCategory
);

// Get all categories
router.get("/", getAllCategories);

// Get a single category by ID
router.get("/:id", getCategoryById);

// Update a category by ID
router.put("/:id", upload.single("image"), checkRole("admin"), updateCategory);

// Delete a category by ID
router.delete("/:id", checkRole("admin"), deleteCategory);

export default router;
