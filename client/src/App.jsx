import React from "react";
import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./context/ProtectedRoute";
import PublicRoute from "./context/PublicRoute"; // NEW

// ---------------- Public Pages ----------------
import Home from "./components/common/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Profile from "./components/common/Profile";

// ---------------- Admin Pages ----------------
import AdminDashboard from "./pages/admin/Dashboard";
import Companies from "./pages/admin/Companies";
import Staffs from "./pages/admin/Staffs";
import Packages from "./pages/admin/Packages";
import Reports from "./pages/admin/Reports";
import Configurations from "./pages/admin/Configurations";
import AdminUsers from "./pages/admin/AdminUsers";
import ManageUser from "./pages/admin/ManageUser";

// ---------------- Company Pages ----------------
import CompanyDashboard from "./pages/company/Dashboard";
import CompanyStaffs from "./pages/company/Staffs";
import CompanyReports from "./pages/company/Reports";
import CompanySettings from "./pages/company/Settings";
import CompanyProfile from "./pages/company/CompanyProfile";
import ManageLeaves from "./pages/company/ManageLeaves";

// ---------------- Staff Pages ----------------
import StaffDashboard from "./pages/staff/Dashboard";
import CheckInOut from "./pages/staff/CheckInOut";
import StaffSettings from "./pages/staff/Settings";
import StaffProfile from "./pages/staff/StaffProfile";
import LeaveManagement from "./pages/staff/LeaveManagement";

// ---------------- Error Pages ----------------
import NotFound from "./pages/error/NotFound";
import Unauthorized from "./pages/error/Unauthorized";

function AppRoutes() {
  return (
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/" element={<Home />} />

      {/* Public pages restricted for logged-in users */}
      <Route element={<PublicRoute restricted={true} />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Route>

      {/* ✅ Admin Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["ADMIN", "ADMIN_STAFF"]} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/profile" element={<Profile />} />
        <Route path="/admin/companies" element={<Companies />} />
        <Route path="/admin/staffs" element={<Staffs />} />
        <Route path="/admin/packages" element={<Packages />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/configurations" element={<Configurations />} />
        <Route path="/admin/admin-users" element={<AdminUsers />} />
        <Route path="/admin/manage-users" element={<ManageUser />} />
      </Route>

      {/* ✅ Company Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["COMPANY"]} />}>
        <Route path="/company" element={<CompanyDashboard />} />
        <Route path="/company/staffs" element={<CompanyStaffs />} />
        <Route path="/company/reports" element={<CompanyReports />} />
        <Route path="/company/settings" element={<CompanySettings />} />
        <Route path="/company/profile" element={<CompanyProfile />} />
        <Route path="/company/manage-leaves" element={<ManageLeaves />} />
      </Route>

      {/* ✅ Staff Protected Routes */}
      <Route element={<ProtectedRoute allowedRoles={["STAFF"]} />}>
        <Route path="/staff" element={<StaffDashboard />} />
        <Route path="/staff/check-in-out" element={<CheckInOut />} />
        <Route path="/staff/settings" element={<StaffSettings />} />
        <Route path="/staff/profile" element={<StaffProfile />} />
        <Route path="/staff/leave-manages" element={<LeaveManagement />} />
      </Route>

      {/* ✅ Error & Fallback */}
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;