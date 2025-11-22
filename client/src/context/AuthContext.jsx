import React, { createContext, useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setLoading(false);

    // Auto logout on 401
    const responseInterceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      api.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Login
  const login = (userData, token) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);
    setUser(userData);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  // Logout
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    delete api.defaults.headers.common["Authorization"];
    navigate("/login");
  };

  // Forgot Password Hybrid
  const forgotPasswordHybrid = async (email) => {
    try {
      const { data } = await api.post("/auth/forgot-password-hybrid", { email });
      return data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  };

  // Verify OTP
  const verifyOtp = async (email, otp) => {
    try {
      const { data } = await api.post("/auth/verify-otp", { email, otp });
      return data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  };

  // Reset Password after OTP
  const resetPasswordHybrid = async (email, newPassword) => {
    try {
      const { data } = await api.post("/auth/reset-password-hybrid", { email, newPassword });
      return data;
    } catch (error) {
      throw error.response?.data || { success: false, message: error.message };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        forgotPasswordHybrid,
        verifyOtp,
        resetPasswordHybrid,
        loading,
      }}
    >
      {loading ? <div>Loading...</div> : children}
    </AuthContext.Provider>
  );
};