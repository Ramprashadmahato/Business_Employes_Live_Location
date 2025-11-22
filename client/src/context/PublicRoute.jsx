import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

/**
 * PublicRoute props:
 *   - restricted: boolean → if true, logged-in users cannot access this route (e.g., login/register)
 */
const PublicRoute = ({ restricted = false }) => {
  const { user } = useContext(AuthContext);

  if (user && restricted) {
    // If user is logged in and route is restricted → redirect to dashboard
    switch (user.role) {
      case "ADMIN":
      case "ADMIN_STAFF": // ✅ Added Admin Staff
        return <Navigate to="/admin" replace />;
      case "COMPANY":
        return <Navigate to="/company" replace />;
      case "STAFF":
        return <Navigate to="/staff" replace />;
      default:
        return <Navigate to="/" replace />;
    }
  }

  // Not logged in or unrestricted → render children
  return <Outlet />;
};

export default PublicRoute;
