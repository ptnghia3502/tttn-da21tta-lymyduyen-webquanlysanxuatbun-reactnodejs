'use client';
import axios from 'axios';
import Cookies from 'js-cookie';
import { enqueueSnackbar } from 'notistack';

const apiUrl = process.env.NEXT_PUBLIC_URL_REACT; // Đảm bảo dùng đúng biến môi trường
const axiosInstance = axios.create({
  baseURL: apiUrl,
  withCredentials: true // Đảm bảo gửi cookie (refresh token) trong mọi request
});

// 🛠️ Thêm Bearer Token vào tất cả request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = Cookies.get('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.headers['Content-Type'] = 
      config.data instanceof FormData ? 'multipart/form-data' : 'application/json';
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔄 Hàm làm mới Access Token
const refreshAccessToken = async () => {
  try {
    const response = await axios.post(`${apiUrl}/auth/refresh-token`, {}, { withCredentials: true });
    if (response.data.EC === 1) {
      const newAccessToken = response.data.DT.accessToken;
      Cookies.set('accessToken', newAccessToken, { secure: true, sameSite: 'strict' });

      return newAccessToken;
    } else {
      throw new Error('Không thể làm mới token');
    }
  } catch (error) {
    enqueueSnackbar('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', { variant: 'info' });
    Cookies.remove('accessToken');
    window.location.href = '/auth/login'; // Chuyển hướng đến trang đăng nhập
    return null;
  }
};

// 🔄 Tự động làm mới token khi gặp lỗi 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest); // Gửi lại request cũ với token mới
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
