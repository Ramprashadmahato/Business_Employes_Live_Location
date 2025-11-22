
import mongoose from "mongoose";

const companySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/\S+@\S+\.\S+/, "Invalid email address"],
    },

    phone: {
      type: String,
      trim: true,
      match: [/^\+?\d{7,15}$/, "Invalid phone number"], // Optional validation
    },

    address: { type: String, trim: true },
    gstOrPan: { type: String, trim: true }, // Add `required: true` if mandatory
    logo: { type: String, default: "" },

    // Package relationship
    packageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
      default: null,
    },

    // Module access derived from package (can override per company)
    imsEnabled: { type: Boolean, default: true },
    payrollEnabled: { type: Boolean, default: false },

    // Staff limit per company
    staffLimit: { type: Number, default: 10 },

    // Status
    status: { type: String, enum: ["active", "inactive"], default: "active" },

    // Configurable settings
    settings: {
      themeColor: { type: String, default: "#0F67B1" },
      workDays: {
        type: [String],
        default: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      },
      holidays: { type: [Date], default: [] },
      trackingInterval: { type: Number, default: 10 }, // in minutes
      fakeLocationDetection: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

// ✅ Pre-save middleware to sync package settings
companySchema.pre("save", async function (next) {
  if (this.isModified("packageId") && this.packageId) {
    const Package = mongoose.model("Package");
    const pkg = await Package.findById(this.packageId);
    if (pkg && pkg.modules) {
      this.imsEnabled = pkg.modules.imsEnabled ?? this.imsEnabled;
      this.payrollEnabled = pkg.modules.payrollEnabled ?? this.payrollEnabled;
      this.staffLimit = pkg.staffLimit ?? this.staffLimit;
    }
  }
  next();
});

export default mongoose.model("Company", companySchema);
