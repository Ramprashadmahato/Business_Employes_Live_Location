import SystemConfig from "../models/SystemConfig.js";
import Company from "../models/Company.js"; // Company model for updating company details

// @desc Get system configuration
// @route GET /api/system-config
// @access Admin / Company
export const getSystemConfig = async (req, res) => {
  try {
    let config;

    if (req.user.role === "COMPANY") {
      config = await SystemConfig.findOne({ type: "company", companyId: req.user.companyId });
      if (!config) {
        // Auto-create default config for company
        config = new SystemConfig({
          type: "company",
          companyId: req.user.companyId,
          themeColor: "#3b82f6",
          dateFormat: "DD-MM-YYYY",
          timeFormat: "24-hour",
          holidays: [],
          workWeekDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        });
        await config.save();
      }
    } else if (req.user.role === "ADMIN") {
      config = await SystemConfig.findOne({ type: "admin" });
      if (!config) {
        // Auto-create default admin config
        config = new SystemConfig({
          type: "admin",
          locationTrackingInterval: 5,
          staffLimitPerCompany: 50,
          enableFakeLocationDetection: true,
          themeColor: "#0d6efd",
          dateFormat: "DD-MM-YYYY",
          timeFormat: "24-hour",
          holidays: [],
          workWeekDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        });
        await config.save();
      }
    } else {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }

    res.status(200).json({ success: true, data: config });
  } catch (error) {
    console.error("Get System Config Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

export const updateSystemConfig = async (req, res) => {
  try {
    const { role, companyId } = req.user;
    const {
      themeColor,
      dateFormat,
      timeFormat,
      holidays,
      workWeekDays,
      locationTrackingInterval,
      staffLimitPerCompany,
      enableFakeLocationDetection,
      companyDetails,
    } = req.body;

    let config;

    if (role === "COMPANY") {
      config = await SystemConfig.findOne({ type: "company", companyId }) || new SystemConfig({ type: "company", companyId });

      // Validate and update company settings
      if (themeColor && !/^#([0-9A-F]{3}){1,2}$/i.test(themeColor)) return res.status(400).json({ success: false, message: "Invalid theme color" });
      if (themeColor) config.themeColor = themeColor;
      if (dateFormat) config.dateFormat = dateFormat;
      if (timeFormat) config.timeFormat = timeFormat;
      if (holidays) config.holidays = holidays;
      if (workWeekDays) config.workWeekDays = workWeekDays;

      if (companyDetails) {
        await Company.findByIdAndUpdate(companyId, companyDetails, { new: true });
      }
    } else if (role === "ADMIN") {
      config = await SystemConfig.findOne({ type: "admin" }) || new SystemConfig({ type: "admin" });

      // Validate admin-only fields
      if (themeColor && !/^#([0-9A-F]{3}){1,2}$/i.test(themeColor)) return res.status(400).json({ success: false, message: "Invalid theme color" });
      if (themeColor) config.themeColor = themeColor;
      if (dateFormat) config.dateFormat = dateFormat;
      if (timeFormat) config.timeFormat = timeFormat;
      if (holidays) config.holidays = holidays;
      if (workWeekDays) config.workWeekDays = workWeekDays;
      if (locationTrackingInterval && (locationTrackingInterval < 1 || locationTrackingInterval > 60)) return res.status(400).json({ success: false, message: "Invalid GPS interval" });
      if (locationTrackingInterval) config.locationTrackingInterval = locationTrackingInterval;
      if (staffLimitPerCompany) config.staffLimitPerCompany = staffLimitPerCompany;
      if (enableFakeLocationDetection !== undefined) config.enableFakeLocationDetection = enableFakeLocationDetection;
    } else {
      return res.status(403).json({ success: false, message: "Forbidden: Insufficient permissions" });
    }

    await config.save();
    res.status(200).json({ success: true, message: "Configuration updated successfully", data: config });
  } catch (error) {
    console.error("Update System Config Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};