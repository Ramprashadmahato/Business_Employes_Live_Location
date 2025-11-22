import mongoose from "mongoose";

const packageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, default: "" },

    // Modules access
    modules: {
      imsEnabled: { type: Boolean, default: true },
      payrollEnabled: { type: Boolean, default: false },
    },

    // Staff limit per company for this package
    staffLimit: { type: Number, default: 50, min: 1 },

    // Price (optional)
    price: { type: Number, default: 0, min: 0 },

    // Optional additional features
    features: [{ type: String, trim: true }],

    // Status
    status: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Package", packageSchema);
