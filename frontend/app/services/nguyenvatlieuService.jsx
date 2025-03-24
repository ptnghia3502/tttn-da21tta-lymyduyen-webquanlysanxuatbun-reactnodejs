import axiosInstance from '../redux/axiosInstance.mjs';

const API_URL = `/api/nguyen-vat-lieu`;

const NguyenVatLieuService = {
  async getAll() {
    try {
      console.log('Gọi API lấy tất cả nguyên vật liệu:', API_URL);
      const response = await axiosInstance.get(API_URL);
      console.log('Response từ API nguyên vật liệu:', response.data);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi gọi API lấy tất cả nguyên vật liệu:', error);
      if (error.response) {
        console.error('Status:', error.response.status, 'Data:', error.response.data);
      }
      throw error;
    }
  },

  async getById(id) {
    try {
      console.log(`Gọi API lấy chi tiết nguyên vật liệu ID=${id}`);
      const response = await axiosInstance.get(`${API_URL}/${id}`);
      console.log(`Response từ API chi tiết nguyên vật liệu ID=${id}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi gọi API lấy chi tiết nguyên vật liệu ID=${id}:`, error);
      if (error.response) {
        console.error('Status:', error.response.status, 'Data:', error.response.data);
      }
      throw error;
    }
  },

  async create(data) {
    try {
      const payload = {
        Ten_nguyen_lieu: data.Ten_nguyen_lieu,
        Don_vi_tinh: data.Don_vi_tinh,
        Gia_nhap: parseFloat(data.Gia_nhap),
        So_luong_ton: parseFloat(data.So_luong_ton || 0),
        Mo_ta: data.Mo_ta
      };
      console.log('Dữ liệu gửi lên khi tạo nguyên vật liệu:', payload);
      const response = await axiosInstance.post(API_URL, payload);
      return response.data;
    } catch (error) {
      console.error('Lỗi khi tạo nguyên vật liệu:', error);
      throw error;
    }
  },

  async update(id, data) {
    try {
      const payload = {
        Ten_nguyen_lieu: data.Ten_nguyen_lieu,
        Don_vi_tinh: data.Don_vi_tinh,
        Gia_nhap: parseFloat(data.Gia_nhap),
        So_luong_ton: data.So_luong_ton !== undefined ? parseFloat(data.So_luong_ton) : undefined,
        Mo_ta: data.Mo_ta
      };
      console.log(`Dữ liệu gửi lên khi cập nhật nguyên vật liệu ID=${id}:`, payload);
      const response = await axiosInstance.put(`${API_URL}/${id}`, payload);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật nguyên vật liệu ID=${id}:`, error);
      throw error;
    }
  },

  async delete(id) {
    try {
      console.log(`Gọi API xóa nguyên vật liệu ID=${id}`);
      const response = await axiosInstance.delete(`${API_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa nguyên vật liệu ID=${id}:`, error);
      throw error;
    }
  },

  //✅ Thêm hàm kiểm tra nguyên liệu tồn tại
//   async checkExists(tenNguyenLieu, excludeId = null) {
//     const response = await axiosInstance.get(`${API_URL}/checkExists`, {
//       params: { tenNguyenLieu, excludeId }
//     });
//     return response.data.exists; // Backend cần trả về `{ exists: true/false }`
//   }
};

export default NguyenVatLieuService;
