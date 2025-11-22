import User from "../models/User.js";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";

// Generate JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, permissions: user.permissions }, // ✅ Include permissions
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ---------------- Register User ----------------
export const registerUser = async (req, res) => {
  const { name, email, password, role, permissions } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ success: false, message: "User already exists" });

    const user = await User.create({ name, email, password, role, permissions });
    res.status(201).json({
      success: true,
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions, // ✅ Include permissions
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Login User ----------------
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(400).json({ success: false, message: "Invalid email or password" });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ success: false, message: "Invalid email or password" });

    res.status(200).json({
      success: true,
      token: generateToken(user),
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.permissions, // ✅ Include permissions
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Logout User ----------------
export const logoutUser = async (req, res) => {
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// ---------------- Forgot Password Hybrid ----------------
export const forgotPasswordHybrid = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    // Generate reset token and OTP
    const resetToken = user.getResetPasswordToken();
    const otp = user.generateOtp();
    await user.save({ validateBeforeSave: false });

    // Configure Nodemailer
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Send OTP email
    await transporter.sendMail({
      from: `"Business Sarthi" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset OTP",
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
    });

    res.status(200).json({
      success: true,
      message: "OTP sent to your email. Verify OTP to reset password.",
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Verify OTP ----------------
export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (user.otp !== hashedOtp || user.otpExpire < Date.now()) {
      return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
    }

    // ✅ Clear OTP after successful verification
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: "OTP verified. You can now reset your password." });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Reset Password After OTP ----------------
export const resetPasswordHybrid = async (req, res) => {
  const { email, newPassword } = req.body;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    user.otp = undefined;
    user.otpExpire = undefined;

    await user.save();

    res.status(200).json({ success: true, message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};