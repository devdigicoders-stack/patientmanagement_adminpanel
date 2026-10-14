import axios from "axios";

// Helper function to normalize API base URL from environment variables
const normalizeApiUrl = () => {
  const envUrl = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").trim();
  // Strip trailing slashes
  const cleanUrl = envUrl.replace(/\/+$/, "");
  // Ensure /api suffix exists
  return cleanUrl.endsWith("/api") ? cleanUrl : `${cleanUrl}/api`;
};

// Centralized API Base URL (always points to .../api)
export const API_BASE_URL = normalizeApiUrl();

// Server Root URL without /api (useful for static uploads/assets if needed)
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api$/, "");

// Helper to construct secure document streaming URL
export const getFileUrl = (fileIdOrName) => {
  if (!fileIdOrName) return "";
  return `${API_BASE_URL}/files/${fileIdOrName}`;
};

// Pre-configured Axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response Interceptor for handling global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "An unexpected error occurred.";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default api;
