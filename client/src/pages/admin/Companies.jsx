
import React, { useState, useEffect } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import {
  getAllCompanies,
  createCompany,
  updateCompany,
  deleteCompany,
} from "../../services/companyService";
import { getPackages } from "../../services/packageService";
import { FaPlus, FaSearch, FaFilter, FaEdit, FaTrash } from "react-icons/fa";

const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [packages, setPackages] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState(defaultForm());
  const [search, setSearch] = useState("");

  function defaultForm() {
    return {
      _id: "",
      name: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      gstOrPan: "",
      packageId: "",
      imsEnabled: true,
      payrollEnabled: false,
      staffLimit: 10,
    };
  }

  useEffect(() => {
    fetchCompanies();
    fetchPackages();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await getAllCompanies();
      if (res.success) setCompanies(res.data || []);
      else alert(res.message || "Failed to fetch companies");
    } catch (err) {
      console.error(err);
      alert("Error fetching companies");
    } finally {
      setLoading(false);
    }
  };

  const fetchPackages = async () => {
    try {
      const res = await getPackages();
      setPackages(res || []);
    } catch (err) {
      console.error(err);
      alert("Error fetching packages");
    }
  };

  const handlePackageChange = (packageId) => {
    const selectedPackage = packages.find((pkg) => pkg._id === packageId);
    setFormData({
      ...formData,
      packageId,
      imsEnabled: selectedPackage?.modules?.imsEnabled ?? true,
      payrollEnabled: selectedPackage?.modules?.payrollEnabled ?? false,
      staffLimit: selectedPackage?.staffLimit ?? 10,
    });
  };

  const handleAdd = () => {
    setFormData(defaultForm());
    setShowForm(true);
  };

  const handleEdit = (company) => {
    setFormData({
      _id: company._id,
      name: company.name,
      email: company.email,
      password: "",
      phone: company.phone || "",
      address: company.address || "",
      gstOrPan: company.gstOrPan || "",
      packageId: company.packageId?._id || "",
      imsEnabled: company.imsEnabled,
      payrollEnabled: company.payrollEnabled,
      staffLimit: company.staffLimit,
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this company and all related staff?")) return;
    try {
      const res = await deleteCompany(id);
      if (res.success) fetchCompanies();
      else alert(res.message);
    } catch (err) {
      console.error(err);
      alert("Error deleting company");
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.email.trim() || !formData.packageId) {
      alert("Name, Email, and Package are required");
      return;
    }
    if (!formData._id && !formData.password.trim()) {
      alert("Password is required for new company");
      return;
    }

    try {
      setSaving(true);
      let res;
      if (formData._id) {
        res = await updateCompany(formData._id, formData);
      } else {
        res = await createCompany(formData);
      }

      if (res.success) {
        setShowForm(false);
        setFormData(defaultForm());
        fetchCompanies();
      } else {
        alert(res.message);
      }
    } catch (err) {
      console.error(err);
      alert("Error saving company");
    } finally {
      setSaving(false);
    }
  };

  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // ✅ Dynamic color for package badge
  const getPackageColor = (packageName) => {
    if (!packageName) return "bg-indigo-500";
    const name = packageName.toLowerCase();
    if (name.includes("premium")) return "bg-purple-600";
    if (name.includes("basic")) return "bg-blue-600";
    if (name.includes("gold")) return "bg-yellow-500 text-black";
    if (name.includes("silver")) return "bg-gray-500";
    return "bg-indigo-500";
  };

  return (
    <AdminLayout>
      <div className="p-6 bg-linear-to-br from-blue-50 to-purple-50 min-h-screen">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Companies</h1>
          {!showForm && (
            <button
              onClick={handleAdd}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-full shadow hover:bg-green-700 transition"
            >
              <FaPlus /> Add Company
            </button>
          )}
        </div>

        {/* Search and Filter */}
        {!showForm && (
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center bg-white rounded-lg shadow px-3 py-2 w-full max-w-md">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none"
              />
            </div>
            <button className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg shadow hover:bg-gray-200">
              <FaFilter /> Filter
            </button>
          </div>
        )}

        {/* Form */}
        {showForm && (
          <div className="bg-white p-6 rounded-xl shadow-lg mb-6">
            <h2 className="text-xl font-semibold mb-4">
              {formData._id ? "Edit Company" : "Add Company"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <input
                type="text"
                placeholder="Company Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="border p-3 rounded-lg w-full"
              />
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="border p-3 rounded-lg w-full"
                disabled={!!formData._id}
              />
              {!formData._id && (
                <input
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="border p-3 rounded-lg w-full"
                />
              )}
              <input
                type="text"
                placeholder="Phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="border p-3 rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="border p-3 rounded-lg w-full"
              />
              <input
                type="text"
                placeholder="GST / PAN"
                value={formData.gstOrPan}
                onChange={(e) => setFormData({ ...formData, gstOrPan: e.target.value })}
                className="border p-3 rounded-lg w-full"
              />
            </div>
            <select
              value={formData.packageId}
              onChange={(e) => handlePackageChange(e.target.value)}
              className="border p-3 rounded-lg w-full mb-4"
            >
              <option value="">Select Package</option>
              {packages.map((pkg) => (
                <option key={pkg._id} value={pkg._id}>
                  {pkg.name} ({pkg.staffLimit} staff)
                </option>
              ))}
            </select>
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
              <p className="p-4">Loading companies...</p>
            ) : filteredCompanies.length === 0 ? (
              <p className="p-4">No companies found</p>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-sm uppercase">
                    <th className="py-3 px-4">#</th>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Package</th>
                    <th className="py-3 px-4">IMS</th>
                    <th className="py-3 px-4">Payroll</th>
                    <th className="py-3 px-4">Total Staff</th>
                    <th className="py-3 px-4">Active Staff</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCompanies.map((company, index) => (
                    <tr key={company._id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{company.name}</td>
                      <td className="py-3 px-4">{company.email}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm font-semibold ${getPackageColor(
                            company.packageId?.name
                          )}`}
                        >
                          {company.packageId?.name || "N/A"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            company.imsEnabled
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {company.imsEnabled ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-semibold ${
                            company.payrollEnabled
                              ? "bg-green-100 text-green-600"
                              : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {company.payrollEnabled ? "Yes" : "No"}
                        </span>
                      </td>
                      <td className="py-3 px-4">{company.totalStaff || 0}</td>
                      <td className="py-3 px-4">{company.activeStaff || 0}</td>
                      <td className="py-3 px-4 flex gap-2">
                        <button
                          onClick={() => handleEdit(company)}
                          className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(company._id)}
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

export default Companies;
