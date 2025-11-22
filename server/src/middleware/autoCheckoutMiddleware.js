import CheckInLog from "../models/CheckInLog.js";
import Staff from "../models/Staff.js";
import SystemConfig from "../models/SystemConfig.js";

export const autoCheckOut = async (req, res, next) => {
  try {
    const staffId = req.user.id;

    const [lastLog, staff, config] = await Promise.all([
      CheckInLog.findOne({ staffId, checkOutTime: null }).sort({ checkInTime: -1 }),
      Staff.findById(staffId),
      SystemConfig.findOne({ type: "admin" })
    ]);

    if (!lastLog || !staff) return next();

    const now = new Date();
    const inactivityLimit = config?.autoCheckoutInactivity || 30; // minutes

    // Calculate shift end time
    const shiftEndTime = new Date(lastLog.checkInTime);
    const [hours, minutes] = staff.shift.endTime.split(":");
    shiftEndTime.setHours(hours, minutes, 0, 0);

    const lastRouteTimestamp = lastLog.route.length
      ? lastLog.route[lastLog.route.length - 1].timestamp
      : lastLog.checkInTime;

    const inactiveDuration = (now - new Date(lastRouteTimestamp)) / (1000 * 60); // minutes

    // Auto-checkout conditions
    if (
      inactiveDuration > inactivityLimit ||
      now >= shiftEndTime ||
      !staff.gpsStatus ||
      staff.spoofingDetected
    ) {
      lastLog.checkOutTime = now;
      lastLog.totalHours = ((now - lastLog.checkInTime) / (1000 * 60 * 60)).toFixed(2);
      lastLog.autoCheckOut = true;

      if (inactiveDuration > inactivityLimit) lastLog.autoCheckOutReason = `Inactive > ${inactivityLimit} mins`;
      else if (now >= shiftEndTime) lastLog.autoCheckOutReason = "Shift ended";
      else if (!staff.gpsStatus) lastLog.autoCheckOutReason = "GPS turned off";
      else if (staff.spoofingDetected) lastLog.autoCheckOutReason = "Spoofing detected";

      await lastLog.save();

      staff.lastCheckOut = now;
      staff.activeLogId = null;
      await staff.save();
    }

    next();
  } catch (err) {
    console.error("Auto-checkout error:", err.message);
    next();
  }
};