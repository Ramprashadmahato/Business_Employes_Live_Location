import express from "express";
import { addAdminStaff, listAdminStaff, updateAdminStaff, deleteAdminStaff } from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/add", protect, authorize("ADMIN"), addAdminStaff);
router.get("/list", protect, authorize("ADMIN"), listAdminStaff);
router.put("/update", protect, authorize("ADMIN"), updateAdminStaff);
router.delete("/:id", protect, authorize("ADMIN"), deleteAdminStaff);

export default router;