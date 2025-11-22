
import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import {
  HomeIcon,
  BuildingOffice2Icon,
  UsersIcon,
  UserIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import { AuthContext } from "../../context/AuthContext";

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const baseAdminLinks = [
    { name: "Dashboard", icon: <HomeIcon className="w-5 h-5" />, path: "/admin" },
    { name: "My Profile", icon: <UserIcon className="w-5 h-5" />, path: "/admin/profile" },
  ];

  const adminPermissionLinks = [
    { name: "Companies", icon: <BuildingOffice2Icon className="w-5 h-5" />, path: "/admin/companies", permission: "COMPANY_MANAGE" },
    { name: "Staffs", icon: <UsersIcon className="w-5 h-5" />, path: "/admin/staffs", permission: "STAFF_MANAGE" },
    { name: "Packages", icon: <ClipboardDocumentListIcon className="w-5 h-5" />, path: "/admin/packages", permission: "PACKAGE_MANAGE" },
  ];

  const adminOnlyLinks = [
    { name: "Reports", icon: <ChartBarIcon className="w-5 h-5" />, path: "/admin/reports" },
    { name: "Manage User", icon: <UsersIcon className="w-5 h-5" />, path: "/admin/manage-users" },
    { name: "Manage Admin", icon: <UserIcon className="w-5 h-5" />, path: "/admin/admin-users" },
    { name: "Configuration", icon: <Cog6ToothIcon className="w-5 h-5" />, path: "/admin/configurations" },
  ];

  const companyLinks = [
    { name: "Dashboard", icon: <HomeIcon className="w-5 h-5" />, path: "/company" },
    { name: "Company Profile", icon: <BuildingOffice2Icon className="w-5 h-5" />, path: "/company/profile" },
    { name: "Staffs", icon: <UsersIcon className="w-5 h-5" />, path: "/company/staffs" },
    { name: "Reports", icon: <ChartBarIcon className="w-5 h-5" />, path: "/company/reports" },
    { name: "Manage Leaves", icon: <ClipboardDocumentListIcon className="w-5 h-5" />, path: "/company/manage-leaves" },
    { name: "Settings", icon: <Cog6ToothIcon className="w-5 h-5" />, path: "/company/settings" },
  ];

  const staffLinks = [
    { name: "Dashboard", icon: <HomeIcon className="w-5 h-5" />, path: "/staff" },
    { name: "Profile", icon: <UserIcon className="w-5 h-5" />, path: "/staff/profile" },
    { name: "Leave Manage", icon: <ClipboardDocumentListIcon className="w-5 h-5" />, path: "/staff/leave-manages" },
    { name: "Check In/Out", icon: <ClipboardDocumentListIcon className="w-5 h-5" />, path: "/staff/check-in-out" },
    { name: "Settings", icon: <Cog6ToothIcon className="w-5 h-5" />, path: "/staff/settings" },
  ];

  let roleLinks = [];

  if (user?.role === "ADMIN") {
    roleLinks = [...baseAdminLinks, ...adminPermissionLinks, ...adminOnlyLinks];
  } else if (user?.role === "ADMIN_STAFF") {
    roleLinks = [...baseAdminLinks];
    roleLinks.push(...adminPermissionLinks.filter(link => user?.permissions?.includes(link.permission)));
  } else if (user?.role === "COMPANY") {
    roleLinks = companyLinks;
  } else if (user?.role === "STAFF") {
    roleLinks = staffLinks;
  }

  return (
    <div className="w-64 min-h-screen bg-linear-to-b from-[#1f2b42] to-[#263752] text-gray-300 flex flex-col p-6">
      {/* Sidebar Header */}
      <h2 className="text-xl font-bold mb-8 text-white">
        {user?.role === "ADMIN" || user?.role === "ADMIN_STAFF"
          ? "Admin Panel"
          : user?.role === "COMPANY"
          ? "Company Panel"
          : "Staff Panel"}
      </h2>

      {/* Navigation Links */}
      <nav className="flex flex-col gap-2">
        {roleLinks.map(link => (
          <NavLink
            key={link.name}
            to={link.path}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 py-2 px-4 rounded-lg transition-all duration-300 ${
                isActive
                  ? "bg-linear-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:bg-linear-to-r hover:from-blue-500 hover:to-purple-500 hover:text-white"
              }`
            }
          >
            {link.icon}
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
