import jwt from "jsonwebtoken";
import User from "../models/User.js";

// ---------------- Protect Middleware ----------------
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ success: false, message: "User not found" });
    }

    // Attach user info to request
    req.user = {
      id: user._id.toString(),
      role: user.role,
      companyId: user.companyId?.toString() || null,
      email: user.email,
      name: user.name,
      permissions: user.permissions || [],
    };

    next();
  } catch (err) {
    console.error("Auth Error:", err.message);
    const message = err.name === "TokenExpiredError" ? "Token expired" : "Token invalid";
    return res.status(401).json({ success: false, message });
  }
};

// ---------------- Authorize by Role ----------------
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User missing" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient role permissions" });
    }

    next();
  };
};

// ---------------- Authorize by Permissions ----------------
export const authorizePermissions = (...requiredPermissions) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "User missing" });
    }

    const hasPermission = requiredPermissions.every(p => req.user.permissions.includes(p));
    if (!hasPermission) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    next();
  };
};