
import React, { useEffect, useState } from "react";
import StaffLayout from "../../components/layout/StaffLayout";
import { getMyProfile, updateMyProfile } from "../../services/staffService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

const StaffProfile = () => {
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: "", phone: "" });
  const [saving, setSaving] = useState(false);

  // Fetch Profile
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await getMyProfile();
      if (res?.success) {
        setStaff(res.data);
        setFormData({
          name: res.data.name || "",
          phone: res.data.phone || "",
        });
      } else {
        toast.error(res?.message || "Failed to fetch profile");
      }
    } catch (err) {
      console.error("Fetch profile error:", err);
      toast.error("Failed to fetch profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // Save Profile
  const handleSaveProfile = async () => {
    if (!formData.name.trim()) return toast.error("Name cannot be empty");

    const updateData = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
    };

    setSaving(true);
    try {
      const res = await updateMyProfile(updateData);
      if (res?.success) {
        toast.success(res.message);
        setStaff(res.data);
        setEditing(false);

        // Update localStorage user info
        const currentUser = JSON.parse(localStorage.getItem("user")) || {};
        if (currentUser.id === res.data._id) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...currentUser,
              name: res.data.name,
              phone: res.data.phone || currentUser.phone,
            })
          );
        }
      } else {
        toast.error(res?.message || "Profile update failed");
      }
    } catch (err) {
      console.error("Update profile error:", err);
      toast.error("Profile update failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <StaffLayout>
        <div className="text-center py-20 text-gray-500">Loading profile...</div>
      </StaffLayout>
    );

  if (!staff)
    return (
      <StaffLayout>
        <div className="text-center py-20 text-gray-500">
          Profile data not found. Please refresh the page.
        </div>
      </StaffLayout>
    );

  return (
    <StaffLayout>
      <ToastContainer position="top-right" />
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Avatar */}
          <div className="w-24 h-24 mx-auto rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
            <UserIcon className="w-12 h-12" />
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold mt-4">{staff.name || "Staff"}</h2>

          {/* Details */}
          <div className="mt-6 space-y-3 text-left">
            <p className="flex items-center gap-2 text-gray-600">
              <UserIcon className="w-5 h-5 text-gray-500" />
              <span>Name: {staff.name}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <EnvelopeIcon className="w-5 h-5 text-gray-500" />
              <span>Email: {staff.email}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <PhoneIcon className="w-5 h-5 text-gray-500" />
              <span>Phone: {staff.phone || "N/A"}</span>
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

          {/* Edit Form */}
          {editing && (
            <div className="mt-6 space-y-4 text-left">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Name"
                required
              />
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Phone"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSaveProfile}
                  disabled={saving}
                  className={`w-full py-3 rounded-lg text-white font-semibold shadow ${
                    saving
                      ? "bg-gray-400 cursor-not-allowed"
                      : "bg-linear-to-r from-blue-500 to-purple-600 hover:opacity-90 transition"
                  }`}
                >
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="w-full py-3 rounded-lg bg-gray-300 hover:bg-gray-400 transition font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffProfile;
