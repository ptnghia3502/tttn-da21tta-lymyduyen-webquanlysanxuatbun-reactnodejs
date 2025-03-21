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
    // Chuẩn bị dữ liệu gửi lên
    const payload = {
      Ten_thanh_pham: data.Ten_thanh_pham,
      Don_vi_tinh: data.Don_vi_tinh,
      Gia_ban: parseFloat(data.Gia_ban),
      So_luong: parseFloat(data.So_luong || 0),
      Mo_ta: data.Mo_ta
    };
    
    console.log('Dữ liệu gửi lên khi tạo thành phẩm:', payload);
    const response = await axiosInstance.post(API_URL, payload);
    return response.data;
  },

  async update(id, data) {
    const payload = {
      Ten_thanh_pham: data.Ten_thanh_pham,
      Don_vi_tinh: data.Don_vi_tinh,
      Gia_ban: parseFloat(data.Gia_ban),
      So_luong: data.So_luong !== undefined ? parseFloat(data.So_luong) : undefined,
      Mo_ta: data.Mo_ta
    };
    
    console.log(`Dữ liệu gửi lên khi cập nhật thành phẩm ID=${id}:`, payload);
    const response = await axiosInstance.put(`${API_URL}/${id}`, payload);
    return response.data;
  },

  async delete(id) {
    const response = await axiosInstance.delete(`${API_URL}/${id}`);
    return response.data;
  }
};

export default ThanhPhamService;
