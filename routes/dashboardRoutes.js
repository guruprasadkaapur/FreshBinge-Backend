import express from "express";
import {
  getEarnings,
  getTopSellingProducts,
  getTotalCustomers,
  getTotalOrders,
} from "../controllers/dashboardController.js";
import { checkRole } from "../middleware/authMiddleware.js";
const router = express.Router();

router.get("/totalorders", checkRole("admin"), getTotalOrders);
router.get("/getTotalCustomers", checkRole("admin"), getTotalCustomers);
router.get("/earnings", checkRole("admin"), getEarnings);
router.get("/topProducts", checkRole("admin"), getTopSellingProducts);

export default router;
