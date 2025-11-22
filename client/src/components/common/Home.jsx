import React, { useState } from "react";
import Navbar from "../../components/ui/Navbar";
import Footer from "../../components/ui/Footer";
import heroImage from "../../assets/Image/hero.webp";

const Home = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        userRole="Admin User"
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between px-6 md:px-20 pt-32 pb-20 gap-10 relative overflow-hidden grow">
        <div className="absolute top-10 left-0 w-56 h-56 bg-blue-100 rounded-full blur-3xl opacity-50 -z-10"></div>
        <div className="absolute bottom-0 right-0 w-72 h-72 bg-blue-50 rounded-full blur-2xl opacity-40 -z-10"></div>

        {/* Text Section */}
        <div className="flex-1 text-center md:text-left">
          <h1 className="text-4xl md:text-6xl font-extrabold text-blue-800 mb-6 leading-tight">
            Business <span className="text-blue-600">Sarthi</span>
          </h1>
          <p className="text-gray-600 mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed text-lg">
            A modern cross-platform <strong>Employee Management System</strong> 
            designed for seamless coordination between <strong>Admin</strong>, 
            <strong>Company</strong>, and <strong>Staff</strong>. Track real-time 
            attendance, manage reports, and ensure data security with GPS-based 
            anti-spoofing detection.
          </p>
        </div>

        {/* Image Section */}
        <div className="flex-1 relative flex justify-center md:justify-end">
          <div className="relative w-[90%] md:w-[500px] lg:w-[550px]">
            <img
              src={heroImage}
              alt="Business Sarthi App"
              className="w-full h-auto object-cover rounded-2xl shadow-xl transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <section className="px-6 md:px-20 py-16 bg-blue-50">
        <h2 className="text-3xl font-bold text-center text-blue-800 mb-12">
          System Interfaces
        </h2>

        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">
              Admin Panel
            </h3>
            <p className="text-gray-600">
              Central control hub for managing companies, staff, reports, 
              and configurations with full access control and analytics.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">
              Company Dashboard
            </h3>
            <p className="text-gray-600">
              Manage employees, monitor attendance, and view real-time 
              tracking on an interactive map with easy report generation.
            </p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition">
            <h3 className="text-xl font-semibold text-blue-700 mb-3">
              Staff Panel
            </h3>
            <p className="text-gray-600">
              Simple interface for employees to check in/out, view routes, 
              update profiles, and manage personal preferences securely.
            </p>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="px-6 md:px-20 py-16 text-center bg-white">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">
          Security & Tracking
        </h2>
        <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Business Sarthi integrates <strong>GPS-based tracking</strong> and 
          <strong>anti-spoofing detection</strong> to ensure data authenticity. 
          The system automatically detects fake locations, enforces check-out 
          if manipulation is detected, and logs every event for transparency.
        </p>
      </section>

      {/* Tech Stack Section */}
      <section className="px-6 md:px-20 py-16 bg-blue-50 text-center">
        <h2 className="text-3xl font-bold text-blue-800 mb-6">Tech Stack</h2>
        <div className="flex flex-wrap justify-center gap-8 text-gray-700 font-medium">
          <span>🖥️ React.js</span>
          <span>🎨 Tailwind CSS</span>
          <span>⚙️ Node.js</span>
          <span>🧩 Express.js</span>
          <span>🗄️ MongoDB</span>
          <span>🔐 JWT Authentication</span>
          <span>📍 Google Maps API</span>
          <span>☁️ Vercel / Render</span>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Home;
