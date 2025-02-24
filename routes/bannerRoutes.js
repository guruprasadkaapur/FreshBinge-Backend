import express from "express";
import {
  createBanner,
  deleteBanner,
  getAllBanners,
} from "../controllers/bannerController.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post("/", upload.single("image"), createBanner);
router.get("/", getAllBanners);
router.delete("/:id", deleteBanner);

export default router;
