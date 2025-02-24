import express from "express";
import {
  addFeedback,
  updateFeedback,
  deleteFeedback,
  getProductFeedback,
} from "../controllers/feedbackController.js";
import { checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/",  addFeedback);

router.put("/:id", checkRole("user"), updateFeedback);

router.delete("/:id", checkRole("user"), deleteFeedback);

router.get("/product/:productId", checkRole("admin"), getProductFeedback);

export default router;
