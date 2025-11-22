import User from "../models/User.js";
import crypto from "crypto";
import nodemailer from "nodemailer";

// ---------------- Get all users (Admin only) ----------------
export const getAllUsers = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access forbidden: Admin only" });
    }

    const users = await User.find().select("-password");
    res.status(200).json({ success: true, users });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------- Get single user ----------------
export const getUserById = async (req, res) => {
  try {
    const userId = req.params.id;

    // Only admin or the user themselves can access
    if (req.user.role !== "ADMIN" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    const user = await User.findById(userId)
      .select("-password")
      .populate({
        path: "companyId",
        select: "name phone address gstOrPan logo status"
      });

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Get User Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------- Update user details ----------------
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

    // Only admin or the user themselves can update
    if (req.user.role !== "ADMIN" && req.user.id !== userId) {
      return res.status(403).json({ message: "Access forbidden" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { name, email, phone, address, gstOrPan, role, status, permissions } = req.body;

    // Common fields
    if (name) user.name = name;
    if (email) user.email = email;

    // Admin can update role, status, permissions
    if (req.user.role === "ADMIN") {
      if (role) user.role = role;
      if (status) user.status = status;
      if (permissions) user.permissions = permissions;
    }

    // If user is COMPANY, update Company model fields
    if (user.role === "COMPANY" && user.companyId) {
      const company = await Company.findById(user.companyId);
      if (company) {
        if (phone) company.phone = phone;
        if (address) company.address = address;
        if (gstOrPan) company.gstOrPan = gstOrPan;
        await company.save();
      }
    }

    // If user is STAFF, update phone in User model
    if (user.role === "STAFF" && phone) {
      user.phone = phone;
    }

    await user.save();
    res.status(200).json({ success: true, message: "User updated successfully", user });
  } catch (err) {
    console.error("Update User Error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
// ---------------- Delete user (Admin only) ----------------
export const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Access forbidden: Admin only" });
    }

    const userId = req.params.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    await user.deleteOne();
    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// ---------------- Request OTP for Password Change ----------------
export const requestChangePasswordOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const otp = user.generateOtp();
    await user.save({ validateBeforeSave: false });

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
    });

    await transporter.sendMail({
      from: `"Business Sarthi" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Change OTP",
      text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    });

    res.status(200).json({ success: true, message: "OTP sent to email" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// ---------------- Verify OTP & Change Password ----------------
export const changePasswordWithOtp = async (req, res) => {
  const { otp, newPassword } = req.body;
  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedOtp = crypto.createHash("sha256").update(otp).digest("hex");
    if (user.otp !== hashedOtp || user.otpExpire < Date.now()) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.password = newPassword;
    user.otp = undefined;
    user.otpExpire = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};