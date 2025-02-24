import express from "express";
import {
  createOrder,
  getAllOrders,
  getMonthlyOrders,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { checkRole } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", checkRole("user"), createOrder);
router.get("/", checkRole("admin"), getAllOrders);
router.put("/:orderId/status", checkRole("admin"), updateOrderStatus);
router.get("/monthlyOrders", checkRole("admin"), getMonthlyOrders);
export default router;
