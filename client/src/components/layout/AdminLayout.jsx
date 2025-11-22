import React from "react";
import Sidebar from "../ui/Sidebar";
import Navbar from "../ui/Navbar";

const AdminLayout = ({ children }) => {
  return (
    <div className="flex h-screen mt-15 bg-gray-100">
      <Sidebar /> {/* Left Sidebar */}
      <div className="flex-1 flex flex-col">
        <Navbar /> {/* Top Navbar */}
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;
