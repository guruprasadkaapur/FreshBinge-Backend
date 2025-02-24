import User from "../models/User.js";
import { generateOTP, sendOTP } from "../utils/otp.js";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
const JWT_SECRET = process.env.JWT_SECRET;

export const registerUser = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    mobileNumber,
    address,
    postCode,
    location,
    role,
  } = req.body;
  const image = req.file;

  try {
    if (!firstName || !lastName || !email || !mobileNumber) {
      return res.status(400).json({
        success: false,
        message: "Email and mobile number are required",
      });
    }

    const existingUser = await User.findOne({
      where: { [Op.or]: [{ email }, { mobileNumber }] },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or mobile number already in use, please login",
      });
    }

    const otp = generateOTP();
    const userRole = role === "admin" ? "admin" : "user";
    let imagePath = image ? `${image.destination}${image.filename}` : null;

    const newUser = await User.create({
      firstName,
      lastName,
      email,
      mobileNumber,
      address,
      postCode,
      location,
      image: imagePath,
      otp,
      role: userRole,
      isVerified: false,
    });

    sendOTP(mobileNumber, otp);

    res.status(201).json({
      success: true,
      message:
        "User registered successfully. Please verify your account with the OTP.",
      user: {
        id: newUser.id,
        firstName,
        lastName,
        email,
        mobileNumber,
        role: newUser.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during user registration",
      data: { error: error.message },
    });
  }
};

export const verifyOTP = async (req, res) => {
  const { mobileNumber, otp } = req.body;

  try {
    const user = await User.findOne({ where: { mobileNumber } });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    if (user.otp !== otp)
      return res.status(400).json({ success: false, message: "Invalid OTP" });

    user.isVerified = true;
    user.otp = null;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You can now log in",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during OTP verification",
      data: { error: error.message },
    });
  }
};

// Resend OTP
export const resendOTP = async (req, res) => {
  const { mobileNumber } = req.body;

  try {
    const user = await User.findOne({ where: { mobileNumber } });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    await user.save();
    sendOTP(mobileNumber, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your mobile number.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while resending OTP",
      data: { error: error.message },
    });
  }
};

// Request OTP for login
export const requestLoginOTP = async (req, res) => {
  const { mobileNumber } = req.body;

  try {
    const user = await User.findOne({ where: { mobileNumber } });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    const otp = generateOTP();
    user.otp = otp;
    await user.save();
    sendOTP(mobileNumber, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully. Please check your mobile number.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while requesting OTP",
      data: { error: error.message },
    });
  }
};

// Verify OTP and Generate JWT Token
export const verifyLoginOTP = async (req, res) => {
  const { mobileNumber, otp } = req.body;

  try {
    const user = await User.findOne({ where: { mobileNumber } });
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (String(user.otp).trim() !== String(otp).trim()) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    user.otp = null;
    await user.save();

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      success: true,
      message: "OTP verified successfully. You are now logged in.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during OTP verification",
      data: { error: error.message },
    });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, email, address, postCode, location } = req.body;

  try {
    const user = await User.findByPk(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    Object.assign(user, {
      firstName,
      lastName,
      email,
      address,
      postCode,
      location,
    });
    await user.save();

    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while updating the profile",
      data: { error: error.message },
    });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json({ success: true, users });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching users",
      data: { error: error.message },
    });
  }
};

// Delete user
export const deleteUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findByPk(id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    await user.destroy();
    res
      .status(200)
      .json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while deleting the user",
      data: { error: error.message },
    });
  }
};

// Get total users
export const getTotalUsers = async (req, res) => {
  try {
    const totalUsers = await User.count();
    res.status(200).json({ success: true, totalUsers });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching total users",
      data: { error: error.message },
    });
  }
};

export const registerAdmin = async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    mobileNumber,
    password,
    confirmPassword,
  } = req.body;

  try {
    if (!email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, password, and confirm password are required",
      });
    }

    if (password !== confirmPassword) {
      return res
        .status(400)
        .json({ success: false, message: "Passwords do not match" });
    }

    const existingAdmin = await User.findOne({
      where: { email, role: "admin" },
    });

    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: "Admin with this email already exists",
      });
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newAdmin = await User.create({
      firstName,
      lastName,
      email,
      mobileNumber,
      password: hashedPassword,
      role: "admin",
      isVerified: true,
    });

    res.status(201).json({
      success: true,
      message: "Admin registered successfully.",
      data: {
        id: newAdmin.id,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during admin registration",
      data: { error: error.message },
    });
  }
};

export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const admin = await User.findOne({ where: { email, role: "admin" } });

    if (!admin) {
      return res
        .status(404)
        .json({ success: false, message: "Admin not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, admin.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin.id, role: admin.role }, JWT_SECRET, {
      expiresIn: "30d",
    });

    res.status(200).json({
      success: true,
      message: "Admin logged in successfully.",
      data: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "An error occurred during admin login",
      data: { error: error.message },
    });
  }
};
