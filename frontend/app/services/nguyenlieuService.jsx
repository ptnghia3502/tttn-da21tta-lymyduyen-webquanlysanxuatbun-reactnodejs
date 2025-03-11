import axiosInstance from '../redux/axiosInstance';

const API_URL =  process.env.URL_REACT + "/api/nguyenlieu";

const  NguyenLieuService = {
  async getAll() {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },
  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },
  async create(data) {
    await axiosInstance.post(API_URL, data);
  },
  async update(id, data) {
    await axiosInstance.put(`${API_URL}/${id}`, data);
  },
  async delete(id) {
    await axiosInstance.delete(`${API_URL}/${id}`);
  },
};

export default NguyenLieuService;