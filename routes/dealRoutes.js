// routes/dealRoutes.js
import express from "express";
import {
  createDeal,
  getDealById,
  updateDeal,
  deleteDeal,
  getDealsOfTheDay,
} from "../controllers/dealController.js";

const router = express.Router();

router.post("/", createDeal);

router.get("/", getDealsOfTheDay);

router.get("/:id", getDealById);

router.put("/:id", updateDeal);

router.delete("/:id", deleteDeal);

export default router;
