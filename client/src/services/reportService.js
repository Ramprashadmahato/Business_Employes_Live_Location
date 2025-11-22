// src/services/reportService.js
import api from "./api";

/**
 * Fetch report (Admin/Company)
 * @param {Object} filters - { companyId, staffId, rangeType, startDate, endDate }
 * @returns {Object} JSON report data
 */
export const getReport = async (filters = {}) => {
  try {
    const response = await api.get("/reports", { params: filters });
    return response.data?.data || {}; // ✅ Safely return data object
  } catch (error) {
    console.error("Error fetching report:", error);
    throw new Error(error?.response?.data?.message || "Failed to fetch report");
  }
};

/**
 * Download report as Excel (Admin/Company)
 * @param {Object} filters - { companyId, staffId, rangeType, startDate, endDate }
 */
export const downloadReport = async (filters = {}) => {
  try {
    const response = await api.get("/reports", {
      params: { ...filters, export: "excel" }, // ✅ Required for Excel export
      responseType: "blob", // ✅ Important for file download
    });

    // Create Blob from response
    const blob = new Blob([response.data], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    // Dynamic filename with company/staff info
    const timestamp = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
    const identifier = filters.staffId
      ? `Staff_${filters.staffId}`
      : filters.companyId
      ? `Company_${filters.companyId}`
      : "All";
    const filename = `Staff_Report_${identifier}_${timestamp}.xlsx`;

    // Trigger download
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
    return true; // ✅ Indicate success
  } catch (error) {
    console.error("Error downloading report:", error);
    throw new Error(error?.response?.data?.message || "Failed to download report");
  }
};


/**
 * Fetch report for a single staff (optional staffId)
 * If staffId is not provided, fetches report for all staff
 * @param {string} staffId
 * @param {Object} filters
 */
export const getStaffReport = async (staffId = "", filters = {}) => {
  return getReport(staffId ? { ...filters, staffId } : filters);
};

/**
 * Fetch report for a single company (optional companyId)
 * If companyId is not provided, fetches report for all companies
 * @param {string} companyId
 * @param {Object} filters
 */
export const getCompanyReport = async (companyId = "", filters = {}) => {
  return getReport(companyId ? { ...filters, companyId } : filters);
};