import express from "express";
import {
  addToWishlist,
  removeFromWishlist,
  getUserWishlist,
} from "../controllers/wishlistController.js";
import { checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", checkRole("user"), addToWishlist);

router.delete("/:userId/:productId", checkRole("user"), removeFromWishlist);

router.get("/:userId", checkRole("user"), getUserWishlist);

export default router;
