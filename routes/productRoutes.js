import express from "express";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/ProductController.js";
import upload from "../utils/multer.js";

import { checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", upload.single("image"), checkRole("admin"), createProduct);

router.get("/", getProducts);

router.get("/:id", getProductById);

router.put("/:id", upload.single("image"), checkRole("admin"), updateProduct);

router.delete("/delete/:id", checkRole("admin"), deleteProduct);

export default router;
