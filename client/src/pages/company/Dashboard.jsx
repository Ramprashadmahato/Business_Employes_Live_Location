
import React, { useState, useEffect } from "react";
import CompanyLayout from "../../components/layout/CompanyLayout";
import { getAllStaff, getAllLeaveRequests, getLiveLocations } from "../../services/staffService";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaUsers, FaCheckCircle, FaCalendarAlt, FaSyncAlt } from "react-icons/fa";

// Fix Leaflet default icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const locationIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

const defaultCenter = [27.7172, 85.324]; // Kathmandu fallback

const FitBounds = ({ positions }) => {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 0) {
      const bounds = L.latLngBounds(positions);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [positions, map]);
  return null;
};

const Dashboard = () => {
  const [staffs, setStaffs] = useState([]);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [liveLocations, setLiveLocations] = useState([]);
  const [loadingLive, setLoadingLive] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState(600);

  const fetchStaticData = async () => {
    try {
      const staffRes = await getAllStaff();
      if (staffRes.success) setStaffs(staffRes.data || []);

      const leaveRes = await getAllLeaveRequests();
      if (leaveRes.success) setLeaveRequests(leaveRes.data || []);
    } catch (err) {
      console.error("Static data fetch error:", err);
    }
  };

  const fetchLiveLocations = async () => {
    setLoadingLive(true);
    try {
      const res = await getLiveLocations();
      if (res.success) {
        setLiveLocations(res.data || []);
        if (res.config?.locationTrackingInterval) {
          setRefreshInterval(res.config.locationTrackingInterval * 60);
        }
      }
    } catch (err) {
      console.error("Live locations fetch error:", err);
    } finally {
      setLoadingLive(false);
    }
  };

  useEffect(() => {
    fetchStaticData();
    fetchLiveLocations();
    const interval = setInterval(fetchLiveLocations, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [refreshInterval]);

  const totalStaff = staffs.length;
  const activeStaff = liveLocations.length;
  const today = new Date().toISOString().split("T")[0];
  const onLeaveStaff = leaveRequests.filter(
    (leave) =>
      leave.status?.toLowerCase() === "approved" &&
      leave.startDate <= today &&
      leave.endDate >= today
  ).length;

  const markerPositions = liveLocations
    .filter((staff) => staff.location?.lat && staff.location?.lng)
    .map((staff) => [staff.location.lat, staff.location.lng]);

  return (
    <CompanyLayout>
      <div className="p-6 bg-linear-to-br from-blue-50 to-purple-50 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-800">Company Dashboard</h1>
          <button
            onClick={fetchLiveLocations}
            className="flex items-center gap-2 px-4 py-2 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-full shadow hover:opacity-90 transition"
          >
            <FaSyncAlt /> Refresh Live Map
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Total Staff */}
          <div className="bg-linear-to-r  h-35 from-indigo-500 to-blue-500 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <FaUsers className="text-4xl mb-2" />
            <h2 className="text-lg font-semibold">Total Staff</h2>
            <p className="text-3xl font-bold">{totalStaff}</p>
          </div>

          {/* Active Staff */}
          <div className="bg-linear-to-r  h-35 from-green-500 to-green-400 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <FaCheckCircle className="text-4xl mb-2" />
            <h2 className="text-lg font-semibold">Active Staff</h2>
            <p className="text-3xl font-bold">{activeStaff}</p>
          </div>

          {/* On Leave Staff */}
          <div className="bg-linear-to-r  h-35 from-red-500 to-orange-500 text-white rounded-xl shadow-lg p-6 flex flex-col items-center">
            <FaCalendarAlt className="text-4xl mb-2" />
            <h2 className="text-lg font-semibold">On Leave Staff</h2>
            <p className="text-3xl font-bold">{onLeaveStaff}</p>
          </div>
        </div>

        {/* Map Section */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Staff Live Locations</h2>
          {loadingLive ? (
            <p className="text-gray-500 text-center">Loading live locations...</p>
          ) : liveLocations.length === 0 ? (
            <p className="text-gray-500 text-center">No active staff found.</p>
          ) : (
            <MapContainer center={defaultCenter} zoom={13} className="h-[500px] w-full rounded-xl">
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <FitBounds positions={markerPositions} />
              {liveLocations.map((staff) => {
                const loc = staff.location || defaultCenter;
                return (
                  <Marker key={staff._id} position={[loc.lat, loc.lng]} icon={locationIcon}>
                    <Popup>
                      <strong>{staff.name}</strong> ({staff.company})
                      <br />
                      {staff.phone || "N/A"}
                      <br />
                      Last Check-In:{" "}
                      {staff.lastCheckIn
                        ? new Date(staff.lastCheckIn).toLocaleTimeString()
                        : "N/A"}
                      <br />
                      Last Check-Out:{" "}
                      {staff.lastCheckOut
                        ? new Date(staff.lastCheckOut).toLocaleTimeString()
                        : "N/A"}
                      <br />
                      {staff.isSpoofed && (
                        <span className="text-red-600 font-semibold">
                          ⚠ {staff.spoofReason}
                        </span>
                      )}
                    </Popup>
                    <Tooltip>{staff.name}</Tooltip>
                  </Marker>
                );
              })}
              {liveLocations.map((staff) =>
                staff.routePoints && staff.routePoints.length > 1 ? (
                  <Polyline
                    key={`route-${staff._id}`}
                    positions={staff.routePoints.map((p) => [p.lat, p.lng])}
                    color="blue"
                  />
                ) : null
              )}
            </MapContainer>
          )}
        </div>
      </div>
    </CompanyLayout>
  );
};

export default Dashboard;
