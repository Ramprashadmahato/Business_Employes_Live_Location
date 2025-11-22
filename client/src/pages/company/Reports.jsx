
import React, { useState, useEffect } from "react";
import CompanyLayout from "../../components/layout/CompanyLayout";
import { downloadReport } from "../../services/reportService";
import { getAllStaff } from "../../services/staffService";
import { FaDownload, FaCalendarAlt, FaUserTie } from "react-icons/fa";

const CompanyReports = ({ companyId }) => {
  const [filters, setFilters] = useState({
    staffId: "",
    rangeType: "daily",
    startDate: "",
    endDate: "",
  });
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchStaffs = async () => {
      try {
        const res = await getAllStaff();
        if (res.success && Array.isArray(res.data)) {
          setStaffs(res.data);
        } else {
          setStaffs([]);
        }
      } catch (err) {
        console.error("Failed to fetch staff:", err);
        setStaffs([]);
      }
    };
    fetchStaffs();
  }, []);

  const getRangeDates = () => {
    const now = new Date();
    let start, end;

    switch (filters.rangeType) {
      case "daily":
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case "weekly": {
        const day = now.getDay();
        start = new Date(now);
        start.setDate(now.getDate() - day);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        break;
      }
      case "monthly":
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case "yearly":
        start = new Date(now.getFullYear(), 0, 1);
        end = new Date(now.getFullYear(), 11, 31);
        break;
      case "custom":
        start = filters.startDate ? new Date(filters.startDate) : new Date(0);
        end = filters.endDate ? new Date(filters.endDate) : new Date();
        break;
      default:
        start = new Date(0);
        end = new Date();
    }

    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const handleDownload = async () => {
    if (filters.rangeType === "custom") {
      if (!filters.startDate || !filters.endDate) {
        alert("Please select start and end dates for custom range");
        return;
      }
      if (new Date(filters.startDate) > new Date(filters.endDate)) {
        alert("Start date cannot be after end date");
        return;
      }
    }

    const { startDate, endDate } = getRangeDates();
    const downloadFilters = {
      companyId,
      rangeType: filters.rangeType,
      startDate,
      endDate,
      staffId: filters.staffId || "",
    };

    try {
      setLoading(true);
      await downloadReport(downloadFilters);
    } catch (err) {
      alert(err.message || "Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <CompanyLayout>
      <div className="p-6 bg-linear-to-br from-blue-50 to-purple-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          📊 Staff Reports
        </h1>

        <div className="bg-white shadow-lg rounded-xl p-6 space-y-6 border border-gray-200">
          {/* Staff Dropdown */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 items-center gap-2">
              <FaUserTie /> Staff
            </label>
            <select
              value={filters.staffId}
              onChange={(e) => setFilters((prev) => ({ ...prev, staffId: e.target.value }))}
              className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- All Staff --</option>
              {staffs.length > 0 ? (
                staffs.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))
              ) : (
                <option disabled>No staff found</option>
              )}
            </select>
          </div>

          {/* Report Range */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 items-center gap-2">
              <FaCalendarAlt /> Report Range
            </label>
            <select
              value={filters.rangeType}
              onChange={(e) => setFilters((prev) => ({ ...prev, rangeType: e.target.value }))}
              className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          {filters.rangeType === "custom" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-gray-700 mb-2">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Download Button */}
          <div className="pt-4">
            <button
              onClick={handleDownload}
              disabled={loading}
              className={`w-full flex items-center justify-center gap-2 text-white py-3 rounded-lg font-semibold transition-all ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-linear-to-r from-blue-500 to-indigo-500 hover:opacity-90"
              }`}
            >
              <FaDownload />
              {loading ? "Generating Report..." : "Download Report"}
            </button>
          </div>
        </div>
      </div>
    </CompanyLayout>
  );
};

export default CompanyReports;
