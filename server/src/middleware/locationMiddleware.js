import { detectSpoof, getCityByCoords, isWithinAllowedArea } from "../utils/gpsUtils.js";
import Company from "../models/Company.js";

export const validateGPS = async (req, res, next) => {
  try {
    const { lat, lng } = req.body;
    if (lat === undefined || lng === undefined) {
      return res.status(400).json({ success: false, message: "Latitude & longitude required" });
    }

    // Validate numeric range
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return res.status(400).json({ success: false, message: "Invalid coordinates" });
    }

    // Detect spoofing
    if (detectSpoof(lat, lng)) {
      return res.status(400).json({ success: false, message: "Fake GPS detected" });
    }

    // Optional: check allowed radius if company config exists
    if (req.user.role === "STAFF" && req.user.companyId) {
      const company = await Company.findById(req.user.companyId);
      if (company?.hqLat && company?.hqLng) {
        if (!isWithinAllowedArea(lat, lng, company.hqLat, company.hqLng)) {
          return res.status(400).json({ success: false, message: "Out of allowed area" });
        }
      }
    }

    // Optional: reverse geocode
    const address = await getCityByCoords(lat, lng);

    req.coords = { lat, lng, address };
    next();
  } catch (error) {
    console.error("GPS Validation Error:", error.message);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};