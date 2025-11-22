import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email address"],
      index: true, // Faster queries
    },
    password: { type: String, required: true, select: false }, // Hide by default
    permissions: [{ type: String }],
    role: {
      type: String,
      enum: ["ADMIN", "ADMIN_STAFF", "COMPANY", "STAFF"],
      required: true,
    },
    status: { type: String, enum: ["active", "inactive"], default: "active" },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", default: null },

    // Token-based reset
    resetPasswordToken: String,
    resetPasswordExpire: Date,

    // OTP-based verification
    otp: String,
    otpExpire: Date,
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate reset token (for URL)
userSchema.methods.getResetPasswordToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  this.resetPasswordExpire = Date.now() + 60 * 60 * 1000; // 1 hour
  return resetToken;
};

// Generate OTP for email verification
userSchema.methods.generateOtp = function () {
  const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  this.otp = crypto.createHash("sha256").update(otp).digest("hex");
  this.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
  return otp; // Return plain OTP for sending via email
};

const User = mongoose.model("User", userSchema);
export default User;