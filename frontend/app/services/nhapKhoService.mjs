import axiosInstance from "../redux/axiosInstance.mjs";

const API_URL = `${process.env.NEXT_PUBLIC_URL_REACT || 'http://localhost:3001'}/api/nhap-kho`;

const NhapKhoService = {
  // Lấy danh sách phiếu nhập kho
  async getAll(params = { page: 1, limit: 10, search: "" }) {
    const response = await axiosInstance.get(API_URL, { params });
    return response.data;
  },

  // Lấy chi tiết phiếu nhập kho
  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  // Tạo phiếu nhập kho mới
  async create(data) {
    const response = await axiosInstance.post(API_URL, data);
    return response.data;
  },

  // Cập nhật phiếu nhập kho
  async update(id, data) {
    const response = await axiosInstance.put(`${API_URL}/${id}`, data);
    return response.data;
  },

  // Xóa phiếu nhập kho
  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  }
};

export default NhapKhoService; 