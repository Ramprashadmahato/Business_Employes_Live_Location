import React from "react";

const MapView = ({ height = "h-96", children }) => {
  return (
    <div className={`w-full ${height} bg-gray-200 rounded-lg flex items-center justify-center`}>
      {children ? (
        children
      ) : (
        <p className="text-gray-500">Map Placeholder (Google Maps will be integrated here)</p>
      )}
    </div>
  );
};

export default MapView;
