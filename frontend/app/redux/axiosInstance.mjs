'use client';
import axios from 'axios';
import Cookies from 'js-cookie';
import { enqueueSnackbar } from 'notistack';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'; // Thêm fallback URL
console.log('API URL được cấu hình:', apiUrl);

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

    console.log(`[Request] ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// 🔄 Hàm làm mới Access Token
const refreshAccessToken = async () => {
  try {
    console.log('Đang làm mới access token...');
    const response = await axios.post(`${apiUrl}/auth/refresh-token`, {}, { withCredentials: true });
    console.log('Kết quả refresh token:', response.data);

    if (response.data.EC === 1) {
      const newAccessToken = response.data.DT.accessToken;
      Cookies.set('accessToken', newAccessToken, { secure: true, sameSite: 'strict' });
      console.log('Làm mới token thành công');
      return newAccessToken;
    } else {
      throw new Error('Không thể làm mới token');
    }
  } catch (error) {
    console.error('Lỗi khi làm mới token:', error);
    enqueueSnackbar('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.', { variant: 'info' });
    Cookies.remove('accessToken');
    window.location.href = '/auth/login'; // Chuyển hướng đến trang đăng nhập
    return null;
  }
};

// 🔄 Tự động làm mới token khi gặp lỗi 401
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`[Response] ${response.config.method.toUpperCase()} ${response.config.url} - Status: ${response.status}`);
    return response;
  },
  async (error) => {
    if (error.response) {
      console.error(`[Response Error] ${error.config?.method?.toUpperCase()} ${error.config?.url} - Status: ${error.response.status}`, error.response.data);
    } else {
      console.error('Lỗi response không có response object:', error.message);
    }

    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      console.log('Phát hiện lỗi 401, đang thử refresh token...');
      const newAccessToken = await refreshAccessToken();
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        console.log('Gửi lại request sau khi refresh token');
        return axiosInstance(originalRequest); // Gửi lại request cũ với token mới
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
