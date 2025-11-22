import axios from "axios";

// Create Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL, // From .env
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 60000, // Increased to 30 seconds
});

// ---------------- Request Interceptor ----------------
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ---------------- Response Interceptor ----------------
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let customError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || error.message,
    };

    if (error.response) {
      const { status } = error.response;

      switch (status) {
        case 401:
          console.warn("Unauthorized: Token may have expired.");
          // Trigger logout logic instead of hard reload
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login"; // Soft redirect
          break;

        case 403:
          console.error("Forbidden: Insufficient permissions.");
          break;

        default:
          console.error("API Error:", customError.message);
      }
    } else if (error.code === "ECONNABORTED") {
      console.error("Request timeout:", error.message);
      customError.message = "Request timed out. Please try again.";
    } else if (error.request) {
      console.error("No response from server:", error.message);
      customError.message = "No response from server. Check your connection.";
    } else {
      console.error("Request setup error:", error.message);
    }

    return Promise.reject(customError);
  }
);

export default api;
