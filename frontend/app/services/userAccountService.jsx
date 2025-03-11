import axiosInstance from '../redux/axiosInstance';

import { enqueueSnackbar } from 'notistack';

const BASE_URL = process.env.NEXT_PUBLIC_URL_SERVER;

// Lấy danh sách tất cả người dùng
export const getAllUsers = async (searchParams = {}) => {
  try {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(`${key}[]`, item));
      } else {
        params.append(key, value);
      }
    });

    console.log('params size:', params.toString(), 'size:', params.size); // Kiểm tra params sau khi thêm

    const response = await axiosInstance.get(`${BASE_URL}/users?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
    enqueueSnackbar(error.response?.data?.EM || 'Lỗi khi lấy danh sách người dùng', { variant: 'error' });
    throw error;
  }
};
// Lấy thông tin người dùng theo ID
export const getUserById = async (id) => {
  try {
    const response = await axiosInstance.get(`${BASE_URL}/users/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    enqueueSnackbar(error.response?.data?.EM || 'Lỗi khi lấy thông tin người dùng', { variant: 'error' });
    throw error;
  }
};

// Thêm mới người dùng
export const createUser = async (userData) => {
  try {
    const response = await axiosInstance.post(`${BASE_URL}/users`, userData);
    enqueueSnackbar(response.data.EM || 'Thêm người dùng thành công', {
      variant: 'success'
    });
    return response.data;
  } catch (error) {
    console.error('Error creating user:', error);
    enqueueSnackbar(error.response?.data?.EM || 'Lỗi khi thêm người dùng', {
      variant: 'error'
    });
    throw error;
  }
};

// Cập nhật thông tin người dùng
export const updateUser = async (id, formData) => {
  try {
    const response = await axiosInstance.put(`${BASE_URL}/users/${id}`, formData);
    enqueueSnackbar(response.data.EM || 'Cập nhật người dùng thành công', {
      variant: 'success'
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error);
    enqueueSnackbar(error.response?.data?.EM || 'Lỗi khi cập nhật người dùng', {
      variant: 'error'
    });
    throw error;
  }
};

// Xóa người dùng
export const deleteUser = async (id) => {
  try {
    const response = await axiosInstance.delete(`${BASE_URL}/users/${id}`);
    enqueueSnackbar(response.data.EM || 'Xóa người dùng thành công', {
      variant: 'success'
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    enqueueSnackbar(error.response?.data?.EM || 'Lỗi khi xóa người dùng', {
      variant: 'error'
    });
    throw error;
  }
};

export const verifyAdmin = async (accessToken, pathName) => {
  if (!accessToken) {
    return false;
  }
  console.log('accessToken', accessToken);

  try {
    const response = await axiosInstance.post(`${process.env.NEXT_PUBLIC_URL_SERVER}/verify-admin`, { token: accessToken, pathName: pathName });

    console.log('response.data admin:', response.data.DT.role);

    return response.data.DT.role;
  } catch (error) {
    enqueueSnackbar('Bạn không có quyền truy cập vào trang này', {
      variant: 'info'
    });
    console.error('Error verifying admin:', error);
    return false;
  }
};
