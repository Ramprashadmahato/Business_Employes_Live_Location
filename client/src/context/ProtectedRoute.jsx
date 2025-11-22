import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * ProtectedRoute props:
 *   - allowedRoles: array of roles allowed to access this route
 */
const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    // Not logged in → redirect to login
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but role not allowed → redirect to Unauthorized
    return <Navigate to="/unauthorized" replace />;
  }

  // Role allowed → render nested routes
  return <Outlet />;
};

export default ProtectedRoute;