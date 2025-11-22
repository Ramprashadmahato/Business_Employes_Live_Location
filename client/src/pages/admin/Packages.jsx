
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  getPackages,
  createPackage,
  updatePackage,
  deletePackage,
} from "../../services/packageService";
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter } from "react-icons/fa";

const Packages = () => {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(defaultForm());
  const [search, setSearch] = useState("");
  const [filterIMS, setFilterIMS] = useState("");
  const [filterPayroll, setFilterPayroll] = useState("");

  function defaultForm() {
    return {
      name: "",
      description: "",
      staffLimit: 10,
      imsEnabled: true,
      payrollEnabled: false,
      price: 0,
    };
  }

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const res = await getPackages();
      setPackages(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error(err);
      alert("Error fetching packages");
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setFormData(defaultForm());
    setShowForm(true);
  };

  const handleEdit = (pkg) => {
    setFormData({
      _id: pkg._id,
      name: pkg.name || "",
      description: pkg.description || "",
      staffLimit: pkg.staffLimit || 10,
      imsEnabled: pkg.modules?.imsEnabled ?? true,
      payrollEnabled: pkg.modules?.payrollEnabled ?? false,
      price: pkg.price || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      await deletePackage(id);
      fetchPackages();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error deleting package");
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.staffLimit) {
      alert("Package Name and Staff Limit are required");
      return;
    }

    try {
      setSaving(true);
      const dataToSend = {
        name: formData.name,
        description: formData.description,
        staffLimit: Number(formData.staffLimit),
        price: Number(formData.price),
        modules: {
          imsEnabled: formData.imsEnabled,
          payrollEnabled: formData.payrollEnabled,
        },
      };

      if (formData._id) {
        await updatePackage(formData._id, dataToSend);
      } else {
        await createPackage(dataToSend);
      }

      setShowForm(false);
      setFormData(defaultForm());
      fetchPackages();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Error saving package");
    } finally {
      setSaving(false);
    }
  };

  // ✅ Filter logic
  const filteredPackages = packages.filter((pkg) => {
    const matchesSearch = pkg.name.toLowerCase().includes(search.toLowerCase());
    const matchesIMS =
      filterIMS === "" || (filterIMS === "yes" ? pkg.modules?.imsEnabled : !pkg.modules?.imsEnabled);
    const matchesPayroll =
      filterPayroll === "" ||
      (filterPayroll === "yes" ? pkg.modules?.payrollEnabled : !pkg.modules?.payrollEnabled);
    return matchesSearch && matchesIMS && matchesPayroll;
  });

  return (
    <AdminLayout>
      <div className="p-6 bg-linear-to-br from-blue-50 to-purple-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-600">Packages</h1>
          {!showForm && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full shadow hover:bg-green-700 transition"
            >
              <FaPlus /> Add Package
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
                placeholder="Search packages..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none"
              />
            </div>
            <div className="flex items-center gap-4 bg-white rounded-lg shadow px-3 py-2">
              <FaFilter className="text-gray-400" />
              <select
                value={filterIMS}
                onChange={(e) => setFilterIMS(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="">IMS: All</option>
                <option value="yes">IMS Enabled</option>
                <option value="no">IMS Disabled</option>
              </select>
              <select
                value={filterPayroll}
                onChange={(e) => setFilterPayroll(e.target.value)}
                className="border rounded px-2 py-1"
              >
                <option value="">Payroll: All</option>
                <option value="yes">Payroll Enabled</option>
                <option value="no">Payroll Disabled</option>
              </select>
            </div>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {formData._id ? "Edit Package" : "Add Package"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Package Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-3 rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="border p-3 rounded-lg w-full"
              />
              <input
                type="number"
                placeholder="Staff Limit"
                value={formData.staffLimit}
                onChange={(e) => setFormData({ ...formData, staffLimit: e.target.value })}
                className="border p-3 rounded-lg w-full"
              />
              <input
                type="number"
                placeholder="Price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="border p-3 rounded-lg w-full"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex items-center space-x-6 mb-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.imsEnabled}
                  onChange={(e) => setFormData({ ...formData, imsEnabled: e.target.checked })}
                />
                IMS Enabled
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.payrollEnabled}
                  onChange={(e) => setFormData({ ...formData, payrollEnabled: e.target.checked })}
                />
                Payroll Enabled
              </label>
            </div>

            {/* Buttons */}
            <div className="flex gap-4">
              <button
                onClick={handleSave}
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
              <p className="p-4">Loading packages...</p>
            ) : filteredPackages.length === 0 ? (
              <p className="p-4">No packages found.</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Staff Limit</th>
                    <th className="py-3 px-4">IMS</th>
                    <th className="py-3 px-4">Payroll</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPackages.map((pkg, idx) => (
                    <tr key={pkg._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{idx + 1}</td>
                      <td className="py-3 px-4">{pkg.name}</td>
                      <td className="py-3 px-4">{pkg.description || "-"}</td>
                      <td className="py-3 px-4">{pkg.staffLimit}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                            pkg.modules?.imsEnabled ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {pkg.modules?.imsEnabled ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${
                            pkg.modules?.payrollEnabled ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {pkg.modules?.payrollEnabled ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-blue-600">
                        ${pkg.price}
                      </td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(pkg)}
                          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(pkg._id)}
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
    </AdminLayout>
  );
};

export default Packages;
