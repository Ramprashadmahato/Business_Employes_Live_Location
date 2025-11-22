
import React, { useState, useEffect, useCallback } from "react";
import CompanyLayout from "../../components/layout/CompanyLayout";
import {
  getAllStaff,
  createStaff,
  updateStaff,
  deleteStaff,
} from "../../services/staffService";
import { FaPlus, FaSearch, FaEdit, FaTrash, FaUser } from "react-icons/fa";

const Staffs = () => {
  const [staffs, setStaffs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState(defaultForm());
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");

  function defaultForm() {
    return { _id: "", name: "", email: "", phone: "", password: "" };
  }

  const fetchStaffs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllStaff();
      if (res.success) setStaffs(res.data || []);
      else setError(res.message || "Failed to fetch staff");
    } catch (err) {
      console.error(err);
      setError("Error fetching staff");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaffs();
    const interval = setInterval(fetchStaffs, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, [fetchStaffs]);

  const handleAddStaff = () => {
    setFormData(defaultForm());
    setShowForm(true);
  };

  const handleEditStaff = (staff) => {
    setFormData({
      _id: staff._id,
      name: staff.name,
      email: staff.email,
      phone: staff.phone || "",
      password: "",
    });
    setShowForm(true);
  };

  const handleDeleteStaff = async (id) => {
    if (!window.confirm("Are you sure you want to delete this staff?")) return;
    try {
      const res = await deleteStaff(id);
      if (!res.success)
        return alert(res.message || "Forbidden: Insufficient permissions.");
      fetchStaffs();
    } catch (err) {
      console.error(err);
      alert("Failed to delete staff");
    }
  };

  const handleSaveStaff = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert("Name and Email are required");
      return;
    }

    try {
      setSaving(true);
      const payload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        status: "inactive", // default
      };

      if (!formData._id) {
        payload.password = formData.password || "123456";
        const res = await createStaff(payload);
        if (!res.success) return alert(res.message);
      } else {
        const res = await updateStaff(formData._id, payload);
        if (!res.success) return alert(res.message);
      }

      setShowForm(false);
      setFormData(defaultForm());
      fetchStaffs();
    } catch (err) {
      console.error(err);
      alert("Failed to save staff");
    } finally {
      setSaving(false);
    }
  };

  const filteredStaffs = staffs.filter(
    (staff) =>
      staff.name.toLowerCase().includes(search.toLowerCase()) ||
      staff.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <CompanyLayout>
      <div className="p-6 bg-linear-to-br from-blue-50 to-purple-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Staff Management</h1>
          {!showForm && (
            <button
              onClick={handleAddStaff}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full shadow hover:bg-green-700 transition"
            >
              <FaPlus /> Add Staff
            </button>
          )}
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}

        {/* Search */}
        {!showForm && (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center bg-white rounded-lg shadow px-3 py-2 w-full max-w-md">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search staff..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none"
              />
            </div>
            <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg shadow hover:bg-gray-200">
              <FaSearch /> Filter
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {formData._id ? "Edit Staff" : "Add Staff"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="border p-3 rounded-lg w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="border p-3 rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="border p-3 rounded-lg w-full"
              />
              {!formData._id && (
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="border p-3 rounded-lg w-full"
                />
              )}
            </div>
            <div className="flex gap-4">
              <button
                onClick={handleSaveStaff}
                disabled={saving}
                className={`px-6 py-3 rounded-lg text-white font-semibold ${
                  saving ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {saving ? "Saving..." : "Save"}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="px-6 py-3 rounded-lg bg-gray-500 text-white hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Table */}
        {!showForm && (
          <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
            {loading ? (
              <p className="p-4">Loading staff...</p>
            ) : filteredStaffs.length === 0 ? (
              <p className="p-4">No staff found</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">GPS</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStaffs.map((staff, index) => (
                    <tr key={staff._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4 flex items-center gap-2">
                        <FaUser className="text-gray-400" />
                        {staff.name}
                      </td>
                      <td className="py-3 px-4">{staff.email}</td>
                      <td className="py-3 px-4">{staff.phone || "N/A"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                            staff.gpsStatus
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {staff.gpsStatus ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                            staff.gpsStatus
                              ? "bg-green-500"
                              : "bg-gray-400"
                          }`}
                        >
                          {staff.gpsStatus ? "Checked In" : "Checked Out"}
                        </span>
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => handleEditStaff(staff)}
                          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(staff._id)}
                          className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </CompanyLayout>
  );
};

export default Staffs;
