import React from "react";

const Button = ({ children, onClick, type = "button", variant = "primary", className = "" }) => {
  // Tailwind classes for variants
  const baseClasses = "px-4 py-2 rounded font-semibold focus:outline-none transition-colors duration-200";
  const variants = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const appliedClasses = `${baseClasses} ${variants[variant]} ${className}`;

  return (
    <button type={type} onClick={onClick} className={appliedClasses}>
      {children}
    </button>
  );
};

export default Button;
