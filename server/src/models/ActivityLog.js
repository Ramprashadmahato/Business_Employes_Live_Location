// src/models/ActivityLog.js
import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema(
  {
    user: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",   // refers to Admin or Company user
      required: true 
    },
    action: { 
      type: String, 
      required: true 
    }, // e.g., CREATE_PACKAGE, UPDATE_COMPANY
    target: { 
      type: String 
    }, // e.g., "Package", "Company"
    targetId: { 
      type: mongoose.Schema.Types.ObjectId 
    }, // reference to target document
    details: { 
      type: Object, 
      default: {} 
    }, // optional extra info about action
    timestamp: { 
      type: Date, 
      default: Date.now 
    }
  },
  { timestamps: true } // automatically adds createdAt & updatedAt
);

export default mongoose.model("ActivityLog", activityLogSchema);
