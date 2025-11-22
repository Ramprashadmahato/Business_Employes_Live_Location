
import React, { useState, useEffect } from "react";
import StaffLayout from "../../components/layout/StaffLayout";
import { getSettings, updateSettings } from "../../services/staffService";
import { requestChangePasswordOtp, changePasswordWithOtp } from "../../services/userService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const Settings = () => {
  const [staff, setStaff] = useState({
    name: "",
    phone: "",
    workDays: [],
    shiftTime: { start: "09:00", end: "18:00" },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // OTP states
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpData, setOtpData] = useState({ otp: "", newPassword: "" });
  const [otpLoading, setOtpLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  // Fetch Settings
  useEffect(() => {
    const fetchSettings = async () => {
      setLoading(true);
      try {
        const res = await getSettings();
        if (res.success && res.data) {
          setStaff({
            name: res.data.name || "",
            phone: res.data.phone || "",
            workDays: res.data.workDays || [],
            shiftTime: res.data.shiftTime || { start: "09:00", end: "18:00" },
          });
        } else {
          toast.info("No settings found, using defaults.");
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load settings.");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Handle Form Change
  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "shiftStart") {
      setStaff((prev) => ({ ...prev, shiftTime: { ...prev.shiftTime, start: value } }));
    } else if (name === "shiftEnd") {
      setStaff((prev) => ({ ...prev, shiftTime: { ...prev.shiftTime, end: value } }));
    } else if (name.startsWith("workDay_")) {
      const day = name.split("_")[1];
      setStaff((prev) => {
        const workDays = prev.workDays.includes(day)
          ? prev.workDays.filter((d) => d !== day)
          : [...prev.workDays, day];
        return { ...prev, workDays };
      });
    } else {
      setStaff((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Save Settings
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: staff.name,
        phone: staff.phone,
        workdays: staff.workDays,
        shift: {
          startTime: staff.shiftTime.start,
          endTime: staff.shiftTime.end,
        },
      };

      const res = await updateSettings(payload);
      if (res.success) {
        toast.success("Settings updated successfully!");
      } else {
        toast.error(res.message || "Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Error saving settings.");
    } finally {
      setSaving(false);
    }
  };

  // OTP Logic
  const handleRequestOtp = async () => {
    setMessage(null);
    setError(null);
    try {
      setOtpLoading(true);
      await requestChangePasswordOtp();
      setOtpRequested(true);
      setMessage("OTP sent to your email. Enter OTP and new password below.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setMessage(null);
    setError(null);
    try {
      setOtpLoading(true);
      await changePasswordWithOtp(otpData.otp, otpData.newPassword);
      setMessage("Password changed successfully!");
      setOtpRequested(false);
      setOtpData({ otp: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Password change failed");
    } finally {
      setOtpLoading(false);
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <div className="text-center py-20 text-gray-500">Loading settings...</div>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <ToastContainer position="top-right" />
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Staff Settings</h1>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 max-w-3xl mx-auto">
          {/* Profile Info */}
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Profile Information</h2>
          <div className="grid gap-4">
            <input
              type="text"
              name="name"
              value={staff.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="border rounded px-3 py-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="phone"
              value={staff.phone}
              onChange={handleChange}
              placeholder="Phone Number"
              className="border rounded px-3 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Shift Time */}
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Shift Time</h2>
          <div className="flex gap-4">
            <input
              type="time"
              name="shiftStart"
              value={staff.shiftTime.start}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            />
            <input
              type="time"
              name="shiftEnd"
              value={staff.shiftTime.end}
              onChange={handleChange}
              className="border rounded px-3 py-2 w-full"
            />
          </div>

          {/* Work Days */}
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Work Days</h2>
          <div className="flex flex-wrap gap-3">
            {DAYS.map((day) => (
              <button
                key={day}
                type="button"
                name={`workDay_${day}`}
                onClick={handleChange}
                className={`px-4 py-2 rounded-full border transition ${
                  staff.workDays.includes(day)
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Change Password */}
          <div className="border-t pt-4 mt-6">
            <h3 className="text-xl font-semibold mb-2">Change Password</h3>
            {message && <p className="text-green-600 mb-2">{message}</p>}
            {error && <p className="text-red-600 mb-2">{error}</p>}
            {!otpRequested ? (
              <button
                onClick={handleRequestOtp}
                className="bg-linear-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 rounded-lg shadow hover:opacity-90 transition w-full"
                disabled={otpLoading}
              >
                Request OTP
              </button>
            ) : (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Enter OTP"
                  value={otpData.otp}
                  onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
                <input
                  type="password"
                  placeholder="New Password"
                  value={otpData.newPassword}
                  onChange={(e) => setOtpData({ ...otpData, newPassword: e.target.value })}
                  className="border rounded px-3 py-2 w-full"
                />
                <button
                  onClick={handlePasswordChange}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                  disabled={otpLoading}
                >
                  Change Password
                </button>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="mt-6">
            <button
              onClick={handleSave}
              className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg shadow hover:opacity-90 transition"
              disabled={saving}
            >
              {saving ? "Saving..." : "Save Settings"}
            </button>
          </div>
        </div>
      </div>
    </StaffLayout>
  );
};

export default Settings;
