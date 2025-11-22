// src/utils/activityLogger.js
import ActivityLog from "../models/ActivityLog.js";

/**
 * Logs admin/company actions (not GPS)
 * @param {Object} user - The user performing the action
 * @param {String} action - Action type, e.g., CREATE_PACKAGE
 * @param {String} target - Target entity, e.g., "Package", "Company"
 * @param {String|ObjectId} targetId - ID of the target entity
 * @param {Object} details - Optional extra info
 */
export const logAdminAction = async (user, action, target, targetId = null, details = {}) => {
  try {
    await ActivityLog.create({
      user: user._id,
      action,
      target,
      targetId,
      details,
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};
