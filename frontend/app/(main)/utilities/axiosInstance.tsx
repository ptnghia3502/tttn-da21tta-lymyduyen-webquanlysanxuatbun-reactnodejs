import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_URL_SERVER, // Kiểm tra biến môi trường này đã được khai báo chưa
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
