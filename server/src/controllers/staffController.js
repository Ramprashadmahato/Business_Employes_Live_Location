import mongoose from "mongoose";
import Staff from "../models/Staff.js";
import Company from "../models/Company.js";
import CheckInLog from "../models/CheckInLog.js";
import SystemConfig from "../models/SystemConfig.js";
import { detectSpoof, getCityByCoords } from "../utils/gpsUtils.js";
import axios from "axios";

// ---------------- Helper constants ----------------

const VALID_STATUSES = ["active", "inactive"];

// ---------------- Create Staff ----------------
export const createStaff = async (req, res) => {
  try {
    const { name, email, password, phone, companyId } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, message: "Name and email are required" });
    }

    // ✅ Permission check for Admin Staff
    if (req.user.role === "ADMIN_STAFF" && !req.user.permissions.includes("STAFF_MANAGE")) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    // Validate email format
    const emailRegex = /\S+@\S+\.\S+/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    let company;
    if (req.user.role === "ADMIN" || req.user.role === "ADMIN_STAFF") {
      company = await Company.findById(companyId);
    } else if (req.user.role === "COMPANY") {
      company = await Company.findById(req.user.companyId);
    }

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found" });
    }

    // Staff limit check
    const staffCount = await Staff.countDocuments({ companyId: company._id });
    const staffLimit = company.staffLimit || 50;
    if (staffCount >= staffLimit) {
      return res.status(400).json({ success: false, message: "Staff limit reached" });
    }

    const existing = await Staff.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: "Email already exists" });
    }

    const finalPassword = password || "staff123";

    const staff = await Staff.create({
      name,
      email,
      password: finalPassword,
      phone,
      companyId: company._id,
      role: "STAFF",
      status: "inactive",
      gpsStatus: false,
    });

    const { password: _, ...staffData } = staff.toObject();
    return res.status(201).json({
      success: true,
      message: "Staff created successfully",
      data: staffData,
    });
  } catch (err) {
    console.error("Create Staff Error:", err.message);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// ---------------- Get All Staff ----------------
export const getAllStaff = async (req, res) => {
  try {
    const { companyId, search, page = 1, limit = 10 } = req.query;
    const pageNum = Number(page);
    const limitNum = Number(limit);

    // ✅ Permission check for Admin Staff
    if (req.user.role === "ADMIN_STAFF" && !req.user.permissions.includes("STAFF_MANAGE")) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    const filter = {};
    if (req.user.role === "COMPANY") {
      filter.companyId = req.user.companyId;
    } else if (companyId) {
      filter.companyId = companyId;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }

    const staffList = await Staff.find(filter)
      .populate("companyId", "name email")
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    const total = await Staff.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: staffList,
      total,
      page: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    console.error("Get All Staff Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Get Staff by ID ----------------
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).populate("companyId", "name email");
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    // ✅ Permission check for Admin Staff
    if (req.user.role === "ADMIN_STAFF" && !req.user.permissions.includes("STAFF_MANAGE")) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    if (
      (req.user.role === "COMPANY" && staff.companyId._id.toString() !== req.user.companyId) ||
      (req.user.role === "STAFF" && staff._id.toString() !== req.user.id)
    ) {
      return res.status(403).json({ success: false, message: "Access forbidden" });
    }

    res.status(200).json({ success: true, data: staff });
  } catch (err) {
    console.error("Get Staff By ID Error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ---------------- Update Staff ----------------
export const updateStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    // ✅ Permission check for Admin Staff
    if (req.user.role === "ADMIN_STAFF" && !req.user.permissions.includes("STAFF_MANAGE")) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    if ((req.user.role === "COMPANY" && staff.companyId.toString() !== req.user.companyId) ||
        (req.user.role === "STAFF" && staff._id.toString() !== req.user.id))
      return res.status(403).json({ success: false, message: "Access forbidden" });

    const { name, phone, status } = req.body;
    if (name) staff.name = name;
    if (phone) staff.phone = phone;
    if (status && VALID_STATUSES.includes(status.toLowerCase())) staff.status = status.toLowerCase();

    await staff.save();
    const { password: _, ...staffData } = staff.toObject();
    res.status(200).json({ success: true, message: "Staff updated successfully", data: staffData });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Delete Staff ----------------
export const deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    // ✅ Permission check for Admin Staff
    if (req.user.role === "ADMIN_STAFF" && !req.user.permissions.includes("STAFF_MANAGE")) {
      return res.status(403).json({ success: false, message: "Permission denied" });
    }

    if (req.user.role === "COMPANY" && staff.companyId.toString() !== req.user.companyId)
      return res.status(403).json({ success: false, message: "Access forbidden" });

    await staff.deleteOne();
    res.status(200).json({ success: true, message: "Staff deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// get live location

export const getLiveLocations = async (req, res) => {
  try {
    let config;
    let staffList;

    if (req.user.role === "ADMIN" || req.user.role === "ADMIN_STAFF") {
      config = await SystemConfig.findOne({ type: "admin" });
      staffList = await Staff.find({ gpsStatus: true })
        .populate({ path: "companyId", select: "name email" }) // ✅ Correct populate
        .sort({ lastCheckIn: -1 });
    } else if (req.user.role === "COMPANY") {
      config = await SystemConfig.findOne({ type: "company", companyId: req.user.companyId });
      staffList = await Staff.find({ companyId: req.user.companyId, gpsStatus: true })
        .populate({ path: "companyId", select: "name email" })
        .sort({ lastCheckIn: -1 });
    } else {
      return res.status(403).json({ success: false, message: "Forbidden: insufficient permissions" });
    }

    if ((req.user.role === "ADMIN" || req.user.role === "ADMIN_STAFF") && config?.staffLimitPerCompany) {
      staffList = staffList.slice(0, config.staffLimitPerCompany);
    }

    const liveData = staffList.map((staff) => {
      const lastCheckInLog = staff.checkInHistory?.[staff.checkInHistory.length - 1] || null;

      const location =
        lastCheckInLog?.checkInLocation ||
        staff.lastCheckInLocation ||
        staff.lastLocation ||
        { lat: 27.7172, lng: 85.324 }; // Fallback: Kathmandu

      return {
        _id: staff._id,
        name: staff.name, // ✅ Comes from User base schema
        phone: staff.phone,
        company: staff.companyId?.name || "N/A", // ✅ Will now work
        gpsStatus: staff.gpsStatus,
        lastCheckIn: lastCheckInLog?.checkInTime || staff.lastCheckIn,
        lastCheckOut: lastCheckInLog?.checkOutTime || staff.lastCheckOut,
        location,
        isSpoofed: lastCheckInLog?.isSpoofed || false,
        spoofReason: lastCheckInLog?.spoofReason || "",
        routePoints: staff.routePoints || []
      };
    });

    res.status(200).json({
      success: true,
      data: liveData,
      config: {
        themeColor: config?.themeColor || "#4f46e5",
        dateFormat: config?.dateFormat || "YYYY-MM-DD",
        timeFormat: config?.timeFormat || "HH:mm",
        holidays: config?.holidays || [],
        workWeekDays: config?.workWeekDays || ["Mon", "Tue", "Wed", "Thu", "Fri"],
        locationTrackingInterval: config?.locationTrackingInterval || 5,
        staffLimitPerCompany: config?.staffLimitPerCompany || null,
        enableFakeLocationDetection: config?.enableFakeLocationDetection || false,
      },
    });
  } catch (err) {
    console.error("Get Live Locations Error:", err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};
// ---------------- Update Live Location ----------------
export const updateLocation = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { lat, lng, accuracy, speed } = req.body;

    if (!lat || !lng) return res.status(400).json({ success: false, message: "Coordinates required" });
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ success: false, message: "Invalid coordinates" });
    }

    const staff = await Staff.findById(staffId);
    if (!staff || !staff.gpsStatus) return res.status(400).json({ success: false, message: "Not checked in" });

    const log = await CheckInLog.findOne({ staffId, checkOutTime: null });
    if (!log) return res.status(400).json({ success: false, message: "No active check-in" });

    const config = await SystemConfig.findOne({ type: "company", companyId: staff.companyId });
    const isSpoof = config?.enableFakeLocationDetection ? detectSpoof(lat, lng) : false;

    // ✅ Append route point to CheckInLog
    log.route.push({ lat, lng, accuracy: accuracy || null, speed: speed || null, timestamp: new Date() });

    if (isSpoof) {
      log.isSpoofed = true;
      log.spoofReason = "Fake GPS detected during tracking";
      staff.spoofingDetected = true;
    }

    // ✅ Update staff last location and routePoints
    staff.lastLocation = { lat, lng, updatedAt: new Date() };
    staff.routePoints.push({ lat, lng, timestamp: new Date() });

    await Promise.all([log.save(), staff.save()]);

    res.status(200).json({ success: true, message: "Location updated", data: { lat, lng, isSpoof } });
  } catch (err) {
    console.error("Update Location Error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};


// ---------------- Check-In ----------------
export const checkIn = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { lat, lng } = req.body;

    if (!lat || !lng) return res.status(400).json({ success: false, message: "Latitude & longitude required" });

    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    const config = await SystemConfig.findOne({ type: "company", companyId: staff.companyId });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Holiday & workday checks
    const isHoliday = config?.holidays?.some(h => new Date(h).toDateString() === today.toDateString());
    if (isHoliday) return res.status(400).json({ success: false, message: "Today is a holiday" });

    const todayDay = today.toLocaleDateString("en-US", { weekday: "short" });
    if (config?.workWeekDays && !config.workWeekDays.includes(todayDay)) {
      return res.status(400).json({ success: false, message: "Today is not a working day" });
    }

    // Leave check
    const onLeave = staff.leaves.some(
      leave => leave.status === "APPROVED" &&
      new Date(leave.startDate) <= today &&
      new Date(leave.endDate) >= today
    );
    if (onLeave) return res.status(400).json({ success: false, message: "You are on approved leave today" });

    const isSpoof = config?.enableFakeLocationDetection ? detectSpoof(lat, lng) : false;
    const locationName = await getCityByCoords(lat, lng) || "Unknown Location";

    const log = await CheckInLog.create({
      staffId,
      companyId: staff.companyId,
      checkInTime: new Date(),
      checkInLocation: { lat, lng, address: locationName },
      isSpoofed: isSpoof,
      spoofReason: isSpoof ? "Fake GPS detected" : "",
    });

    // ✅ Update staff fields
    staff.lastCheckIn = log.checkInTime;
    staff.lastCheckInLocation = { lat, lng, updatedAt: new Date() };
    staff.lastLocation = { lat, lng, updatedAt: new Date() };
    staff.routePoints.push({ lat, lng, timestamp: new Date() });
    staff.gpsStatus = true;
    staff.checkInHistory.push(log._id); // ✅ Ensure history is updated
    await staff.save();

    res.status(200).json({ success: true, message: "Checked in successfully", data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ---------------- Check-Out ----------------
export const checkOut = async (req, res) => {
  try {
    const staffId = req.user.id;
    const { lat, lng } = req.body;

    const staff = await Staff.findById(staffId);
    if (!staff.gpsStatus)
      return res.status(400).json({ success: false, message: "You are not checked in" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch system config
    const config =
      req.user.role === "ADMIN"
        ? await SystemConfig.findOne({ type: "admin" })
        : await SystemConfig.findOne({ type: "company", companyId: staff.companyId });

    // Holiday check
    const isHoliday = config?.holidays?.some((h) => new Date(h).toDateString() === today.toDateString());
    if (isHoliday) return res.status(400).json({ success: false, message: "Today is a holiday" });

    // Workday check
    const todayDay = today.toLocaleDateString("en-US", { weekday: "short" });
    if (config?.workWeekDays && !config.workWeekDays.includes(todayDay)) {
      return res.status(400).json({ success: false, message: "Today is not a working day" });
    }

    // Leave check
    const onLeave = staff.leaves.some(
      (leave) =>
        leave.status === "APPROVED" &&
        new Date(leave.startDate) <= today &&
        new Date(leave.endDate) >= today
    );
    if (onLeave) return res.status(400).json({ success: false, message: "You are on approved leave today" });

    const log = await CheckInLog.findOne({ staffId, checkOutTime: null }).sort({ checkInTime: -1 });
    if (!log) return res.status(400).json({ success: false, message: "No active check-in" });

    const locationName = await getCityByCoords(lat, lng) || "Unknown Location";

    log.checkOutTime = new Date();
    log.checkOutLocation = { lat, lng, address: locationName };
    log.totalHours = ((log.checkOutTime - log.checkInTime) / (1000 * 60 * 60)).toFixed(2);
    await log.save();

    // ✅ Update staff location fields
    staff.lastCheckOut = log.checkOutTime;
    staff.lastCheckOutLocation = { lat, lng, updatedAt: new Date() };
    staff.lastLocation = { lat, lng, updatedAt: new Date() };
    staff.routePoints.push({ lat, lng, timestamp: new Date() });
    staff.gpsStatus = false;
    await staff.save();

    res.status(200).json({ success: true, message: "Checked out successfully", data: log });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Today's Route ----------------
export const getRoute = async (req, res) => {
  try {
    const staffId = req.user.id;
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const logs = await CheckInLog.find({ staffId, checkInTime: { $gte: startOfDay } }).sort({ checkInTime: 1 });

    const route = logs.map(log => ({
      checkIn: log.checkInTime,
      checkOut: log.checkOutTime,
      totalHours: log.totalHours || 0,
      status: log.status || "present",
      checkInLocation: log.checkInLocation,
      checkOutLocation: log.checkOutLocation,
      routePoints: log.route || [], // ✅ Full route points for today
      isSpoofed: log.isSpoofed,
      spoofReason: log.spoofReason,
    }));

    res.status(200).json({ success: true, data: route });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Attendance History ----------------
export const getHistory = async (req, res) => {
  try {
    const staffId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const logs = await CheckInLog.find({ staffId })
      .sort({ checkInTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const history = logs.map(log => ({
      date: log.checkInTime.toLocaleDateString(),
      checkIn: log.checkInTime,
      checkOut: log.checkOutTime,
      totalHours: log.totalHours || 0,
      status: log.status || "present",
      checkInLocation: log.checkInLocation,
      checkOutLocation: log.checkOutLocation,
      routePoints: log.route || [], // ✅ Include route points for each log
      isSpoofed: log.isSpoofed,
      spoofReason: log.spoofReason,
    }));

    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ---------------- Verify Location ----------------
export const verifyLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;

    if (lat === undefined || lng === undefined)
      return res.status(400).json({ success: false, message: "Coordinates required" });

    const isSpoof = detectSpoof(lat, lng);
    if (isSpoof)
      return res.status(200).json({ success: false, message: "Fake location detected" });

    const city = await getCityByCoords(lat, lng);
    if (!city)
      return res.status(200).json({ success: false, message: "You are not in an allowed area" });

    res.status(200).json({ success: true, message: "Location valid", data: { city } });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
// ---------------- Staff Settings ----------------
export const getSettings = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    res.status(200).json({
      success: true,
      data: {
        name: staff.name,
        phone: staff.phone,
        profilePic: staff.profilePic || null,
        workDays: staff.workDays || [],
        shiftTime: staff.shiftTime || { start: "09:00", end: "18:00" },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};



export const updateSettings = async (req, res) => {
  try {
    const staff = await Staff.findById(req.user.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    const { name, phone, profilePic, workdays, shift } = req.body;

    if (name) staff.name = name;
    if (phone) staff.phone = phone;
    if (profilePic !== undefined) staff.profilePhoto = profilePic;
    if (Array.isArray(workdays)) staff.shift.workdays = workdays;
    if (shift && shift.startTime && shift.endTime) staff.shift = shift;

    await staff.save();

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: {
        name: staff.name,
        phone: staff.phone,
        profilePhoto: staff.profilePhoto || null,
        workdays: staff.shift.workdays,
        shift: staff.shift,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ============================================================
   STAFF → GET LEAVE HISTORY
============================================================ */
export const getLeaveHistory = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "STAFF") {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }

    const staffId = req.user.id;
    const staff = await Staff.findById(staffId).select("leaves").lean();
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    const sortedLeaves = staff.leaves.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const paginatedLeaves = sortedLeaves.slice((page - 1) * limit, page * limit);

    return res.status(200).json({ success: true, data: paginatedLeaves });
  } catch (error) {
    console.error("Leave History Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   STAFF → REQUEST LEAVE
============================================================ */
export const requestLeave = async (req, res) => {
  try {
    if (!req.user || req.user.role !== "STAFF") {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }

    const { startDate, endDate, reason } = req.body;
    if (!startDate || !endDate) return res.status(400).json({ success: false, message: "Start and end dates required" });

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (isNaN(start) || isNaN(end)) return res.status(400).json({ success: false, message: "Invalid date format" });
    if (start > end) return res.status(400).json({ success: false, message: "Start date cannot be after end date" });

    const staff = await Staff.findById(req.user.id);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    staff.leaves.push({ startDate: start, endDate: end, reason: reason || "Not provided", status: "PENDING" });
    await staff.save();

    res.status(200).json({ success: true, message: "Leave request submitted successfully", data: staff.leaves });
  } catch (error) {
    console.error("Leave Request Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
/* ============================================================
   COMPANY/ADMIN → GET ALL LEAVE REQUESTS
============================================================ */
export const getAllLeaveRequests = async (req, res) => {
  try {
    if (!req.user || !["COMPANY", "ADMIN"].includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }

    const filter = req.user.role === "COMPANY" ? { companyId: req.user.companyId } : {};
    const staffList = await Staff.find(filter).select("name leaves").lean();

    const allLeaves = staffList.flatMap(staff =>
      staff.leaves.map(leave => ({
        _id: leave._id,
        staffId: staff._id,
        staffName: staff.name,
        startDate: leave.startDate,
        endDate: leave.endDate,
        reason: leave.reason,
        status: leave.status,
      }))
    );

    res.status(200).json({ success: true, data: allLeaves });
  } catch (error) {
    console.error("Get All Leave Requests Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


/* ============================================================
   COMPANY/ADMIN → APPROVE OR REJECT LEAVE
============================================================ */
export const updateLeaveStatus = async (req, res) => {
  try {
    const { staffId, leaveId, status } = req.body;
    if (!staffId || !leaveId || !status) {
      return res.status(400).json({ success: false, message: "staffId, leaveId, and status required" });
    }
    if (!["APPROVED", "REJECTED"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }

    const staff = await Staff.findById(staffId);
    if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

    if (req.user.role === "COMPANY" && staff.companyId.toString() !== req.user.companyId) {
      return res.status(403).json({ success: false, message: "You do not have permission" });
    }

    const leave = staff.leaves.id(leaveId);
    if (!leave) return res.status(404).json({ success: false, message: "Leave request not found" });

    if (leave.status !== "PENDING") {
      return res.status(400).json({ success: false, message: "Leave already processed" });
    }

    leave.status = status;
    await staff.save();

    res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()} successfully`, data: leave });
  } catch (error) {
    console.error("Leave Status Update Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   DELETE LEAVE REQUEST
   - STAFF: can delete own PENDING requests only
   - COMPANY: can delete any of their staff requests anytime
   - ADMIN: can delete any leave request anytime
============================================================ */
export const deleteLeaveRequest = async (req, res) => {
  try {
    const { staffId, leaveId } = req.body;
    if (!leaveId) return res.status(400).json({ success: false, message: "leaveId required" });

    let staff;

    if (req.user.role === "STAFF") {
      staff = await Staff.findById(req.user.id);
      if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

      const leaveIndex = staff.leaves.findIndex((l) => l._id.toString() === leaveId);
      if (leaveIndex === -1) return res.status(404).json({ success: false, message: "Leave request not found" });

      if (staff.leaves[leaveIndex].status !== "PENDING")
        return res.status(403).json({ success: false, message: "Cannot delete approved/rejected leave" });

      staff.leaves.splice(leaveIndex, 1); // Remove from array
      await staff.save();
      return res.status(200).json({ success: true, message: "Leave request deleted successfully" });
    }

    if (req.user.role === "COMPANY" || req.user.role === "ADMIN") {
      if (!staffId) return res.status(400).json({ success: false, message: "staffId required" });
      staff = await Staff.findById(staffId);
      if (!staff) return res.status(404).json({ success: false, message: "Staff not found" });

      if (req.user.role === "COMPANY" && staff.companyId.toString() !== req.user.companyId)
        return res.status(403).json({ success: false, message: "You do not have permission to delete this leave" });

      const leaveIndex = staff.leaves.findIndex((l) => l._id.toString() === leaveId);
      if (leaveIndex === -1) return res.status(404).json({ success: false, message: "Leave request not found" });

      staff.leaves.splice(leaveIndex, 1); // Remove from array
      await staff.save();
      return res.status(200).json({ success: true, message: "Leave request deleted successfully" });
    }

    res.status(403).json({ success: false, message: "Forbidden" });
  } catch (error) {
    console.error("Delete Leave Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};