import User from "../models/User.js";

/**
 * Count total staff for a company
 */
export const countTotalStaff = async (companyId) => {
  return await User.countDocuments({ companyId, role: "STAFF" });
};

/**
 * Count active staff for a company
 */
export const countActiveStaff = async (companyId) => {
  return await User.countDocuments({ companyId, role: "STAFF", status: "active" });
};
