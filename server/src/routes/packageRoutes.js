import express from "express";
import {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage
} from "../controllers/packageController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------- Admin Protection ----------------
// Only authenticated users with ADMIN or SUPER_ADMIN roles can access package routes
router.use(protect);
router.use(authorize("ADMIN", "ADMIN_STAFF"));

// ---------------- Package Routes ----------------

// Create a new package
router.post("/", createPackage);

// Get all packages
router.get("/", getAllPackages);

// Get a single package by ID
router.get("/:id", getPackageById);

// Update a package by ID
router.put("/:id", updatePackage);

// Delete a package by ID
router.delete("/:id", deletePackage);

export default router;