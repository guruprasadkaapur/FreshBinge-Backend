import express from "express";
import {
  createSubcategory,
  getAllSubcategories,
  getSubcategoryById,
  updateSubcategory,
  deleteSubcategory,
} from "../controllers/subcategoryController.js";
import { checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", checkRole("admin"), createSubcategory);

router.get("/", getAllSubcategories);

router.get("/:id", getSubcategoryById);

router.put("/:id", checkRole("admin"), updateSubcategory);

router.delete("/:id", deleteSubcategory);

export default router;
