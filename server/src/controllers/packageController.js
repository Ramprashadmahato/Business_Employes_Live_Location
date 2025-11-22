import Package from "../models/Package.js";
import Company from "../models/Company.js";
import { successResponse, errorResponse } from "../utils/responseFormatter.js";
import { logAdminAction } from "../utils/activityLogger.js";

// ---------------- Create Package ----------------
export const createPackage = async (req, res) => {
  try {
    const { name, description, modules, staffLimit, price, features } = req.body;

    if (!name) return errorResponse(res, "Package name is required", 400);

    const existing = await Package.findOne({ name: name.trim() });
    if (existing) return errorResponse(res, "Package already exists with this name", 400);

    const newPackage = await Package.create({
      name: name.trim(),
      description: description?.trim() || "",
      modules: {
        imsEnabled: modules?.imsEnabled ?? true,
        payrollEnabled: modules?.payrollEnabled ?? false,
      },
      staffLimit: staffLimit || 50,
      price: price || 0,
      features: features || [],
    });

    await logAdminAction(req.user, "CREATE_PACKAGE", "Package", newPackage._id);

    return successResponse(res, newPackage, "Package created successfully");
  } catch (err) {
    console.error("Create Package Error:", err);
    return errorResponse(res, "Server error while creating package");
  }
};

// ---------------- Get All Packages ----------------
export const getAllPackages = async (req, res) => {
  try {
    const packages = await Package.find().sort({ createdAt: -1 }).lean();
    return successResponse(res, packages, "Packages fetched successfully");
  } catch (err) {
    console.error("Get Packages Error:", err);
    return errorResponse(res, "Error fetching packages");
  }
};

// ---------------- Get Package By ID ----------------
export const getPackageById = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id).lean();
    if (!pkg) return errorResponse(res, "Package not found", 404);

    return successResponse(res, pkg, "Package details fetched successfully");
  } catch (err) {
    console.error("Get Package By ID Error:", err);
    return errorResponse(res, "Error fetching package details");
  }
};


// ---------------- Update Package ----------------
export const updatePackage = async (req, res) => {
  try {
    const { name, description, modules, staffLimit, price, features, status } = req.body;

    const updatedPackage = await Package.findByIdAndUpdate(
      req.params.id,
      {
        ...(name && { name: name.trim() }),
        ...(description && { description: description.trim() }),
        ...(modules && { modules }),
        ...(staffLimit && { staffLimit }),
        ...(price !== undefined && { price }),
        ...(features && { features }),
        ...(status && { status }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedPackage) return errorResponse(res, "Package not found", 404);

    // 🔥 Auto-update all companies using this package
    await Company.updateMany(
      { packageId: updatedPackage._id },
      {
        imsEnabled: updatedPackage.modules?.imsEnabled ?? true,
        payrollEnabled: updatedPackage.modules?.payrollEnabled ?? false,
        staffLimit: updatedPackage.staffLimit ?? 10,
      }
    );

    await logAdminAction(req.user, "UPDATE_PACKAGE", "Package", updatedPackage._id);

    return successResponse(res, updatedPackage, "Package updated & companies synced");
  } catch (err) {
    console.error("Update Package Error:", err);
    return errorResponse(res, "Error updating package");
  }
};


// ---------------- Delete Package ----------------
export const deletePackage = async (req, res) => {
  try {
    const pkg = await Package.findById(req.params.id);
    if (!pkg) return errorResponse(res, "Package not found", 404);

    // Check if any company is using this package
    const usedBy = await Company.findOne({ packageId: pkg._id });
    if (usedBy) return errorResponse(res, "Package is assigned to a company and cannot be deleted", 400);

    await pkg.deleteOne();
    await logAdminAction(req.user, "DELETE_PACKAGE", "Package", pkg._id);

    return successResponse(res, null, "Package deleted successfully");
  } catch (err) {
    console.error("Delete Package Error:", err);
    return errorResponse(res, "Error deleting package");
  }
};
