import express from "express";
import {
  addToCart,
  removeFromCart,
  getCart,
} from "../controllers/cartController.js";
import { checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

// Cart routes
router.post("/", checkRole("user"), addToCart);
router.delete("/:cartId", checkRole("user"), removeFromCart);
router.get("/:userId", checkRole("user"), getCart);

export default router;
