// src/server.js
import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import companyRoutes from "./routes/companyRoutes.js";
import staffRoutes from "./routes/staffRoutes.js";
import packageRoutes from "./routes/packageRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import systemConfigRoutes from "./routes/systemConfigRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

import cors from "cors";

dotenv.config();

const app = express();

// ---------------- Middleware ----------------
app.use(cors());                 // Enable CORS
app.use(express.json());         // Parse JSON bodies

// ---------------- Connect Database ----------------
connectDB();

// ---------------- Routes ----------------
app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.use("/api/auth", authRoutes); 
app.use("/api/users", userRoutes);
app.use("/api/companies", companyRoutes);
app.use("/api/staffs", staffRoutes);
app.use("/api/packages", packageRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/system-config", systemConfigRoutes);
app.use("/api/admin", adminRoutes);



// ---------------- Error Handling ----------------
app.use((req, res, next) => {
  res.status(404).json({ message: "Route not found" });
});

// Global error handler (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error", error: err.message });
});

// ---------------- Start Server ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});
