import axiosInstance from "../redux/axiosInstance.mjs";

const API_URL = `${process.env.NEXT_PUBLIC_URL_REACT}/api/users`;
const UserService = {
  // Đăng nhập
  async login(username, password) {
    const response = await axiosInstance.post(`${API_URL}/login`, { username, password });
    return response.data; // { token, user }
  },

  
  // Làm mới token
  async refreshToken(refreshToken) {
    const response = await axiosInstance.post(`${API_URL}/refresh-token`, { refreshToken });
    return response.data; // { accessToken }
  },

  // Lấy danh sách user
  async getAll(params = { page: 1, limit: 10, search: "", status: undefined }) {
    const response = await axiosInstance.get(API_URL, { params });
    return response.data;
  },

  // Lấy thông tin user theo ID
  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Tạo user mới
  async create(data) {
    return axiosInstance.post(API_URL, data);
  },

  // Cập nhật user
  async update(id, data) {
    return axiosInstance.put(`${API_URL}/${id}`, data);
  },

  // Xóa user
  async delete(id) {
    return axiosInstance.delete(`${API_URL}/${id}`);
  },

  // Cập nhật mật khẩu
  async updatePassword(id, newPassword) {
    return axiosInstance.put(`${API_URL}/password/${id}`, { newPassword });
  },

  // Lấy danh sách quyền của user
  async getRoles(userId) {
    const response = await axiosInstance.get(`${API_URL}/${userId}/roles`);
    return response.data;
  },

  // Phân quyền cho user
  async assignRoles(userId, roleIds) {
    return axiosInstance.post(`${API_URL}/${userId}/roles`, { roleIds });
  },

  // Đếm số lượng Admin
  async countAdmins() {
    const response = await axiosInstance.get(`${API_URL}/count/admins`);
    return response.data.count;
  },

  // Kiểm tra user có phải Admin không
  async isAdmin(userId) {
    const response = await axiosInstance.get(`${API_URL}/${userId}/isAdmin`);
    return response.data.isAdmin;
  },
};

// Hàm kiểm tra quyền Admin
export const verifyAdmin = (user) => {
  return user?.role === "Admin";
};

export default UserService;

// Log kiểm tra
console.log("User API_URL:", API_URL);
