
import React, { useEffect, useState } from "react";
import CompanyLayout from "../../components/layout/CompanyLayout";
import { getSystemConfig, updateSystemConfig } from "../../services/systemConfigurationService";
import { requestChangePasswordOtp, changePasswordWithOtp } from "../../services/userService";

const Settings = () => {
  const [config, setConfig] = useState({
    themeColor: "#3b82f6",
    dateFormat: "DD-MM-YYYY",
    timeFormat: "24-hour",
    holidays: [],
    workWeekDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
    companyDetails: {
      name: "",
      contact: "",
      gstPan: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpData, setOtpData] = useState({ otp: "", newPassword: "" });

  useEffect(() => {
    const fetchConfig = async () => {
      setLoading(true);
      try {
        const data = await getSystemConfig();
        if (data) {
          setConfig({
            themeColor: data.themeColor || "#3b82f6",
            dateFormat: data.dateFormat || "DD-MM-YYYY",
            timeFormat: data.timeFormat || "24-hour",
            holidays: data.holidays || [],
            workWeekDays: data.workWeekDays || ["Mon", "Tue", "Wed", "Thu", "Fri"],
            companyDetails: {
              name: data.companyDetails?.name || "",
              contact: data.companyDetails?.contact || "",
              gstPan: data.companyDetails?.gstPan || "",
            },
          });
        }
      } catch (error) {
        console.error("Failed to fetch company configuration:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (["name", "contact", "gstPan"].includes(name)) {
      setConfig((prev) => ({
        ...prev,
        companyDetails: { ...prev.companyDetails, [name]: value },
      }));
    } else {
      setConfig((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleWorkWeekChange = (day) => {
    setConfig((prev) => {
      const newDays = prev.workWeekDays.includes(day)
        ? prev.workWeekDays.filter((d) => d !== day)
        : [...prev.workWeekDays, day];
      return { ...prev, workWeekDays: newDays };
    });
  };

  const handleHolidayChange = (index, field, value) => {
    const updatedHolidays = [...config.holidays];
    updatedHolidays[index][field] = value;
    setConfig((prev) => ({ ...prev, holidays: updatedHolidays }));
  };

  const addHoliday = () => {
    setConfig((prev) => ({
      ...prev,
      holidays: [...prev.holidays, { date: "", description: "" }],
    }));
  };

  const removeHoliday = (index) => {
    const updatedHolidays = [...config.holidays];
    updatedHolidays.splice(index, 1);
    setConfig((prev) => ({ ...prev, holidays: updatedHolidays }));
  };

  const handleSave = async () => {
    try {
      await updateSystemConfig({
        themeColor: config.themeColor,
        dateFormat: config.dateFormat,
        timeFormat: config.timeFormat,
        holidays: config.holidays,
        workWeekDays: config.workWeekDays,
        companyDetails: config.companyDetails,
      });
      alert("Settings updated successfully!");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to update settings");
    }
  };

  const handleRequestOtp = async () => {
    setMessage(null);
    setError(null);
    try {
      setLoading(true);
      await requestChangePasswordOtp();
      setOtpRequested(true);
      setMessage("OTP sent to your email. Enter OTP and new password below.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setMessage(null);
    setError(null);
    try {
      setLoading(true);
      await changePasswordWithOtp(otpData.otp, otpData.newPassword);
      setMessage("Password changed successfully!");
      setOtpRequested(false);
      setOtpData({ otp: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  if (loading && !otpRequested) {
    return (
      <CompanyLayout>
        <p className="text-center text-gray-600">Loading configuration...</p>
      </CompanyLayout>
    );
  }

  return (
    <CompanyLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Company Settings</h1>

        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6 max-w-4xl mx-auto">
          {/* Company Details */}
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Company Details</h2>
          <div className="grid gap-4">
            <input
              type="text"
              name="name"
              value={config.companyDetails.name}
              onChange={handleChange}
              placeholder="Company Name"
              className="border rounded px-3 py-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="contact"
              value={config.companyDetails.contact}
              onChange={handleChange}
              placeholder="Contact"
              className="border rounded px-3 py-3 focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              name="gstPan"
              value={config.companyDetails.gstPan}
              onChange={handleChange}
              placeholder="GST / PAN"
              className="border rounded px-3 py-3 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Appearance */}
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Appearance</h2>
          <input
            type="color"
            name="themeColor"
            value={config.themeColor}
            onChange={handleChange}
            className="w-20 h-10 border rounded"
          />

          {/* Date & Time Formats */}
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Date & Time Formats</h2>
          <div className="flex gap-4">
            <select
              name="dateFormat"
              value={config.dateFormat}
              onChange={handleChange}
              className="border rounded px-3 py-3 w-full"
            >
              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              <option value="MM-DD-YYYY">MM-DD-YYYY</option>
            </select>
            <select
              name="timeFormat"
              value={config.timeFormat}
              onChange={handleChange}
              className="border rounded px-3 py-3 w-full"
            >
              <option value="12-hour">12 Hour</option>
              <option value="24-hour">24 Hour</option>
            </select>
          </div>

          {/* Work Week Days */}
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Work Week Days</h2>
          <div className="flex flex-wrap gap-3">
            {weekDays.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => handleWorkWeekChange(day)}
                className={`px-4 py-2 rounded-full border transition ${
                  config.workWeekDays.includes(day)
                    ? "bg-blue-600 text-white shadow"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          {/* Holidays */}
          <h2 className="text-xl font-semibold text-gray-700 border-b pb-2">Holidays</h2>
          {config.holidays.map((h, idx) => (
            <div key={idx} className="flex gap-2 items-center mb-2">
              <input
                type="date"
                value={h.date ? h.date.slice(0, 10) : ""}
                onChange={(e) => handleHolidayChange(idx, "date", e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                value={h.description}
                placeholder="Description"
                onChange={(e) => handleHolidayChange(idx, "description", e.target.value)}
                className="border rounded px-3 py-2 flex-1"
              />
              <button
                onClick={() => removeHoliday(idx)}
                className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={addHoliday}
            className="text-blue-600 font-semibold hover:underline"
          >
            + Add Holiday
          </button>

          {/* Change Password */}
          <div className="border-t pt-4 mt-6">
            <h3 className="text-xl font-semibold mb-2">Change Password</h3>
            {message && <p className="text-green-600 mb-2">{message}</p>}
            {error && <p className="text-red-600 mb-2">{error}</p>}
            {!otpRequested ? (
              <button
                onClick={handleRequestOtp}
                className="bg-linear-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 rounded-lg shadow hover:opacity-90 transition w-full"
                disabled={loading}
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
                  disabled={loading}
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
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};

export default Settings;
