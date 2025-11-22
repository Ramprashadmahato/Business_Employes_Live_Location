
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getSystemConfig, updateSystemConfig } from "../../services/systemConfigurationService";

const Configurations = ({ userType = "ADMIN" }) => {
  const [config, setConfig] = useState({
    locationTrackingInterval: 5,
    staffLimitPerCompany: 50,
    enableFakeLocationDetection: true,
    themeColor: "#0d6efd",
    dateFormat: "DD-MM-YYYY",
    timeFormat: "24-hour",
    holidays: [],
    workWeekDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const data = await getSystemConfig();
        if (data) setConfig(data);
      } catch (error) {
        console.error("Failed to fetch configuration:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchConfig();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setConfig((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
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
      const data = {
        themeColor: config.themeColor,
        dateFormat: config.dateFormat,
        timeFormat: config.timeFormat,
        holidays: config.holidays,
        workWeekDays: config.workWeekDays,
      };

      if (userType === "ADMIN") {
        data.locationTrackingInterval = config.locationTrackingInterval;
        data.staffLimitPerCompany = config.staffLimitPerCompany;
        data.enableFakeLocationDetection = config.enableFakeLocationDetection;
      }

      await updateSystemConfig(data);
      alert("Configuration updated successfully!");
    } catch (error) {
      console.error(error);
      alert(error.message || "Failed to update configuration");
    }
  };

  if (loading)
    return (
      <AdminLayout>
        <p className="text-center py-20 text-gray-500">Loading configuration...</p>
      </AdminLayout>
    );

  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">System Configurations</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location Settings */}
          {userType === "ADMIN" && (
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Location Settings</h2>
              <div>
                <label className="block text-gray-600 mb-1">Location Tracking Interval (minutes)</label>
                <input
                  type="number"
                  name="locationTrackingInterval"
                  value={config.locationTrackingInterval}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
                  min={1}
                  max={60}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fake Location Detection</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableFakeLocationDetection"
                    checked={config.enableFakeLocationDetection}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"></div>
                </label>
              </div>
            </div>
          )}

          {/* Company Settings */}
          {userType === "ADMIN" && (
            <div className="bg-white rounded-xl shadow p-6 space-y-4">
              <h2 className="text-lg font-semibold text-gray-700">Company Settings</h2>
              <div>
                <label className="block text-gray-600 mb-1">Staff Limit per Company</label>
                <input
                  type="number"
                  name="staffLimitPerCompany"
                  value={config.staffLimitPerCompany}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-400"
                  min={1}
                />
              </div>
            </div>
          )}

          {/* Appearance */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Appearance</h2>
            <div>
              <label className="block text-gray-600 mb-1">Theme Color</label>
              <input
                type="color"
                name="themeColor"
                value={config.themeColor}
                onChange={handleChange}
                className="w-20 h-10 border rounded"
              />
            </div>
          </div>

          {/* Date & Time Formats */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Date & Time Formats</h2>
            <div className="flex gap-4">
              <select
                name="dateFormat"
                value={config.dateFormat}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                <option value="MM-DD-YYYY">MM-DD-YYYY</option>
              </select>
              <select
                name="timeFormat"
                value={config.timeFormat}
                onChange={handleChange}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="12-hour">12 Hour</option>
                <option value="24-hour">24 Hour</option>
              </select>
            </div>
          </div>

          {/* Work Week Configuration */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Work Week Configuration</h2>
            <div className="flex flex-wrap gap-2">
              {weekDays.map((day) => (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleWorkWeekChange(day)}
                  className={`px-4 py-2 rounded-full border ${
                    config.workWeekDays.includes(day)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Holidays */}
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Holidays</h2>
            {config.holidays.map((h, idx) => (
              <div key={idx} className="flex gap-2 items-center">
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
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg shadow hover:opacity-90 transition"
          >
            Save
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Configurations;
