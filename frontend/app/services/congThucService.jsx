import axiosInstance from '../redux/axiosInstance.mjs';

const API_URL = `/api/thanh-pham`;

const CongThucService = {
  // Lấy tất cả công thức của một thành phẩm
  async getByThanhPhamId(thanhPhamId) {
    try {
      console.log(`Gọi API lấy công thức cho thành phẩm ID=${thanhPhamId}`);
      const response = await axiosInstance.get(`${API_URL}/${thanhPhamId}/cong-thuc`);
      console.log(`Kết quả API công thức của thành phẩm ID=${thanhPhamId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy công thức cho thành phẩm ID=${thanhPhamId}:`, error);
      if (error.response) {
        console.error('Status:', error.response.status, 'Data:', error.response.data);
      }
      throw error;
    }
  },

  // Lấy chi tiết một công thức
  async getById(thanhPhamId, congThucId) {
    try {
      console.log(`Gọi API lấy chi tiết công thức ID=${congThucId} của thành phẩm ID=${thanhPhamId}`);
      const response = await axiosInstance.get(`${API_URL}/${thanhPhamId}/cong-thuc/${congThucId}`);
      console.log(`Kết quả API chi tiết công thức ID=${congThucId}:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi lấy chi tiết công thức ID=${congThucId}:`, error);
      if (error.response) {
        console.error('Status:', error.response.status, 'Data:', error.response.data);
      }
      throw error;
    }
  },

  // Thêm công thức mới
  async create(thanhPhamId, data) {
    try {
      console.log(`Gọi API tạo công thức mới cho thành phẩm ID=${thanhPhamId}:`, data);
      const response = await axiosInstance.post(`${API_URL}/${thanhPhamId}/cong-thuc`, data);
      console.log(`Kết quả tạo công thức:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi tạo công thức cho thành phẩm ID=${thanhPhamId}:`, error);
      if (error.response) {
        console.error('Status:', error.response.status, 'Data:', error.response.data);
      }
      throw error;
    }
  },

  // Cập nhật công thức
  async update(thanhPhamId, congThucId, data) {
    try {
      console.log(`Gọi API cập nhật công thức ID=${congThucId}:`, data);
      const response = await axiosInstance.put(`${API_URL}/${thanhPhamId}/cong-thuc/${congThucId}`, data);
      console.log(`Kết quả cập nhật công thức:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi cập nhật công thức ID=${congThucId}:`, error);
      if (error.response) {
        console.error('Status:', error.response.status, 'Data:', error.response.data);
      }
      throw error;
    }
  },

  // Xóa công thức
  async delete(thanhPhamId, congThucId) {
    try {
      console.log(`Gọi API xóa công thức ID=${congThucId}`);
      const response = await axiosInstance.delete(`${API_URL}/${thanhPhamId}/cong-thuc/${congThucId}`);
      console.log(`Kết quả xóa công thức:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi xóa công thức ID=${congThucId}:`, error);
      if (error.response) {
        console.error('Status:', error.response.status, 'Data:', error.response.data);
      }
      throw error;
    }
  },

  // Sản xuất thành phẩm theo công thức
  async sanXuat(thanhPhamId, data) {
    try {
      console.log(`Gọi API sản xuất thành phẩm ID=${thanhPhamId}:`, data);
      const response = await axiosInstance.post(`${API_URL}/${thanhPhamId}/san-xuat`, data);
      console.log(`Kết quả sản xuất thành phẩm:`, response.data);
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi sản xuất thành phẩm ID=${thanhPhamId}:`, error);
      if (error.response) {
        console.error('Status:', error.response.status, 'Data:', error.response.data);
      }
      throw error;
    }
  }
};

export default CongThucService; 