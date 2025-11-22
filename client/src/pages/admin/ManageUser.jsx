
import React, { useEffect, useState } from "react";
import { getAllUsers, deleteUser, updateUserProfile } from "../../services/userService";
import AdminLayout from "../../components/layout/AdminLayout";
import { FaSearch, FaFilter, FaTrash } from "react-icons/fa";

function ManageUser() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [search, setSearch] = useState("");
  const [filterRole, setFilterRole] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getAllUsers();
      const allUsers = res.data.users || [];

      const filtered = allUsers.filter((u) => {
        const matchesSearch =
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase());
        const matchesRole = filterRole === "" || u.role === filterRole;
        return matchesSearch && matchesRole;
      });

      setUsers(filtered);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, filterRole]);

  // Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await deleteUser(id);
      setMessage("✅ User deleted successfully");
      setUsers(users.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || "Delete failed");
    }
  };

  // Change role
  const handleRoleChange = async (id, newRole) => {
    try {
      await updateUserProfile(id, { role: newRole });
      setMessage("✅ Role updated successfully");
      setUsers(users.map((u) => (u._id === id ? { ...u, role: newRole } : u)));
    } catch (err) {
      setError(err.response?.data?.message || "Role update failed");
    }
  };

  // Pagination logic
  const startIndex = (page - 1) * limit;
  const paginatedUsers = users.slice(startIndex, startIndex + limit);
  const totalPages = Math.ceil(users.length / limit);

  return (
    <AdminLayout>
      <div className="p-6 bg-linear-to-br from-blue-50 to-purple-50 min-h-screen">
        <h2 className="text-3xl font-bold mb-6 text-blue-600">Manage Users</h2>

        {/* Notifications */}
        {message && <p className="text-green-600 mb-2">{message}</p>}
        {error && <p className="text-red-600 mb-2">{error}</p>}
        {loading && <p>Loading users...</p>}

        {/* Search & Filter */}
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
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="border rounded px-2 py-1"
            >
              <option value="">Role: All</option>
              <option value="STAFF">STAFF</option>
              <option value="COMPANY">COMPANY</option>
              <option value="ADMIN_STAFF">ADMIN STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
        </div>

        {/* Table */}
        {!loading && users.length === 0 && <p>No users found.</p>}
        {!loading && users.length > 0 && (
          <>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{user.name}</td>
                      <td className="py-3 px-4">{user.email}</td>
                      <td className="py-3 px-4">
                        <select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user._id, e.target.value)}
                          className="border rounded px-2 py-1"
                        >
                          <option value="STAFF">STAFF</option>
                          <option value="COMPANY">COMPANY</option>
                          <option value="ADMIN_STAFF">ADMIN STAFF</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="bg-red-600 text-white p-2 rounded hover:bg-red-700 flex items-center gap-1"
                        >
                          <FaTrash /> Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-4 space-x-2">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`px-3 py-1 rounded ${
                    page === i + 1 ? "bg-blue-600 text-white" : "bg-gray-200"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
}

export default ManageUser;
