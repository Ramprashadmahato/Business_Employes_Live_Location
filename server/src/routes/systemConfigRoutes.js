import express from "express";
import { getSystemConfig, updateSystemConfig } from "../controllers/systemConfigController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// ---------------- Middleware ----------------
// Protect all routes (authentication required)
router.use(protect);

// ---------------- Routes ----------------

/**
 * @route GET /api/system-config
 * @desc Fetch system configuration
 * @access Admin / Company
 * Note: Admin gets global config, Company gets own company config
 */
router.get("/", authorize("ADMIN", "COMPANY"), getSystemConfig);

/**
 * @route PUT /api/system-config
 * @desc Update system configuration
 * @access Admin / Company
 * Note: Admin can update all fields; Company can update theme, date/time, holidays, workWeekDays, and companyDetails
 */
router.put("/", authorize("ADMIN", "COMPANY"), updateSystemConfig);

export default router;
