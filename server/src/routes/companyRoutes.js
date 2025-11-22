
import express from "express";
import { protect, authorize } from "../middleware/authMiddleware.js";
import {
  createCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  getCompanyProfile,
  updateCompanyProfile,
} from "../controllers/companyController.js";

const router = express.Router();

// ==========================
// All routes require login
// ==========================
router.use(protect);

// ==========================
// Company Dashboard Routes
// (Only COMPANY role can access)
// ==========================
router.get("/profile", authorize("COMPANY"), getCompanyProfile);      
router.put("/profile", authorize("COMPANY"), updateCompanyProfile);

// ==========================
// Admin Routes
// Apply ADMIN role authorization ONLY to routes below
// ==========================
router.use(authorize("ADMIN", "ADMIN_STAFF"));

router.post("/", createCompany);      
router.get("/", getCompanies);        
router.get("/:id", getCompanyById);   
router.put("/:id", updateCompany);    
router.delete("/:id", deleteCompany);

export default router;