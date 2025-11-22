
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AdminLayout from "../layout/AdminLayout";
import {
  getUserProfile,
  updateUserProfile,
  requestChangePasswordOtp,
  changePasswordWithOtp,
} from "../../services/userService";
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  IdentificationIcon,
  ShieldCheckIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";

const Profile = () => {
  const { user } = useContext(AuthContext);

  const [profile, setProfile] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);
  const [otpData, setOtpData] = useState({ otp: "", newPassword: "" });

  // ✅ Fetch profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await getUserProfile(user.id);
        setProfile(res.data.user);
      } catch (err) {
        setError("Failed to load profile");
      }
    };
    if (user?.id) fetchProfile();
  }, [user?.id]);

  // ✅ Update profile
  const handleUpdate = async () => {
    setMessage(null);
    setError(null);
    try {
      setLoading(true);
      const updateData = {
        name: profile.name,
        email: profile.email,
        role: profile.role,
        status: profile.status,
        permissions: profile.permissions,
        phone: profile.phone,
      };

      const res = await updateUserProfile(user.id, updateData);
      if (res.data.success) {
        setMessage("Profile updated successfully!");
        setIsEditing(false);
      } else {
        setError(res.data.message || "Update failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Request OTP
  const handleRequestOtp = async () => {
    setMessage(null);
    setError(null);
    try {
      setLoading(true);
      await requestChangePasswordOtp();
      setOtpRequested(true);
      setMessage("OTP sent to your email. Enter OTP and new password below.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Change password
  const handlePasswordChange = async () => {
    setMessage(null);
    setError(null);
    try {
      setLoading(true);
      await changePasswordWithOtp(otpData.otp, otpData.newPassword);
      setMessage("Password changed successfully!");
      setIsChangingPassword(false);
      setOtpRequested(false);
      setOtpData({ otp: "", newPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="max-w-lg w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          {/* Profile Image */}
          <div className="w-24 h-24 mx-auto rounded-full bg-linear-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white">
            <UserIcon className="w-12 h-12" />
          </div>

          {/* Name */}
          <h2 className="text-2xl font-bold mt-4">{profile.name || "User"}</h2>

          {/* Details */}
          <div className="mt-6 space-y-3 text-left">
            <p className="flex items-center gap-2 text-gray-600">
              <UserIcon className="w-5 h-5 text-gray-500" />
              <span>Name: {profile.name || "N/A"}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <EnvelopeIcon className="w-5 h-5 text-gray-500" />
              <span>Email: {profile.email || "N/A"}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <PhoneIcon className="w-5 h-5 text-gray-500" />
              <span>Phone: {profile.phone || "Not Provided"}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <IdentificationIcon className="w-5 h-5 text-gray-500" />
              <span>Role: {profile.role || "N/A"}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <ShieldCheckIcon className="w-5 h-5 text-gray-500" />
              <span>Status: {profile.status || "N/A"}</span>
            </p>
            <p className="flex items-center gap-2 text-gray-600">
              <KeyIcon className="w-5 h-5 text-gray-500" />
              <span>
                Permissions:{" "}
                {profile.permissions?.length
                  ? profile.permissions.join(", ")
                  : "None"}
              </span>
            </p>
          </div>

          {/* Buttons */}
          <div className="mt-6 space-y-3">
            <button
              onClick={() => setIsEditing(true)}
              className="w-full bg-linear-to-r from-blue-500 to-purple-600 text-white font-semibold py-3 rounded-lg shadow hover:opacity-90 transition"
            >
              Edit Profile
            </button>
            <button
              onClick={() => setIsChangingPassword(true)}
              className="w-full bg-linear-to-r from-yellow-400 to-orange-500 text-white font-semibold py-3 rounded-lg shadow hover:opacity-90 transition"
            >
              Change Password
            </button>
          </div>

          {/* Messages */}
          {message && <p className="text-green-600 mt-4">{message}</p>}
          {error && <p className="text-red-600 mt-4">{error}</p>}

          {/* Edit Form */}
          {isEditing && (
            <div className="mt-6 space-y-4 text-left">
              <input
                type="text"
                value={profile.name || ""}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Name"
              />
              <input
                type="email"
                value={profile.email || ""}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Email"
              />
              <input
                type="text"
                value={profile.phone || ""}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full border p-2 rounded"
                placeholder="Phone"
              />
              <select
                value={profile.role || ""}
                onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="ADMIN_STAFF">ADMIN_STAFF</option>
              </select>
              <select
                value={profile.status || ""}
                onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                className="w-full border p-2 rounded"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              <input
                type="text"
                value={profile.permissions?.join(", ") || ""}
                onChange={(e) =>
                  setProfile({ ...profile, permissions: e.target.value.split(",") })
                }
                className="w-full border p-2 rounded"
                placeholder="Permissions (comma separated)"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleUpdate}
                  className="bg-green-600 text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="bg-gray-400 text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Change Password Form */}
          {isChangingPassword && (
            <div className="mt-6 space-y-4 text-left">
              {!otpRequested ? (
                <button
                  onClick={handleRequestOtp}
                  className="bg-blue-600 text-white px-4 py-2 rounded w-full"
                  disabled={loading}
                >
                  Request OTP
                </button>
              ) : (
                <>
                  <input
                    type="text"
                    value={otpData.otp}
                    onChange={(e) => setOtpData({ ...otpData, otp: e.target.value })}
                    className="w-full border p-2 rounded"
                    placeholder="Enter OTP"
                  />
                  <input
                    type="password"
                    value={otpData.newPassword}
                    onChange={(e) =>
                      setOtpData({ ...otpData, newPassword: e.target.value })
                    }
                    className="w-full border p-2 rounded"
                    placeholder="New Password"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handlePasswordChange}
                      className="bg-green-600 text-white px-4 py-2 rounded"
                      disabled={loading}
                    >
                      Change Password
                    </button>
                    <button
                      onClick={() => {
                        setIsChangingPassword(false);
                        setOtpRequested(false);
                      }}
                      className="bg-gray-400 text-white px-4 py-2 rounded"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Profile;
