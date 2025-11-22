
import React, { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  getAllLeaveRequests,
  updateLeaveStatus,
  deleteLeaveRequest,
} from "../../services/staffService";
import CompanyLayout from "../../components/layout/CompanyLayout";
import { FaFileAlt } from "react-icons/fa";

const ManageLeavesCompany = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const res = await getAllLeaveRequests();
      if (res.success) setLeaves(res.data);
      else toast.error(res.message || "Failed to fetch leave requests");
    } catch (err) {
      toast.error("Error fetching leave requests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleLeaveAction = async (staffId, leaveId, status) => {
    if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this leave?`)) return;

    try {
      setUpdatingId(leaveId);
      const res = await updateLeaveStatus({ staffId, leaveId, status });
      if (res.success) {
        toast.success(`Leave ${status.toLowerCase()} successfully`);
        fetchLeaves();
      } else {
        toast.error(res.message || `Failed to ${status.toLowerCase()} leave`);
      }
    } catch (err) {
      toast.error(`Error updating leave`);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteLeave = async (leaveId, staffId) => {
    if (!window.confirm("Are you sure you want to delete this leave request?")) return;

    try {
      setDeletingId(leaveId);
      const res = await deleteLeaveRequest({ leaveId, staffId });
      if (res.success) {
        toast.success("Leave request deleted successfully");
        fetchLeaves();
      } else {
        toast.error(res.message || "Failed to delete leave request");
      }
    } catch (err) {
      toast.error("Error deleting leave request");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <CompanyLayout>
      <ToastContainer position="top-right" />
      <div className="p-6 bg-linear-to-br from-blue-50 to-purple-50 min-h-screen">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Leave Requests</h1>

        {loading ? (
          <p className="text-gray-500">Loading leave requests...</p>
        ) : leaves.length === 0 ? (
          // ✅ Empty State Design
          <div className="flex flex-col items-center justify-center bg-white rounded-xl shadow-lg p-10 text-center">
            {/* Dummy Illustration */}
            https://via.placeholder.com/200x150.png?text=Leave+Illustration
            {/* Title */}
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No leave requests found</h2>
            {/* Subtitle */}
            <p className="text-gray-500 mb-6">
              When employees submit leave requests, they will appear here
            </p>
            {/* Button */}
            <button className="flex items-center gap-2 bg-linear-to-r from-indigo-500 to-blue-500 text-white font-semibold px-6 py-3 rounded-full shadow hover:opacity-90 transition">
              <FaFileAlt /> View Leave Policies
            </button>
          </div>
        ) : (
          // ✅ Table Design
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm uppercase tracking-wide">
                  <th className="py-3 px-4 text-left">Staff Name</th>
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
                    <td className="py-3 px-4">{leave.staffName || leave.staff?.name || "-"}</td>
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
                    <td className="py-3 px-4 flex gap-2">
                      {leave.status === "PENDING" && (
                        <>
                          <button
                            onClick={() =>
                              handleLeaveAction(leave.staffId, leave._id, "APPROVED")
                            }
                            disabled={updatingId === leave._id || deletingId === leave._id}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-full text-sm font-medium"
                          >
                            {updatingId === leave._id ? "Processing..." : "Approve"}
                          </button>
                          <button
                            onClick={() =>
                              handleLeaveAction(leave.staffId, leave._id, "REJECTED")
                            }
                            disabled={updatingId === leave._id || deletingId === leave._id}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-full text-sm font-medium"
                          >
                            {updatingId === leave._id ? "Processing..." : "Reject"}
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => handleDeleteLeave(leave._id, leave.staffId)}
                        disabled={deletingId === leave._id || updatingId === leave._id}
                        className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-full text-sm font-medium"
                      >
                        {deletingId === leave._id ? "Deleting..." : "Delete"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </CompanyLayout>
  );
};

export default ManageLeavesCompany;
