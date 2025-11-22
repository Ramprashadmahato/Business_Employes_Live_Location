
import User from "./User.js";
import mongoose from "mongoose";

// Leave Sub-schema
const leaveSchema = new mongoose.Schema(
  {
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, default: "" },
    status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED"], default: "PENDING" },
  },
  { timestamps: true }
);

const staffSchema = new mongoose.Schema(
  {
    phone: { type: String, trim: true },
    profilePhoto: { type: String, default: "" },

    gpsStatus: { type: Boolean, default: true },
    spoofingDetected: { type: Boolean, default: false },

    // ✅ Add company reference
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

    // Last known location
    lastLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null }
    },

    lastCheckInLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null }
    },
    lastCheckOutLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null }
    },

    routePoints: [
      {
        lat: { type: Number },
        lng: { type: Number },
        timestamp: { type: Date, default: Date.now }
      }
    ],

    checkInHistory: [{ type: mongoose.Schema.Types.ObjectId, ref: "CheckInLog" }],

    shift: {
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "17:00" },
      workdays: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
    },

    lastCheckIn: { type: Date, default: null },
    lastCheckOut: { type: Date, default: null },

    leaves: [leaveSchema],

    attendanceStatus: { type: String, enum: ["present", "absent", "leave"], default: "absent" },
  },
  { timestamps: true }
);

// Methods
staffSchema.methods.isOnLeaveToday = function () {
  const today = new Date().setHours(0, 0, 0, 0);
  return this.leaves.some(
    leave =>
      leave.status === "APPROVED" &&
      new Date(leave.startDate).setHours(0, 0, 0, 0) <= today &&
      new Date(leave.endDate).setHours(0, 0, 0, 0) >= today
  );
};

staffSchema.methods.updateAttendanceStatus = function () {
  if (this.isOnLeaveToday()) {
    this.attendanceStatus = "leave";
  } else if (this.lastCheckIn && !this.lastCheckOut) {
    this.attendanceStatus = "present";
  } else {
    this.attendanceStatus = "absent";
  }
};

const Staff = User.discriminator("STAFF", staffSchema);
export default Staff;
