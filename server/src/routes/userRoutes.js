import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  requestChangePasswordOtp,
  changePasswordWithOtp,
} from "../controllers/userController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------- User Management ----------------

// Get all users (Admin only)
router.get("/", protect, authorize("ADMIN"), getAllUsers);

// Get single user (Admin or self)
router.get("/:id", protect, getUserById);

// Update user details (Admin or self)
router.put("/:id", protect, updateUser);

// Delete user (Admin only)
router.delete("/:id", protect, authorize("ADMIN"), deleteUser);

// ---------------- Password Change (Logged-in User) ----------------

// Request OTP for password change
router.post("/request-change-password-otp", protect, requestChangePasswordOtp);

// Change password after OTP verification
router.post("/change-password-with-otp", protect, changePasswordWithOtp);

export default router;