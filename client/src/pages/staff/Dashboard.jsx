

import React, { useEffect, useState, useCallback } from "react";
import StaffLayout from "../../components/layout/StaffLayout";
import {
  checkIn,
  checkOut,
  getRoute,
  getSettings,
  getLeaveHistory,
  updateLocation,
} from "../../services/staffService";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { FaChartLine, FaClock, FaLock } from "react-icons/fa";
import { MdToggleOn } from "react-icons/md";
import { BsHourglassSplit } from "react-icons/bs";


// Fix Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});


const StaffDashboard = () => {
  // ✅ All required states
  const [route, setRoute] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);
  const [checking, setChecking] = useState(false);
  const [shift, setShift] = useState({ start: null, end: null });
  const [status, setStatus] = useState("Not Checked In");
  const [workingHours, setWorkingHours] = useState(0);
  const [leaveToday, setLeaveToday] = useState(false);
  const [canCheckIn, setCanCheckIn] = useState(true);
  const [canCheckOut, setCanCheckOut] = useState(false);

   // ✅ Fetch shift info
  const fetchShift = useCallback(async () => {
    try {
      const res = await getSettings();
      if (res.success && res.data.shiftTime) {
        setShift({
          start: res.data.shiftTime.start,
          end: res.data.shiftTime.end,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load shift settings");
    }
  }, []);

   // ✅ Fetch leave status
  const fetchLeaveStatus = useCallback(async () => {
    try {
      const res = await getLeaveHistory();
      if (res.success && Array.isArray(res.data)) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const onLeave = res.data.some(
          (leave) =>
            leave.status === "APPROVED" &&
            new Date(leave.startDate) <= today &&
            new Date(leave.endDate) >= today
        );
        setLeaveToday(onLeave);
        if (onLeave) {
          setStatus("On Leave Today");
          setCanCheckIn(false);
          setCanCheckOut(false);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load leave status");
    }
  }, []);
  
 // ✅ Fetch route info
  const fetchRoute = useCallback(async () => {
    try {
      const res = await getRoute();
      if (res.success && Array.isArray(res.data)) {
        const formatted = res.data.map((log) => ({
          checkInTime: log.checkIn ? new Date(log.checkIn) : null,
          checkOutTime: log.checkOut ? new Date(log.checkOut) : null,
          checkInLocation: log.checkInLocation || null,
          checkOutLocation: log.checkOutLocation || null,
          routePoints: log.routePoints || [],
        }));
        setRoute(formatted);

        // Status & button logic
        if (formatted.length === 0) {
          setStatus("Not Checked In");
          setCanCheckIn(true);
          setCanCheckOut(false);
        } else {
          const lastLog = formatted[formatted.length - 1];
          if (lastLog.checkInTime && !lastLog.checkOutTime) {
            setStatus("Checked In");
            setCanCheckIn(false);
            setCanCheckOut(true);
          } else {
            setStatus("Checked Out");
            setCanCheckIn(true);
            setCanCheckOut(false);
          }
        }

        // Working hours
        let total = 0;
        formatted.forEach((log) => {
          if (log.checkInTime && log.checkOutTime) {
            total += (log.checkOutTime - log.checkInTime) / (1000 * 60 * 60);
          }
        });
        setWorkingHours(total.toFixed(2));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load route");
    }
  }, []);

  // ✅ Initial dashboard load
  useEffect(() => {
    const loadDashboard = async () => {
      await Promise.all([fetchShift(), fetchRoute(), fetchLeaveStatus()]);
      setLoadingDashboard(false);
    };
    loadDashboard();
  }, [fetchShift, fetchRoute, fetchLeaveStatus]);


    // ✅ GPS update effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (status === "Checked In" && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(({ coords }) => {
          updateLocation({
            lat: coords.latitude,
            lng: coords.longitude,
            accuracy: coords.accuracy,
            speed: coords.speed,
          }).then((res) => {
            if (res.isSpoof) toast.warning("Fake GPS detected!");
          });
        });
      }
    }, 300000); // 5 minutes
    return () => clearInterval(interval);
  }, [status]);

 // ✅ Handle Check-In / Check-Out
  const handleCheck = async (type) => {
    if (leaveToday) return toast.error("You are on approved leave today");
    if ((type === "in" && !canCheckIn) || (type === "out" && !canCheckOut))
      return toast.error("Action not allowed at this time");
    if (!navigator.geolocation) return toast.error("Geolocation not supported");

    setChecking(true);
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const { latitude: lat, longitude: lng } = coords;
        try {
          const res = type === "in" ? await checkIn({ lat, lng }) : await checkOut({ lat, lng });
          if (res.success) {
            toast.success(res.message);
            await fetchRoute(); // Refresh route only
          } else {
            toast.error(res.message);
          }
        } catch (err) {
          console.error(err);
          toast.error("Operation failed");
        } finally {
          setChecking(false);
        }
      },
      () => toast.error("Please enable location services"),
      { enableHighAccuracy: true }
    );
  };

  // ✅ Loading screen
  if (loadingDashboard) {
    return (
      <StaffLayout>
        <p className="text-center text-gray-500 mt-10">Loading dashboard...</p>
      </StaffLayout>
    );
  }


  // ✅ Derived data
  const checkInCount = route.filter((r) => r.checkInTime).length;
  const checkOutCount = route.filter((r) => r.checkOutTime).length;

  const mapPoints = route.flatMap((r) => {
    const points = [];
    if (r.checkInLocation?.lat && r.checkInLocation?.lng)
      points.push({ pos: [r.checkInLocation.lat, r.checkInLocation.lng], type: "in", time: r.checkInTime });
    if (r.checkOutLocation?.lat && r.checkOutLocation?.lng)
      points.push({ pos: [r.checkOutLocation.lat, r.checkOutLocation.lng], type: "out", time: r.checkOutTime });
    return points;
  });

  const polylinePoints = route.flatMap((r) => r.routePoints.map((p) => [p.lat, p.lng]));
  const defaultCenter = mapPoints.length > 0 ? mapPoints[0].pos : [27.7172, 85.324];

  return (
    <StaffLayout>
      <ToastContainer position="top-right" />
      <div className="bg-linear-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Staff Dashboard</h1>

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          {/* Check-In Card */}
          <div className="bg-linear-to-r from-indigo-500 to-blue-500 text-white rounded-xl shadow p-6 flex flex-col items-center">
            <FaChartLine className="text-3xl mb-2" />
            <p className="text-lg">Today Check-Ins</p>
            <p className="text-4xl font-bold">{checkInCount}</p>
          </div>

          {/* Check-Out Card */}
          <div className="bg-linear-to-r from-red-500 to-orange-500 text-white rounded-xl shadow p-6 flex flex-col items-center">
            <FaClock className="text-3xl mb-2" />
            <p className="text-lg">Today Check-Outs</p>
            <p className="text-4xl font-bold">{checkOutCount}</p>
          </div>

          {/* Status Badge */}
          <div className="bg-linear-to-r from-green-500 to-green-400 text-white rounded-xl shadow p-6 flex items-center justify-center">
            <MdToggleOn className="text-4xl mr-2" />
            <span className="text-xl font-bold">{status}</span>
          </div>

          {/* Shift & Working Hours */}
          <div className="bg-white rounded-xl shadow p-6">
            <div className="flex items-center mb-4">
              <BsHourglassSplit className="text-gray-600 text-2xl mr-2" />
              <span className="text-gray-700 font-semibold">Shift: {shift.start || "N/A"} - {shift.end || "N/A"}</span>
            </div>
            <div className="flex items-center">
              <FaClock className="text-blue-500 text-xl mr-2" />
              <span className="text-gray-700 font-semibold">Working Hours: {workingHours} hrs</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min((workingHours / 8) * 100, 100)}%` }}></div>
            </div>
          </div>
        </div>

        {/* Check-In/Check-Out Buttons */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => handleCheck("in")}
          disabled={checking || !canCheckIn || leaveToday}
          className={`px-6 py-2 rounded-full text-white ${canCheckIn && !leaveToday ? "bg-green-600 hover:bg-green-700" : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {checking && canCheckIn ? "Processing..." : "Check In"}
        </button>
        <button
          onClick={() => handleCheck("out")}
          disabled={checking || !canCheckOut || leaveToday}
          className={`px-6 py-2 rounded-full text-white ${canCheckOut && !leaveToday ? "bg-red-600 hover:bg-red-700" : "bg-gray-400 cursor-not-allowed"
            }`}
        >
          {checking && canCheckOut ? "Processing..." : "Check Out"}
        </button>
      </div>


        {/* Route Table */}
        <div className="bg-white rounded-xl shadow p-6 mb-6 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-4">Today's Route</h2>
          {route.length === 0 ? (
            <p className="text-gray-500">No check-ins today</p>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="py-2 px-4 text-left">Check-In Time</th>
                  <th className="py-2 px-4 text-left">Check-Out Time</th>
                  <th className="py-2 px-4 text-left">Check-In Location</th>
                  <th className="py-2 px-4 text-left">Check-Out Location</th>
                </tr>
              </thead>
              <tbody>
                {route.map((r, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-2 px-4">{r.checkInTime ? r.checkInTime.toLocaleTimeString() : "-"}</td>
                    <td className="py-2 px-4">{r.checkOutTime ? r.checkOutTime.toLocaleTimeString() : "-"}</td>
                    <td className="py-2 px-4">{r.checkInLocation?.address || "-"}</td>
                    <td className="py-2 px-4">{r.checkOutLocation?.address || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Thanks for Share your Live Location</h2>
          <MapContainer center={defaultCenter} zoom={14} className="h-96 w-full rounded-xl">
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {mapPoints.map((point, idx) => (
              <Marker key={idx} position={point.pos}>
                <Popup>
                  {point.type === "in" ? "Check-In" : "Check-Out"}<br />
                  {point.time ? new Date(point.time).toLocaleTimeString() : ""}
                </Popup>
              </Marker>
            ))}
            {polylinePoints.length > 1 && <Polyline positions={polylinePoints} color="blue" />}
          </MapContainer>
        </div>
      </div>
    </StaffLayout>
  );
};

export default StaffDashboard;
