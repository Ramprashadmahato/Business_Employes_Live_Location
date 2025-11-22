

import axios from "axios";

// Detect spoofing (basic logic)
export const detectSpoof = (lat, lng) => {
  // Example: unrealistic coordinates or sudden jumps
  if (!lat || !lng) return true;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return true;
  return false; // Replace with advanced logic if needed
};

// Check if within allowed radius (Haversine formula)
export const isWithinAllowedArea = (lat, lng, hqLat, hqLng, radius = 5000) => {
  const toRad = (val) => (val * Math.PI) / 180;
  const R = 6371e3; // Earth radius in meters
  const dLat = toRad(lat - hqLat);
  const dLng = toRad(lng - hqLng);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(hqLat)) * Math.cos(toRad(lat)) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance <= radius;
};

// Reverse geocode using OpenStreetMap
export const getCityByCoords = async (lat, lng) => {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`;
    const { data } = await axios.get(url);
    return data.address?.city || data.address?.town || data.address?.village || "Unknown Location";
  } catch {
    return "Unknown Location";
  }
};