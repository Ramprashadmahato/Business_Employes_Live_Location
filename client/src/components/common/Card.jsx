import React from "react";

const Card = ({ title, children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      {title && <h2 className="text-lg font-semibold text-gray-700 mb-4">{title}</h2>}
      <div>{children}</div>
    </div>
  );
};

export default Card;
