
import React, { useContext } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import heroImage from "../../assets/Image/hero.webp";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!user;
  const userRole = user?.role || "User";

  const handleLogout = () => {
    logout(); // Clear user and token from context/localStorage
    navigate("/login"); // Redirect to login page
  };

  // Determine dashboard link based on role
  const getDashboardLink = () => {
    if (userRole === "ADMIN" || userRole === "ADMIN_STAFF") return "/admin";
    if (userRole === "COMPANY") return "/company";
    if (userRole === "STAFF") return "/staff";
    return "/";
  };

  return (
    <nav className="h-[70px] bg-white flex items-center justify-between px-6 md:px-10 shadow-md fixed top-0 left-0 w-full z-50">
      {/* Logo / App Name */}
      <div className="flex items-center space-x-3">
        <Link to="/" className="flex items-center space-x-3">
          <img
            src={heroImage}
            alt="Business Sarthi Logo"
            className="h-10 w-10 rounded-full"
          />
          <h1 className="text-xl md:text-2xl font-bold bg-linear-to-r from-blue-500 to-purple-600 text-transparent bg-clip-text">
            Business <br /> Sarthi
          </h1>
        </Link>
      </div>

      {/* Right Side (User Info / Auth Buttons) */}
      <div className="flex items-center gap-4">
        {!isLoggedIn ? (
          <>
            <Link
              to="/register"
              className="text-blue-600 font-medium hover:underline"
            >
              Register
            </Link>
            <Link
              to="/login"
              className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition"
            >
              Login
            </Link>
          </>
        ) : (
          <>
            {/* Show Dashboard link only if NOT on dashboard route */}
            {location.pathname !== getDashboardLink() && (
              <Link
                to={getDashboardLink()}
                className="bg-gray-100 text-blue-600 px-4 py-1.5 rounded hover:bg-gray-200 transition"
              >
                Dashboard
              </Link>
            )}

            {/* Role + Icon */}
            <div className="flex items-center gap-2">
              <span className="text-gray-700 font-semibold uppercase">
                {userRole}
              </span>
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-gray-300"
                />
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-8 h-8 text-gray-500"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z" />
                </svg>
              )}
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="bg-linear-to-r from-blue-500 to-blue-600 text-white px-5 py-2 rounded-lg shadow hover:from-blue-600 hover:to-blue-700 transition"
            >
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
