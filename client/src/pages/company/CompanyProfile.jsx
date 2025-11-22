
import React, { useState, useEffect } from "react";
import { getCompanyProfile, updateCompanyProfile } from "../../services/companyService";
import CompanyLayout from "../../components/layout/CompanyLayout";
import {
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  IdentificationIcon,
} from "@heroicons/react/24/outline";

const CompanyProfile = () => {
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setMessage("");
      try {
        const res = await getCompanyProfile();
        if (res.success) setCompany(res.data);
        else setMessage(res.message || "Failed to fetch profile");
      } catch (err) {
        console.error(err);
        setMessage("Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (loading)
    return <p className="text-center py-16 text-gray-500 text-lg">Loading company profile...</p>;
  if (!company)
    return <p className="text-center py-16 text-red-500 text-lg">No company data found</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCompany((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      const res = await updateCompanyProfile(company);
      if (res.success) {
        setCompany(res.data);
        setMessage("✅ Profile updated successfully");
        setEditing(false);
      } else setMessage(res.message || "Failed to update profile");
    } catch (err) {
      console.error(err);
      setMessage("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CompanyLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Avatar */}
          <div className="w-24 h-24 mx-auto rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
            <BuildingOffice2Icon className="w-12 h-12" />
          </div>

          {/* Company Name */}
          <h2 className="text-2xl font-bold mt-4">{company.name || "Company"}</h2>

          {/* Details */}
          <div className="mt-6 space-y-3 text-left">
            <p className="flex items-center gap-2 text-gray-600">
              <BuildingOffice2Icon className="w-5 h-5 text-gray-500" />
              <span>Company Name: {company.name}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <EnvelopeIcon className="w-5 h-5 text-gray-500" />
              <span>Email: {company.email}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <PhoneIcon className="w-5 h-5 text-gray-500" />
              <span>Phone: {company.phone || "Not Provided"}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <MapPinIcon className="w-5 h-5 text-gray-500" />
              <span>Address: {company.address || "Not Provided"}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <IdentificationIcon className="w-5 h-5 text-gray-500" />
              <span>GST / PAN: {company.gstOrPan || "Not Provided"}</span>
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg shadow hover:opacity-90 transition"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Message */}
          {message && (
            <p
              className={`mt-4 text-sm font-medium ${
                message.toLowerCase().includes("success") ? "text-green-600" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}

          {/* Edit Form */}
          {editing && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left">
              <input
                type="text"
                name="name"
                value={company.name}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="Company Name"
              />
              <input
                type="text"
                name="phone"
                value={company.phone || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="Phone"
              />
              <textarea
                name="address"
                value={company.address || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="Address"
              />
              <input
                type="text"
                name="gstOrPan"
                value={company.gstOrPan || ""}
                onChange={handleChange}
                className="w-full border p-2 rounded"
                placeholder="GST / PAN"
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={saving}
                  className={`w-full py-3 rounded-lg text-white font-semibold shadow ${
                    saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-linear-to-r from-blue-500 to-purple-600 hover:opacity-90 transition"
                  }`}
                >
                  {saving ? "Saving..." : "Update Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setMessage("");
                  }}
                  className="w-full py-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </CompanyLayout>
  );
};

export default CompanyProfile;
