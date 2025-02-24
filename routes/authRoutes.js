import express from "express";
import {
  requestLoginOTP,
  verifyLoginOTP,
  registerUser,
  verifyOTP,
  updateUserProfile,
  registerAdmin,
  loginAdmin,
  getAllUsers,
  deleteUser,
  getTotalUsers,
} from "../controllers/authController.js";
import { checkRole } from "../middleware/authMiddleware.js";
import upload from "../utils/multer.js";

const router = express.Router();

router.post("/registerUser", upload.single("image"), registerUser);
router.post("/verifyOtp", verifyOTP);
router.post("/login/request-otp", requestLoginOTP);
router.post("/login/verify-otp", verifyLoginOTP);
router.put("/updateUser/:id", checkRole("user"), updateUserProfile);
router.get("/getTotalUsers", getTotalUsers);

router.post("/admin/registerAdmin", registerAdmin);
router.post("/admin/loginAdmin", loginAdmin);
router.get("/getUsers", getAllUsers);
router.delete("/deleteUser/:id", deleteUser);

export default router;
