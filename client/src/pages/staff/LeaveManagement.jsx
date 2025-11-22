
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { requestLeave, getLeaveHistory, deleteLeaveRequest } from "../../services/staffService";
import StaffLayout from "../../components/layout/StaffLayout";

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchLeaves = async (isInitial = false) => {
    try {
      if (isInitial) setLoadingInitial(true);
      const res = await getLeaveHistory();
      if (res.success) {
        setLeaves(res.data);
      } else {
        toast.error(res.message || "Failed to load leaves");
      }
    } catch (err) {
      toast.error("Error loading leave history");
    } finally {
      if (isInitial) setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchLeaves(true);
  }, []);

  const handleLeaveRequest = async () => {
    if (!startDate || !endDate) return toast.error("Please select both start and end date");
    if (new Date(startDate) > new Date(endDate)) return toast.error("Start date cannot be after end date");

    setRequesting(true);
    try {
      const res = await requestLeave({ startDate, endDate, reason });
      if (res.success) {
        toast.success("Leave requested successfully");
        await fetchLeaves();
        setStartDate("");
        setEndDate("");
        setReason("");
      } else toast.error(res.message);
    } catch (err) {
      toast.error("Leave request failed");
    } finally {
      setRequesting(false);
    }
  };

  const handleDeleteLeave = async (leaveId) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;
    setDeletingId(leaveId);

    try {
      const res = await deleteLeaveRequest({ leaveId });
      if (res.success) {
        toast.success("Leave request deleted successfully");
        await fetchLeaves();
      } else {
        toast.error(res.message);
      }
    } catch (err) {
      toast.error("Failed to delete leave request");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <StaffLayout>
      <ToastContainer position="top-right" />
      <div className="p-6 bg-linear-to-br from-blue-50 to-purple-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Leave Management</h1>

        {/* Leave Request Form */}
        <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
          <h2 className="text-xl font-bold mb-4">Request Leave</h2>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block mb-1 font-medium">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Reason (optional)</label>
              <textarea
                placeholder="Enter reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="border border-gray-300 p-2 rounded w-full resize-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleLeaveRequest}
              disabled={requesting}
              className={`mt-2 px-6 py-2 rounded-full text-white font-semibold ${
                requesting ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {requesting ? "Requesting..." : "Submit Leave Request"}
            </button>
          </div>
        </div>

        {/* Leave History */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold mb-4">Leave History</h2>
          {loadingInitial ? (
            <p className="text-gray-500">Loading leave history...</p>
          ) : leaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-10">
              https://via.placeholder.com/200x150.png?text=No+Leaves
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No leave requests found</h3>
              <p className="text-gray-500">Submit a leave request above to see it here.</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
                  <th className="py-3 px-4 text-left">Start Date</th>
                  <th className="py-3 px-4 text-left">End Date</th>
                  <th className="py-3 px-4 text-left">Reason</th>
                  <th className="py-3 px-4 text-left">Status</th>
                  <th className="py-3 px-4 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((leave) => (
                  <tr key={leave._id} className="border-b hover:bg-gray-50 transition">
                    <td className="py-3 px-4">{new Date(leave.startDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{new Date(leave.endDate).toLocaleDateString()}</td>
                    <td className="py-3 px-4">{leave.reason || "-"}</td>
                    <td
                      className={`py-3 px-4 font-semibold ${
                        leave.status === "APPROVED"
                          ? "text-green-600"
                          : leave.status === "REJECTED"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {leave.status}
                    </td>
                    <td className="py-3 px-4">
                      {leave.status === "PENDING" && (
                        <button
                          onClick={() => handleDeleteLeave(leave._id)}
                          disabled={deletingId === leave._id}
                          className={`px-4 py-2 rounded-full text-white text-sm font-medium ${
                            deletingId === leave._id
                              ? "bg-gray-400"
                              : "bg-red-600 hover:bg-red-700"
                          }`}
                        >
                          {deletingId === leave._id ? "Deleting..." : "Delete"}
                        </button>
                      )}
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

export default LeaveManagement;
