
import React, { useEffect, useState } from "react";
import StaffLayout from "../../components/layout/StaffLayout";
import { getHistory } from "../../services/staffService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CheckInOut = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await getHistory();
      if (res.success && Array.isArray(res.data)) {
        setLogs(res.data);
      } else {
        setLogs([]);
        toast.info("No check-in/check-out history available.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load history.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatTime = (time) => {
    if (!time) return "N/A";
    return new Date(time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <StaffLayout>
      <ToastContainer position="top-right" />
      <div className="bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Check-In / Check-Out History</h1>

        <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
          {loading ? (
            <p className="text-gray-500">Loading history...</p>
          ) : logs.length === 0 ? (
            <p className="text-gray-500">No check-in/check-out records found.</p>
          ) : (
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
                  <th className="py-3 px-4 text-left">Date</th>
                  <th className="py-3 px-4 text-left">Check-In</th>
                  <th className="py-3 px-4 text-left">Check-Out</th>
                  <th className="py-3 px-4 text-left">Total Hours</th>
                  <th className="py-3 px-4 text-left">Check-In Location</th>
                  <th className="py-3 px-4 text-left">Check-Out Location</th>
                  <th className="py-3 px-4 text-left">Spoofed?</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, idx) => (
                  <tr
                    key={idx}
                    className="border-b hover:bg-gray-50 transition-colors duration-200"
                  >
                    <td className="py-3 px-4 font-medium text-gray-800">{log.date}</td>
                    <td className="py-3 px-4 text-gray-700">{formatTime(log.checkIn)}</td>
                    <td className="py-3 px-4 text-gray-700">{formatTime(log.checkOut)}</td>
                    <td className="py-3 px-4 font-semibold text-blue-600">{log.totalHours} hrs</td>
                    <td className="py-3 px-4 text-gray-600">{log.checkInLocation?.address || "Unknown"}</td>
                    <td className="py-3 px-4 text-gray-600">{log.checkOutLocation?.address || "Unknown"}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          log.isSpoofed ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"
                        }`}
                      >
                        {log.isSpoofed ? `Yes (${log.spoofReason})` : "No"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default CheckInOut;
