
import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getAllCompanies } from "../../services/companyService";
import { getAllStaff, getLiveLocations } from "../../services/staffService";
import { MapContainer, TileLayer, Marker, Popup, Polyline, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import {
  BuildingOffice2Icon,
  UsersIcon,
  MapPinIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/solid";

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom location icon
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

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalCompanies: 0,
    activeStaff: 0,
    liveCheckIns: 0,
  });
  const [liveLocations, setLiveLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const companiesRes = await getAllCompanies();
      const totalCompanies = companiesRes.success ? companiesRes.data.length : 0;

      const staffRes = await getAllStaff();
      const allStaff = staffRes.success ? staffRes.data : [];

      const liveRes = await getLiveLocations();
      const liveStaff = liveRes.success ? liveRes.data : [];

      setStats({
        totalCompanies,
        activeStaff: allStaff.length,
        liveCheckIns: liveStaff.length,
      });

      setLiveLocations(liveStaff);
    } catch (err) {
      console.error("Admin dashboard fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const markerPositions = liveLocations
    .filter((staff) => staff.location?.lat && staff.location?.lng)
    .map((staff) => [staff.location.lat, staff.location.lng]);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
        <button
          onClick={fetchData}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition"
        >
          <ArrowPathIcon className="w-5 h-5" />
          Refresh Live Map
        </button>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-10">Loading dashboard...</p>
      ) : (
        <>
          {/* Stats Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Total Companies */}
            <div className="flex items-center gap-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
              <BuildingOffice2Icon className="w-10 h-10" />
              <div>
                <p className="text-lg font-medium">Total Companies</p>
                <p className="text-3xl font-bold">{stats.totalCompanies}</p>
              </div>
            </div>

            {/* Total Staff */}
            <div className="flex items-center gap-4 bg-linear-to-r from-green-500 to-emerald-600 text-white rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
              <UsersIcon className="w-10 h-10" />
              <div>
                <p className="text-lg font-medium">Total Staff</p>
                <p className="text-3xl font-bold">{stats.activeStaff}</p>
              </div>
            </div>

            {/* Live Check-Ins */}
            <div className="flex items-center gap-4 bg-linear-to-r from-purple-600 to-pink-500 text-white rounded-xl p-6 shadow-lg hover:scale-105 transition-transform">
              <MapPinIcon className="w-10 h-10" />
              <div>
                <p className="text-lg font-medium">Live Check-Ins</p>
                <p className="text-3xl font-bold">{stats.liveCheckIns}</p>
              </div>
            </div>
          </div>
          {/* Live Staff Map */}
          <div className="bg-white shadow rounded-xl p-6">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">Live Staff Locations</h2>
            {liveLocations.length === 0 ? (
              <p className="text-gray-500 text-center">No active staff tracked.</p>
            ) : (
              <MapContainer center={defaultCenter} zoom={13} className="h-96 w-full rounded-xl">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <FitBounds positions={markerPositions} />
                {liveLocations.map((staff) => {
                  if (!staff.location || !staff.location.lat || !staff.location.lng) return null;
                  const loc = staff.location;
                  return (
                    <Marker key={staff._id} position={[loc.lat, loc.lng]} icon={locationIcon}>
                      <Popup>
                        <strong>{staff.name}</strong> ({staff.company})
                        <br />
                        {staff.phone || "N/A"}
                        <br />
                        Last Check-In: {staff.lastCheckIn ? new Date(staff.lastCheckIn).toLocaleTimeString() : "N/A"}
                        <br />
                        Last Check-Out: {staff.lastCheckOut ? new Date(staff.lastCheckOut).toLocaleTimeString() : "N/A"}
                        <br />
                        {staff.isSpoofed && (
                          <span className="text-red-600 font-semibold">⚠ {staff.spoofReason}</span>
                        )}
                      </Popup>
                      <Tooltip direction="top" offset={[0, -25]} opacity={1}>
                        {staff.name}
                      </Tooltip>
                    </Marker>
                  );
                })}
                {liveLocations.map((staff) =>
                  staff.routePoints && staff.routePoints.length > 1 ? (
                    <Polyline
                      key={`route-${staff._id}`}
                      positions={staff.routePoints.filter((p) => p.lat && p.lng).map((p) => [p.lat, p.lng])}
                      color="blue"
                      weight={3}
                    />
                  ) : null
                )}
              </MapContainer>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
