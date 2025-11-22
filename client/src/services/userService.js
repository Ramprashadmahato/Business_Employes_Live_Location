import api from "./api";

// Get user profile by ID
export const getUserProfile = (id) => api.get(`/users/${id}`);

// Update user profile (role-based)
export const updateUserProfile = (id, data) => api.put(`/users/${id}`, data);

// Request OTP for password change
export const requestChangePasswordOtp = () => api.post(`/users/request-change-password-otp`);

// Change password with OTP
export const changePasswordWithOtp = (otp, newPassword) =>
  api.post(`/users/change-password-with-otp`, { otp, newPassword });

// Admin: Get all users
export const getAllUsers = () => api.get(`/users`);

// Admin: Delete a user
export const deleteUser = (id) => api.delete(`/users/${id}`);