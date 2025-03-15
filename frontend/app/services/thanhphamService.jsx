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
    const payload = {
      ten_thanh_pham: data.ten_thanh_pham,
      mo_ta: data.mo_ta,
      don_vi_tinh: data.don_vi_tinh,
      so_luong_ton: data.so_luong_ton,
      gia_ban: data.gia_ban,
      ngay_san_xuat: data.ngay_san_xuat,
      trang_thai: data.trang_thai,
    };
    console.log('Dữ liệu gửi lên:', payload);
    await axiosInstance.post(API_URL, payload);
  },

  async update(id, data) {
    const payload = {
      ten_thanh_pham: data.ten_thanh_pham,
      mo_ta: data.mo_ta,
      don_vi_tinh: data.don_vi_tinh,
      so_luong_ton: data.so_luong_ton,
      gia_ban: data.gia_ban,
      ngay_san_xuat: data.ngay_san_xuat,
      trang_thai: data.trang_thai,
    };
    await axiosInstance.put(`${API_URL}/${id}`, payload);
  },

  async delete(id) {
    await axiosInstance.delete(`${API_URL}/${id}`);
  },
};

export default ThanhPhamService;
