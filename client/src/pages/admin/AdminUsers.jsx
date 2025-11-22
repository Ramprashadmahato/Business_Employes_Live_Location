
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  getAllAdminStaff,
  createAdminStaff,
  updateAdminStaff,
  deleteAdminStaff,
} from "../../services/adminService";
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash } from "react-icons/fa";

const PERMISSIONS = ["STAFF_MANAGE", "COMPANY_MANAGE", "PACKAGE_MANAGE"];

const AdminUsers = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterPermission, setFilterPermission] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    status: "active",
    permissions: [],
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const data = await getAllAdminStaff();
      setAdmins(data || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to fetch admins");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePermissionChange = (permission) => {
    setFormData((prev) => {
      const hasPermission = prev.permissions.includes(permission);
      return {
        ...prev,
        permissions: hasPermission
          ? prev.permissions.filter((p) => p !== permission)
          : [...prev.permissions, permission],
      };
    });
  };

  const handleAddClick = () => {
    setEditId(null);
    setFormData({
      name: "",
      email: "",
      password: "",
      status: "active",
      permissions: [],
    });
    setShowForm(true);
  };

  const handleEditClick = (admin) => {
    setEditId(admin._id);
    setFormData({
      name: admin.name,
      email: admin.email,
      password: "",
      status: admin.status,
      permissions: admin.permissions || [],
    });
    setShowForm(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || (!editId && !formData.password)) {
      return alert("Please fill all required fields");
    }

    if (formData.permissions.length === 0) {
      return alert("Please select at least one permission");
    }

    try {
      if (editId) {
        await updateAdminStaff(editId, {
          name: formData.name,
          status: formData.status,
          permissions: formData.permissions,
        });
        alert("Admin updated successfully");
      } else {
        await createAdminStaff({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          permissions: formData.permissions,
        });
        alert("Admin created successfully");
      }
      setShowForm(false);
      setEditId(null);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert(err.message || "Action failed");
    }
  };

  const handleDeleteClick = async (adminId) => {
    if (!window.confirm("Are you sure you want to delete this admin?")) return;
    try {
      await deleteAdminStaff(adminId);
      alert("Admin deleted successfully");
      fetchAdmins();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete admin");
    }
  };

  // ✅ Filter logic
  const filteredAdmins = admins.filter((admin) => {
    const matchesSearch =
      admin.name.toLowerCase().includes(search.toLowerCase()) ||
      admin.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      filterStatus === "" || admin.status === filterStatus;
    const matchesPermission =
      filterPermission === "" ||
      admin.permissions?.includes(filterPermission);
    return matchesSearch && matchesStatus && matchesPermission;
  });

  return (
    <AdminLayout>
      <div className="p-6 bg-linear-to-br from-blue-50 to-purple-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Admin Users</h1>
          {!showForm && (
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full shadow hover:bg-green-700 transition"
            >
              <FaPlus /> Add Admin User
            </button>
          )}
        </div>

        {/* Search & Filter */}
        {!showForm && (
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex items-center bg-white rounded-lg shadow px-3 py-2 w-full max-w-md">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none"
              />
            </div>
            <div className="flex items-center gap-4 bg-white rounded-lg shadow px-3 py-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="">Status: All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <select
                value={filterPermission}
                onChange={(e) => setFilterPermission(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="">Permission: All</option>
                {PERMISSIONS.map((perm) => (
                  <option key={perm} value={perm}>
                    {perm.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Add/Edit Form */}
        {showForm && (
          <div className="bg-white shadow-md rounded-xl p-6 mb-6 border border-gray-200">
            <h2 className="text-xl font-semibold mb-4">
              {editId ? "Edit Admin" : "Add Admin"}
            </h2>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* Name & Email */}
              {["name", "email"].map((field) => (
                <div key={field}>
                  <label className="block font-semibold mb-1">
                    {field.toUpperCase()}
                  </label>
                  <input
                    type={field === "email" ? "email" : "text"}
                    name={field}
                    value={formData[field]}
                    onChange={handleFormChange}
                    className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              ))}

              {/* Password */}
              {!editId && (
                <div>
                  <label className="block font-semibold mb-1">Password</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleFormChange}
                    className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              {/* Status Dropdown */}
              {editId && (
                <div>
                  <label className="block font-semibold mb-1">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleFormChange}
                    className="w-full border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              )}

              {/* Permissions Checkboxes */}
              <div>
                <label className="block font-semibold mb-2">Permissions</label>
                <div className="grid grid-cols-2 gap-2">
                  {PERMISSIONS.map((permission) => (
                    <label key={permission} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.permissions.includes(permission)}
                        onChange={() => handlePermissionChange(permission)}
                        className="h-4 w-4"
                      />
                      <span>{permission.replace("_", " ")}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
                >
                  {editId ? "Update Admin" : "Create Admin"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Admin Table */}
        {!showForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
                  <th className="py-3 px-4">#</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Permissions</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="py-4 text-center">
                      Loading...
                    </td>
                  </tr>
                ) : filteredAdmins.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-4 text-center">
                      No admins found
                    </td>
                  </tr>
                ) : (
                  filteredAdmins.map((admin, index) => (
                    <tr key={admin._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{admin.name}</td>
                      <td className="py-3 px-4">{admin.email}</td>
                      <td className="py-3 px-4">{admin.role || "Admin"}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                            admin.status === "active" ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {admin.status}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        {admin.permissions?.length > 0 ? (
                          <div className="flex flex-wrap gap-2">
                            {admin.permissions.map((perm) => (
                              <span
                                key={perm}
                                className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold"
                              >
                                {perm.replace("_", " ")}
                              </span>
                            ))}
                          </div>
                        ) : (
                          "None"
                        )}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => handleEditClick(admin)}
                          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(admin._id)}
                          className="bg-red-600 text-white p-2 rounded hover:bg-red-700"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminUsers;
