// src/routes/reportRoutes.js
import express from "express";
import { generateReport } from "../controllers/reportController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @route   GET /api/reports
 * @desc    Generate attendance/report
 *          - Admin: can filter any company or staff
 *          - Company: can filter only their own staff
 * @query   rangeType=daily|weekly|monthly|yearly (optional)
 * @query   startDate, endDate (optional, custom date range)
 * @query   companyId (optional, Admin only)
 * @query   staffId (optional)
 * @query   export=excel (optional, to download Excel)
 * @access  Admin / Company
 */
router.get("/", protect, authorize("ADMIN", "COMPANY"), generateReport);

export default router;
