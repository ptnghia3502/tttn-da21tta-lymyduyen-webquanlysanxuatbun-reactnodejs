import axiosInstance from '../redux/axiosInstance.mjs';
debugger
const API_URL = `${process.env.NEXT_PUBLIC_URL_REACT}/api/nguyen-vat-lieu`;

const NguyenLieuService = {
  async getAll() {
    const response = await axiosInstance.get(API_URL);
    return response.data;
  },
  async getById(id) {
    const response = await axiosInstance.get(`${API_URL}/${id}`);
    return response.data;
  },
  async create(data) {
    const payload = {
      Ten_nguyen_lieu: data.Ten_nguyen_lieu,
      Mo_ta: data.Mo_ta,
      Don_vi_tinh_id: data.Don_vi_tinh_id,
      So_luong: data.So_luong,
      Gia: data.Gia,
      Trang_thai: data.Trang_thai,
    };
    await axiosInstance.post(API_URL, payload);
  },
  async update(id, data) {
    const payload = {
      Ten_nguyen_lieu: data.Ten_nguyen_lieu,
      Mo_ta: data.Mo_ta,
      Don_vi_tinh_id: data.Don_vi_tinh_id,
      So_luong: data.So_luong,
      Gia: data.Gia,
      Trang_thai: data.Trang_thai,
    };
    await axiosInstance.put(`${API_URL}/${id}`, payload);
  },
  async delete(id) {
    await axiosInstance.delete(`${API_URL}/${id}`);
  },
};

export default NguyenLieuService;