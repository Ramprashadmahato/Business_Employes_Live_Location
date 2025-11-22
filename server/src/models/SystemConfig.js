import mongoose from "mongoose";

const systemConfigSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["admin", "company"],
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: function () {
        return this.type === "company";
      },
    },
    // Admin-only fields
    locationTrackingInterval: {
      type: Number,
      default: 5,
      min: 1,
      max: 60,
    },
    staffLimitPerCompany: {
      type: Number,
      default: 50,
      min: 1,
    },
    enableFakeLocationDetection: {
      type: Boolean,
      default: true,
    },
    // Common fields
    themeColor: {
      type: String,
      default: "#0d6efd",
      trim: true,
      validate: {
        validator: v => /^#([0-9A-F]{3}){1,2}$/i.test(v),
        message: props => `${props.value} is not a valid HEX color`,
      },
    },
    dateFormat: {
      type: String,
      enum: ["DD-MM-YYYY", "MM-DD-YYYY"],
      default: "DD-MM-YYYY",
    },
    timeFormat: {
      type: String,
      enum: ["12-hour", "24-hour"],
      default: "24-hour",
    },
    holidays: {
      type: [
        {
          date: { type: Date, required: true },
          description: { type: String, trim: true, default: "" },
        },
      ],
      default: [],
    },
    workWeekDays: {
      type: [String],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      default: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    },
  },
  { timestamps: true }
);

// Index for faster queries
systemConfigSchema.index({ type: 1, companyId: 1 });

export default mongoose.model("SystemConfig", systemConfigSchema);