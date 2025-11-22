import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import Company from "../models/Company.js";
import User from "../models/User.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { countActiveStaff, countTotalStaff } from "../utils/companyHelpers.js";
import { logAdminAction } from "../utils/activityLogger.js";

/**
 * =====================================
 * ADMIN & ADMIN_STAFF: CREATE COMPANY
 * =====================================
 */
export const createCompany = async (req, res) => {
  try {
    // ✅ Role check
    if (req.user.role !== "ADMIN" && req.user.role !== "ADMIN_STAFF") {
      return errorResponse(res, "Access denied", 403);
    }

    const { name, email, phone, address, gstOrPan, packageId, password } = req.body;

    // Check unique email
    const emailUsed = (await Company.findOne({ email })) || (await User.findOne({ email }));
    if (emailUsed) return errorResponse(res, "Company already exists with this email", 400);

    // Fetch package if selected
    let pkg = null;
    if (packageId) {
      const Package = mongoose.model("Package");
      pkg = await Package.findById(packageId);
      if (!pkg) return errorResponse(res, "Invalid package selected", 400);
    }

    // Auto-apply package settings OR defaults
    const finalIMS = pkg ? pkg.modules.imsEnabled : true;
    const finalPayroll = pkg ? pkg.modules.payrollEnabled : false;
    const finalStaffLimit = pkg ? pkg.staffLimit : 10;

    // Create Company
    const company = await Company.create({
      name,
      email,
      phone,
      address,
      gstOrPan,
      packageId: packageId || null,
      imsEnabled: finalIMS,
      payrollEnabled: finalPayroll,
      staffLimit: finalStaffLimit,
    });

    // Default password
    const finalPassword = password || "company123";

    // Create login user for company
    const companyUser = await User.create({
      name,
      email,
      password: finalPassword, // pre-save hook will hash it
      role: "COMPANY",
      companyId: company._id,
    });

    await logAdminAction(req.user, "CREATE_COMPANY", "Company", company._id);

    return successResponse(res, { company, companyUser, password: finalPassword }, "Company created successfully");
  } catch (err) {
    console.error("Create Company Error:", err);
    return errorResponse(res, "Server error while creating company");
  }
};

/**
 * =====================================
 * ADMIN & ADMIN_STAFF: GET ALL COMPANIES
 * =====================================
 */
export const getCompanies = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "ADMIN_STAFF") {
      return errorResponse(res, "Access denied", 403);
    }

    const companies = await Company.find().populate("packageId", "name staffLimit modules").lean();

    for (let company of companies) {
      company.totalStaff = await countTotalStaff(company._id);
      company.activeStaff = await countActiveStaff(company._id);
    }

    return successResponse(res, companies, "Companies fetched successfully");
  } catch (err) {
    console.error("Get Companies Error:", err);
    return errorResponse(res, "Error fetching companies");
  }
};

/**
 * =====================================
 * ADMIN & ADMIN_STAFF: GET COMPANY BY ID
 * =====================================
 */
export const getCompanyById = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "ADMIN_STAFF") {
      return errorResponse(res, "Access denied", 403);
    }

    const company = await Company.findById(req.params.id).populate("packageId", "name staffLimit modules").lean();
    if (!company) return errorResponse(res, "Company not found", 404);

    company.totalStaff = await countTotalStaff(company._id);
    company.activeStaff = await countActiveStaff(company._id);

    return successResponse(res, company, "Company details fetched successfully");
  } catch (err) {
    console.error("Get Company By ID Error:", err);
    return errorResponse(res, "Error fetching company details");
  }
};

/**
 * =====================================
 * ADMIN & ADMIN_STAFF: UPDATE COMPANY
 * =====================================
 */
export const updateCompany = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "ADMIN_STAFF") {
      return errorResponse(res, "Access denied", 403);
    }

    const updates = { ...req.body };
    delete updates._id;
    delete updates.email;

    // If admin changes the packageId → auto-update settings
    if (updates.packageId) {
      const Package = mongoose.model("Package");
      const pkg = await Package.findById(updates.packageId);
      if (pkg) {
        updates.imsEnabled = pkg.modules.imsEnabled;
        updates.payrollEnabled = pkg.modules.payrollEnabled;
        updates.staffLimit = pkg.staffLimit;
      }
    }

    const company = await Company.findByIdAndUpdate(req.params.id, updates, { new: true }).populate(
      "packageId",
      "name staffLimit modules"
    );

    if (!company) return errorResponse(res, "Company not found", 404);

    await logAdminAction(req.user, "UPDATE_COMPANY", "Company", company._id);

    return successResponse(res, company, "Company updated successfully");
  } catch (err) {
    console.error("Update Company Error:", err);
    return errorResponse(res, "Error updating company");
  }
};

/**
 * =====================================
 * ADMIN & ADMIN_STAFF: DELETE COMPANY
 * =====================================
 */
export const deleteCompany = async (req, res) => {
  try {
    if (req.user.role !== "ADMIN" && req.user.role !== "ADMIN_STAFF") {
      return errorResponse(res, "Access denied", 403);
    }

    const company = await Company.findById(req.params.id);
    if (!company) return errorResponse(res, "Company not found", 404);

    await User.deleteMany({ companyId: company._id });
    await company.deleteOne();

    await logAdminAction(req.user, "DELETE_COMPANY", "Company", company._id);

    return successResponse(res, null, "Company deleted successfully");
  } catch (err) {
    console.error("Delete Company Error:", err);
    return errorResponse(res, "Error deleting company");
  }
};

/**
 * =====================================
 * COMPANY DASHBOARD (Self-Service)
 * =====================================
 */
export const getCompanyProfile = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return errorResponse(res, "No company linked to this user", 400);

    const company = await Company.findById(companyId).populate("packageId", "name staffLimit modules").lean();
    if (!company) return errorResponse(res, "Company not found", 404);

    company.totalStaff = await countTotalStaff(company._id);
    company.activeStaff = await countActiveStaff(company._id);

    return successResponse(res, company, "Company profile fetched successfully");
  } catch (err) {
    console.error("Get Company Profile Error:", err);
    return errorResponse(res, "Server error while fetching company profile");
  }
};

export const updateCompanyProfile = async (req, res) => {
  try {
    const companyId = req.user?.companyId;
    if (!companyId) return errorResponse(res, "No company linked to this user", 400);

    const updates = { ...req.body };

    // Password handling
    if (updates.password) {
      if (updates.password.length < 6) return errorResponse(res, "Password must be at least 6 characters", 400);

      const hashed = await bcrypt.hash(updates.password, 10);
      await User.findOneAndUpdate({ companyId }, { password: hashed });

      delete updates.password;
    }

    // Restrict fields
    delete updates._id;
    delete updates.email;
    delete updates.packageId;

    const updatedCompany = await Company.findByIdAndUpdate(companyId, updates, { new: true }).populate(
      "packageId",
      "name staffLimit modules"
    );

    if (!updatedCompany) return errorResponse(res, "Company not found", 404);

    return successResponse(res, updatedCompany, "Profile updated successfully");
  } catch (err) {
    console.error("Update Company Profile Error:", err);
    return errorResponse(res, "Server error while updating company profile");
  }
};