import express from "express";
import {
  registerUser,
  loginUser,
  logoutUser,
  forgotPasswordHybrid, // New hybrid flow
  verifyOtp,            // OTP verification
  resetPasswordHybrid,  // Reset after OTP
} from "../controllers/authController.js";

import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------- Public Routes ----------------

// Register a new user
router.post("/register", registerUser);

// Login
router.post("/login", loginUser);

// Hybrid Forgot Password (generate token + send OTP)
router.post("/forgot-password-hybrid", forgotPasswordHybrid);

// Verify OTP
router.post("/verify-otp", verifyOtp);

// Reset Password after OTP verification
router.post("/reset-password-hybrid", resetPasswordHybrid);

// ---------------- Protected Routes ----------------

// Logout
router.post("/logout", protect, logoutUser);

// // Example protected routes
// router.get("/admin-dashboard", protect, authorize("ADMIN"), (req, res) => {
//   res.json({ message: `Welcome Admin ${req.user.name}` });
// });

// router.get("/company-dashboard", protect, authorize("COMPANY"), (req, res) => {
//   res.json({ message: `Welcome Company ${req.user.name}` });
// });

// router.get("/staff-dashboard", protect, authorize("STAFF"), (req, res) => {
//   res.json({ message: `Welcome Staff ${req.user.name}` });
// });

export default router;