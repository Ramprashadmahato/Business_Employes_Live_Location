import express from "express";
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  requestLeave,
  getAllLeaveRequests,
  updateLeaveStatus,
  getLeaveHistory,
  deleteLeaveRequest,
  checkIn,
  checkOut,
  getRoute,
  getSettings,
  updateSettings,
  verifyLocation,
  getHistory,
  getLiveLocations,
  updateLocation
} from "../controllers/staffController.js";

import { protect, authorize} from "../middleware/authMiddleware.js";
import { autoCheckOut } from "../middleware/autoCheckoutMiddleware.js";
import { validateGPS } from "../middleware/locationMiddleware.js";

const router = express.Router();

// ✅ Apply authentication to ALL staff routes
router.use(protect);

/* ============================================================
   STAFF SELF-SERVICE ROUTES
============================================================ */
// Check-in & Check-out
router.post("/check-in", authorize("STAFF"), validateGPS, autoCheckOut, checkIn);
router.post("/check-out", authorize("STAFF"), validateGPS, checkOut);

// Location update for live tracking
router.post("/update-location", authorize("STAFF"), validateGPS, autoCheckOut, updateLocation);

// Route tracking
router.get("/route", authorize("STAFF"), getRoute);

// Leave Management
router.post("/leave-request", authorize("STAFF"), requestLeave);
router.get("/leave-history", authorize("STAFF"), getLeaveHistory);

// Company/Admin leave management
router.get("/leave-requests", authorize("ADMIN", "ADMIN_STAFF", "COMPANY"), getAllLeaveRequests);
router.put("/leave-status", authorize("ADMIN", "ADMIN_STAFF", "COMPANY"), updateLeaveStatus);
router.delete("/leave-delete", authorize("ADMIN", "ADMIN_STAFF", "COMPANY", "STAFF"), deleteLeaveRequest);

// Staff settings
router.get("/settings", authorize("STAFF"), getSettings);
router.put("/settings", authorize("STAFF"), updateSettings);

// Verify Location
router.post("/verify-location", authorize("STAFF"), verifyLocation);

// Attendance history
router.get("/history", authorize("STAFF"), getHistory);

// Logged-in staff profile
router.get("/me", authorize("STAFF"), async (req, res) => {
  req.params.id = req.user.id;
  await getStaffById(req, res);
});
router.put("/me", authorize("STAFF"), async (req, res) => {
  req.params.id = req.user.id;
  await updateStaff(req, res);
});

/* ============================================================
   ADMIN + ADMIN_STAFF + COMPANY MANAGEMENT ROUTES
============================================================ */
// ✅ Create staff (Admin, Admin Staff with permission, Company)
router.post("/", authorize("ADMIN", "ADMIN_STAFF", "COMPANY"), createStaff);

// ✅ Get all staff
router.get("/", authorize("ADMIN", "ADMIN_STAFF", "COMPANY"),  getAllStaff);

// ✅ Live location tracking
// Admin & Admin Staff → all staff; Company → own staff
router.get("/live-locations", authorize("ADMIN", "ADMIN_STAFF", "COMPANY"), getLiveLocations);

// ✅ View staff by ID
router.get("/:id", authorize("ADMIN", "ADMIN_STAFF", "COMPANY", "STAFF"), getStaffById);

// ✅ Update staff
router.put("/:id", authorize("ADMIN", "ADMIN_STAFF", "COMPANY"), updateStaff);

// ✅ Delete staff
router.delete("/:id", authorize("ADMIN", "ADMIN_STAFF", "COMPANY"),  deleteStaff);

export default router;