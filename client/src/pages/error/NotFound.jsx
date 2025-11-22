
import React from "react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-br from-blue-50 to-purple-100 text-center p-6">
      {/* Big 404 */}
      <h1 className="text-[10rem] font-extrabold text-transparent bg-clip-text bg-linear-to-r from-blue-600 to-purple-600 leading-none">
        404
      </h1>

      {/* Title */}
      <h2 className="text-4xl font-bold text-gray-800 mt-4">
        Oops! Page Not Found
      </h2>

      {/* Description */}
      <p className="text-gray-600 mt-3 mb-8 max-w-md">
        Sorry, the page you are looking for doesn’t exist or has been moved.
      </p>

      {/* Action Button */}
      <Link
        to="/"
        className="inline-block bg-blue-600 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700 transition duration-300 ease-in-out"
      >
        Go Back Home
      </Link>

      {/* Decorative element */}
      <div className="mt-10 w-32 h-32 bg-linear-to-r from-blue-200 to-purple-200 rounded-full blur-2xl opacity-50"></div>
    </div>
  );
};

export default NotFound;
