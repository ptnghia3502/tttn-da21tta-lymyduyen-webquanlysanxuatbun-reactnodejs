import axiosInstance from '../redux/axiosInstance.mjs';

const API_URL = `/api/thanh-pham`;

const ThanhPhamService = {
  async getAll() {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },

  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },

  async create(data) {

    // vậy cho nhanh
    const payload = {
      ...data
    };
    console.log('Dữ liệu gửi lên:', payload);
    await axiosInstance.post(API_URL, payload);
  },

  async update(id, data) {
    const payload = {
      ...data
    };
    await axiosInstance.put(`${API_URL}/${id}`, payload);
  },

  async delete(id) {
    await axiosInstance.delete(`${API_URL}/${id}`);
  }
};

export default ThanhPhamService;
