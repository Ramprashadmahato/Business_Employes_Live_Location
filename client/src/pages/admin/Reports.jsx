
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { downloadReport } from "../../services/reportService";
import { getAllCompanies } from "../../services/companyService";
import { getAllStaff } from "../../services/staffService";
import { FaDownload, FaBuilding, FaUserTie, FaCalendarAlt } from "react-icons/fa";

const Reports = () => {
  const [filters, setFilters] = useState({
    companyId: "",
    staffId: "",
    rangeType: "custom",
    startDate: "",
    endDate: "",
  });

  const [companies, setCompanies] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch all companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const res = await getAllCompanies();
        setCompanies(res?.data || []);
      } catch (err) {
        console.error("Error fetching companies:", err);
        setCompanies([]);
      }
    };
    fetchCompanies();
  }, []);

  // Fetch staff for selected company
  useEffect(() => {
    const fetchStaffs = async () => {
      if (!filters.companyId) {
        setStaffs([]);
        setFilters((prev) => ({ ...prev, staffId: "" }));
        return;
      }

      try {
        const res = await getAllStaff(filters.companyId);
        setStaffs(res?.data || []);
        setFilters((prev) => ({ ...prev, staffId: "" })); // reset selected staff
      } catch (err) {
        console.error("Error fetching staff:", err);
        setStaffs([]);
      }
    };
    fetchStaffs();
  }, [filters.companyId]);

  // Handle report download
  const handleDownload = async () => {
    if (filters.rangeType === "custom" && (!filters.startDate || !filters.endDate)) {
      alert("Please select start and end dates for custom report");
      return;
    }

    try {
      setLoading(true);
      await downloadReport(filters); // Ensure this handles blob download
    } catch (err) {
      console.error("Download error:", err);
      alert(err.message || "Failed to download report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-linear-to-br from-blue-50 to-purple-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-2">
          📊 Staff Reports
        </h1>

        <div className="bg-white shadow-lg rounded-xl p-6 space-y-6 border border-gray-200">
          {/* Company Selection */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 items-center gap-2">
              <FaBuilding /> Company
            </label>
            <select
              value={filters.companyId}
              onChange={(e) => setFilters((prev) => ({ ...prev, companyId: e.target.value }))}
              className="border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- All Companies --</option>
              {companies.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Staff Selection */}
          <div>
            <label className="block font-semibold text-gray-700 mb-2 items-center gap-2">
              <FaUserTie /> Staff
            </label>
            <select
              value={filters.staffId}
              onChange={(e) => setFilters((prev) => ({ ...prev, staffId: e.target.value }))}
              disabled={!filters.companyId || staffs.length === 0}
              className={`border border-gray-300 p-3 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                !filters.companyId ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            >
              <option value="">-- All Staff --</option>
              {staffs.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Range Type */}
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

          {/* Custom Date Picker */}
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
    </AdminLayout>
  );
};

export default Reports;
