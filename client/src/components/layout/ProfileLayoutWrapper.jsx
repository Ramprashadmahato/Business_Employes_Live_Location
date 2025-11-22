import React, { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import AdminLayout from "../../components/layout/AdminLayout";
import CompanyLayout from "../../components/layout/CompanyLayout";
import StaffLayout from "../../components/layout/StaffLayout";

const ProfileLayoutWrapper = ({ children }) => {
  const { user } = useContext(AuthContext);

  if (user.role === "ADMIN" || user.role === "ADMIN_STAFF") {
    return <AdminLayout>{children}</AdminLayout>;
  }
  if (user.role === "COMPANY") {
    return <CompanyLayout>{children}</CompanyLayout>;
  }
  if (user.role === "STAFF") {
    return <StaffLayout>{children}</StaffLayout>;
  }

  return <div>{children}</div>; // fallback
};

export default ProfileLayoutWrapper;