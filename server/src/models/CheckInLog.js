import mongoose from "mongoose";

const checkInLogSchema = new mongoose.Schema(
  {
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", required: true },
    companyId: { type: mongoose.Schema.Types.ObjectId, ref: "Company", required: true },

    checkInTime: { type: Date, default: Date.now },
    checkOutTime: { type: Date, default: null },

    checkInLocation: {
      lat: Number,
      lng: Number,
      address: { type: String, default: "Unknown Location" }
    },
    checkOutLocation: {
      lat: Number,
      lng: Number,
      address: { type: String, default: null }
    },

    isSpoofed: { type: Boolean, default: false },
    spoofReason: { type: String, default: "" },

    route: [{
      lat: Number,
      lng: Number,
      accuracy: Number,
      speed: Number,
      timestamp: { type: Date, default: Date.now }
    }],

    totalHours: { type: Number, default: 0 },
    status: { type: String, enum: ["present", "absent", "leave"], default: "present" },

    autoCheckOut: { type: Boolean, default: false },
    autoCheckOutReason: { type: String, default: "" },
  },
  { timestamps: true }
);

// Index for faster queries
checkInLogSchema.index({ staffId: 1, checkInTime: -1 });

const CheckInLog = mongoose.model("CheckInLog", checkInLogSchema);
export default CheckInLog;