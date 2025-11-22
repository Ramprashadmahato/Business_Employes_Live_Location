
import React from "react";
import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-purple-100 text-center p-6">
      {/* Big 403 */}
      <h1 className="text-[10rem] font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 leading-none">
        403
      </h1>

      {/* Title */}
      <h2 className="text-4xl font-bold text-gray-800 mt-4">
        Unauthorized Access
      </h2>

      {/* Description */}
      <p className="text-gray-600 mt-3 mb-8 max-w-md">
        You do not have permission to view this page. Please contact your administrator if you believe this is an error.
      </p>

      {/* Action Button */}
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700 transition duration-300 ease-in-out"
      >
        Go Back Home
      </Link>

      {/* Decorative element */}
      <div className="mt-10 w-32 h-32 bg-linear-to-r from-red-200 to-orange-200 rounded-full blur-2xl opacity-50"></div>
    </div>
  );
};

export default Unauthorized;
