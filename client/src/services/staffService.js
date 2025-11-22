import api from "./api";

/* ============================================================
   ADMIN / COMPANY STAFF MANAGEMENT
============================================================ */

/**
 * Create a new staff (Admin or Company)
 * @param {Object} data - staff details
 */
export const createStaff = async (data) => {
  try {
    const res = await api.post("/staffs", data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to create staff" };
  }
};

/**
 * Get all staff (Admin or Company)
 * @param {string} companyId - Optional company ID to filter staff
 */
export const getAllStaff = async (companyId = "") => {
  try {
    const res = await api.get("/staffs", {
      params: companyId ? { companyId } : {},
    });
    return res.data; // ✅ { success, data: [...] }
  } catch (err) {
    console.error("Error fetching staff list:", err);
    return { success: false, data: [], message: "Failed to fetch staff list" };
  }
};


/**
 * Get staff by ID
 * @param {string} id - staff ID
 */
export const getStaffById = async (id) => {
  try {
    const res = await api.get(`/staffs/${id}`);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to fetch staff details" };
  }
};

/**
 * Update staff by ID (Admin or Company)
 * @param {string} id - staff ID
 * @param {Object} data - fields to update
 */
export const updateStaff = async (id, data) => {
  try {
    const res = await api.put(`/staffs/${id}`, data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to update staff" };
  }
};

/**
 * Delete staff by ID (Admin or Company)
 * @param {string} id - staff ID
 */
export const deleteStaff = async (id) => {
  try {
    const res = await api.delete(`/staffs/${id}`);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to delete staff" };
  }
};

/* ============================================================
   STAFF SELF-SERVICE
============================================================ */

/**
 * Fetch logged-in staff profile (/me)
 */
export const getMyProfile = async () => {
  try {
    const res = await api.get("/staffs/me");
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to fetch profile" };
  }
};

/**
 * Update logged-in staff profile (/me)
 * @param {Object} data - fields to update (name, phone, profilePic, workDays, shiftTime)
 */
export const updateMyProfile = async (data) => {
  try {
    const res = await api.put("/staffs/me", data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to update profile" };
  }
};

/**
 * Verify location (fake GPS / city check)
 * @param {Object} coords - { lat, lng }
 */
export const verifyLocation = async (coords) => {
  try {
    const res = await api.post("/staffs/verify-location", coords);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Location verification failed" };
  }
};

/* ============================================================
   CHECK-IN / CHECK-OUT
============================================================ */

/**
 * GPS Check-In for staff with verification
 */
export const checkIn = async ({ lat, lng }) => {
  try {
    if (lat == null || lng == null) {
      return { success: false, message: "Latitude and longitude required" };
    }

    // Verify location first
    const verifyRes = await verifyLocation({ lat, lng });
    if (!verifyRes.success) return { success: false, message: verifyRes.message };

    const res = await api.post("/staffs/check-in", { lat, lng });
    return res.data;
  } catch (err) {
    console.error("Check-in API error:", err.response?.data || err.message);
    return err.response?.data || { success: false, message: "Check-in failed" };
  }
};

/**
 * GPS Check-Out for staff
 * @param {Object} coords - optional { lat, lng }
 */
export const checkOut = async ({ lat, lng } = {}) => {
  try {
    const res = await api.post("/staffs/check-out", { lat, lng });
    return res.data;
  } catch (err) {
    console.error("Check-out API error:", err.response?.data || err.message);
    return err.response?.data || { success: false, message: "Check-out failed" };
  }
};

/**
 * Get today's route for staff
 */
export const getRoute = async () => {
  try {
    const res = await api.get("/staffs/route");
    return res.data?.success
      ? { success: true, data: res.data.data }
      : { success: false, message: res.data?.message || "Failed to fetch route" };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || err.message || "Failed to fetch route",
    };
  }
};

/* ============================================================
   STAFF SETTINGS ROUTES
============================================================ */

/**
 * Get staff settings
 */
export const getSettings = async () => {
  try {
    const res = await api.get("/staffs/settings");
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to fetch settings" };
  }
};

/**
 * Update staff settings
 * @param {Object} data - fields: name, phone, profilePic, workDays, shiftTime
 */
export const updateSettings = async (data) => {
  try {
    const res = await api.put("/staffs/settings", data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to update settings" };
  }
};

/* ============================================================
   STAFF FULL HISTORY
============================================================ */

/**
 * Get complete attendance/history
 */
export const getHistory = async () => {
  try {
    const res = await api.get("/staffs/history");
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to fetch history" };
  }
};

/* ============================================================
   LEAVE MANAGEMENT
============================================================ */

// Staff Request Leave
export const requestLeave = async (data) => {
  try {
    const res = await api.post("/staffs/leave-request", data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Leave request failed" };
  }
};

// Leave History
export const getLeaveHistory = async () => {
  try {
    const res = await api.get("/staffs/leave-history");
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to fetch leave history" };
  }
};

/**
 * Fetch all leave requests (Company/Admin)
 */
export const getAllLeaveRequests = async () => {
  try {
    const res = await api.get("/staffs/leave-requests");
    return res.data;
  } catch (err) {
    console.error("Get All Leave Requests Error:", err.response?.data || err.message);
    return { success: false, message: err.response?.data?.message || "Failed to fetch leave requests" };
  }
};

// Admin / Company Update Leave Status
export const updateLeaveStatus = async (data) => {
  try {
    const res = await api.put("/staffs/leave-status", data);
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to update leave status" };
  }
};
/**
 * Delete Leave Request
 * - STAFF: can delete own PENDING requests
 * - COMPANY / ADMIN: can delete leave of staff
 * @param {Object} params - { leaveId, staffId (optional) }
 */
export const deleteLeaveRequest = async ({ leaveId, staffId } = {}) => {
  try {
    if (!leaveId) return { success: false, message: "leaveId is required" };

    const body = { leaveId };
    if (staffId) body.staffId = staffId; // Only for COMPANY/ADMIN

    const res = await api.delete("/staffs/leave-delete", { data: body });
    return res.data;
  } catch (err) {
    console.error("Delete Leave Request Error:", err.response?.data || err.message);
    return { success: false, message: err.response?.data?.message || err.message || "Failed to delete leave request" };
  }
};

/* ============================================================
   LIVE LOCATION TRACKING
============================================================ */

/**
 * Get live locations of staff (Admin / Company)
 */
export const getLiveLocations = async () => {
  try {
    const res = await api.get("/staffs/live-locations");
    return res.data;
  } catch (err) {
    console.error("Get Live Locations Error:", err.response?.data || err.message);
    return { success: false, message: err.response?.data?.message || "Failed to fetch live locations" };
  }
};

// update live
export const updateLocation = async ({ lat, lng, accuracy, speed }) => {
  try {
    const res = await api.post("/staff/update-location", { lat, lng, accuracy, speed });
    return res.data;
  } catch (err) {
    return err.response?.data || { success: false, message: "Failed to update location" };
  }
};

