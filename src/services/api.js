import axios from "axios";

// Pre-configured Axios instance ready for Node.js + Express backend integration in Phase 2
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Response Interceptor for handling global errors in Phase 2
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "An unexpected error occurred.";
    console.error("API Error:", message);
    return Promise.reject(error);
  }
);

export default api;
