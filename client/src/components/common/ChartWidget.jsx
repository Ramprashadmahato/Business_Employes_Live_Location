import React from "react";

const ChartWidget = ({ title = "Chart Title", value = "N/A", children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-2">{title}</h3>
      <p className="text-2xl font-bold text-blue-600 mb-4">{value}</p>
      <div className="h-40 bg-gray-100 rounded flex items-center justify-center">
        {/* Chart placeholder */}
        {children ? children : <span className="text-gray-400">Chart Placeholder</span>}
      </div>
    </div>
  );
};

export default ChartWidget;
