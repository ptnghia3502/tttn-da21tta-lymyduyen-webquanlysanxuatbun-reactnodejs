import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL_REACT || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// Thêm interceptor để tự động gắn Bearer Token vào header
axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");
      if (token) {
        if (config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axiosInstance;
