// src/services/systemConfigService.js
import api from "./api"; // Axios instance

/**
 * Fetch the system configuration for the logged-in user (Admin or Company)
 * @returns {Object} system configuration
 */
export const getSystemConfig = async () => {
  try {
    const response = await api.get("/system-config");
    return response.data.data; // return config object
  } catch (error) {
    console.error(
      "Error fetching system configuration:",
      error.response?.data || error.message
    );
    throw error.response?.data || { message: "Failed to fetch system configuration" };
  }
};

/**
 * Update the system configuration for the logged-in user (Admin or Company)
 * @param {Object} data - config data to update
 *   Admin can send: locationTrackingInterval, staffLimitPerCompany, enableFakeLocationDetection, themeColor, dateFormat, timeFormat, holidays, workWeekDays
 *   Company can send: themeColor, dateFormat, timeFormat, holidays, workWeekDays, companyDetails
 * @returns {Object} updated system configuration
 */
export const updateSystemConfig = async (data) => {
  try {
    const response = await api.put("/system-config", data);
    return response.data.data; // updated config object
  } catch (error) {
    console.error(
      "Error updating system configuration:",
      error.response?.data || error.message
    );
    throw error.response?.data || { message: "Failed to update system configuration" };
  }
};
