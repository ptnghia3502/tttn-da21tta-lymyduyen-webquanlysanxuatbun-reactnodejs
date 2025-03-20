const connection = require('../config/database');
const util = require('util');

// Tạo hàm query với kiểm tra kết nối
const query = async (sql, params) => {
  try {
    // Kiểm tra kết nối
    if (connection.state === 'disconnected') {
      await connection.connect();
    }
    
    const queryPromise = util.promisify(connection.query).bind(connection);
    return await queryPromise(sql, params);
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

class NhapKho {
  // Lấy danh sách phiếu nhập kho với phân trang
  static async getAll(page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      const whereClause = search ? 'WHERE nk.Ma_nhap_kho LIKE ?' : '';
      const params = search ? [`%${search}%`, limit, offset] : [limit, offset];

      const sql = `
        SELECT 
          nk.Id, 
          nk.Ma_nhap_kho, 
          nk.Ngay_nhap, 
          nk.Tong_tien, 
          nk.Ghi_chu,
          nd.Ho_ten as Nguoi_nhap
        FROM NhapKho nk
        LEFT JOIN NguoiDung nd ON nk.Nguoi_nhap_id = nd.Id
        ${whereClause}
        ORDER BY nk.Ngay_nhap DESC 
        LIMIT ? OFFSET ?
      `;

      const countSql = `SELECT COUNT(*) as total FROM NhapKho nk ${whereClause}`;
      const countParams = search ? [`%${search}%`] : [];

      const [rows, [{ total }]] = await Promise.all([
        query(sql, params),
        query(countSql, countParams)
      ]);

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
  }

  // Lấy chi tiết phiếu nhập kho
  static async getById(id) {
    try {
      // Lấy thông tin phiếu nhập kho
      const nhapKhoSql = `
        SELECT 
          nk.Id, 
          nk.Ma_nhap_kho, 
          nk.Ngay_nhap, 
          nk.Tong_tien, 
          nk.Ghi_chu,
          nk.Nguoi_nhap_id,
          nd.Ho_ten as Nguoi_nhap
        FROM NhapKho nk
        LEFT JOIN NguoiDung nd ON nk.Nguoi_nhap_id = nd.Id
        WHERE nk.Id = ?
      `;
      
      // Lấy chi tiết phiếu nhập kho
      const chiTietSql = `
        SELECT 
          ctnk.Id,
          ctnk.Nguyen_vat_lieu_id,
          nvl.Ten_nguyen_lieu,
          ctnk.So_luong,
          ctnk.Don_gia,
          ctnk.Thanh_tien,
          ctnk.Ghi_chu,
          nvl.Don_vi_tinh
        FROM ChiTietNhapKho ctnk
        LEFT JOIN NguyenVatLieu nvl ON ctnk.Nguyen_vat_lieu_id = nvl.Id
        WHERE ctnk.Nhap_kho_id = ?
      `;

      const [nhapKho] = await query(nhapKhoSql, [id]);
      
      if (!nhapKho) {
        return null;
      }
      
      const chiTiet = await query(chiTietSql, [id]);
      
      return {
        ...nhapKho,
        chi_tiet: chiTiet
      };
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  // Tạo phiếu nhập kho mới
  static async create(data) {
    try {
      await query('START TRANSACTION');

      // Tạo mã nhập kho tự động: NK + năm + tháng + ngày + số thứ tự
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      
      // Lấy số phiếu nhập kho trong ngày để tạo mã
      const countSql = `
        SELECT COUNT(*) as count 
        FROM NhapKho 
        WHERE DATE(Ngay_nhap) = CURDATE()
      `;
      const [{ count }] = await query(countSql);
      
      const maNhapKho = `NK${dateStr}${(count + 1).toString().padStart(3, '0')}`;
      
      // Thêm phiếu nhập kho
      const nhapKhoSql = `
        INSERT INTO NhapKho (
          Ma_nhap_kho, 
          Ngay_nhap, 
          Nguoi_nhap_id, 
          Tong_tien, 
          Ghi_chu
        ) VALUES (?, NOW(), ?, ?, ?)
      `;
      
      const nhapKhoResult = await query(nhapKhoSql, [
        maNhapKho,
        data.Nguoi_nhap_id,
        data.Tong_tien || 0,
        data.Ghi_chu
      ]);
      
      const nhapKhoId = nhapKhoResult.insertId;
      
      // Thêm chi tiết phiếu nhập kho
      if (data.chi_tiet && data.chi_tiet.length > 0) {
        // Tạo mảng chứa các chi tiết đã xử lý
        const processedChiTiet = [];
        
        // Xử lý từng chi tiết
        for (const item of data.chi_tiet) {
          // Lấy thông tin nguyên vật liệu để lấy đơn giá
          const nguyenVatLieu = await query(
            'SELECT Gia FROM NguyenVatLieu WHERE Id = ?',
            [item.Nguyen_vat_lieu_id]
          );
          
          if (nguyenVatLieu.length === 0) {
            throw new Error(`Không tìm thấy nguyên vật liệu ID: ${item.Nguyen_vat_lieu_id}`);
          }
          
          // Lấy đơn giá từ bảng NguyenVatLieu
          const donGia = parseFloat(nguyenVatLieu[0].Gia);
          
          // Tính thành tiền
          const thanhTien = item.So_luong * donGia;
          
          // Thêm vào mảng chi tiết đã xử lý
          processedChiTiet.push([
            nhapKhoId,
            item.Nguyen_vat_lieu_id,
            item.So_luong,
            donGia,
            thanhTien,
            null // Không sử dụng ghi chú chi tiết
          ]);
          
          // Cập nhật số lượng tồn kho của nguyên vật liệu
          await query(
            'UPDATE NguyenVatLieu SET So_luong_ton = So_luong_ton + ?, Ngay_cap_nhat = CURDATE() WHERE Id = ?',
            [item.So_luong, item.Nguyen_vat_lieu_id]
          );
        }
        
        // Thêm chi tiết vào database
        if (processedChiTiet.length > 0) {
          const chiTietSql = `
            INSERT INTO ChiTietNhapKho (
              Nhap_kho_id,
              Nguyen_vat_lieu_id,
              So_luong,
              Don_gia,
              Thanh_tien,
              Ghi_chu
            ) VALUES ?
          `;
          
          await query(chiTietSql, [processedChiTiet]);
        }
      }
      
      // Tính lại tổng tiền
      const tongTienSql = `
        SELECT SUM(Thanh_tien) as tong_tien 
        FROM ChiTietNhapKho 
        WHERE Nhap_kho_id = ?
      `;
      
      const [{ tong_tien }] = await query(tongTienSql, [nhapKhoId]);
      
      // Cập nhật tổng tiền vào phiếu nhập kho
      await query(
        'UPDATE NhapKho SET Tong_tien = ? WHERE Id = ?',
        [tong_tien || 0, nhapKhoId]
      );
      
      await query('COMMIT');
      
      return {
        id: nhapKhoId,
        ma_nhap_kho: maNhapKho
      };
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Cập nhật phiếu nhập kho
  static async update(id, data) {
    try {
      await query('START TRANSACTION');
      
      // Cập nhật thông tin phiếu nhập kho
      if (data.Ghi_chu !== undefined) {
        await query(
          'UPDATE NhapKho SET Ghi_chu = ? WHERE Id = ?',
          [data.Ghi_chu, id]
        );
      }
      
      // Cập nhật chi tiết phiếu nhập kho nếu có
      if (data.chi_tiet && data.chi_tiet.length > 0) {
        // Lấy chi tiết hiện tại để tính toán sự thay đổi số lượng
        const currentChiTiet = await query(
          'SELECT Nguyen_vat_lieu_id, So_luong FROM ChiTietNhapKho WHERE Nhap_kho_id = ?',
          [id]
        );
        
        // Tạo map để dễ dàng tra cứu
        const currentMap = new Map();
        currentChiTiet.forEach(item => {
          currentMap.set(item.Nguyen_vat_lieu_id, item.So_luong);
        });
        
        // Xóa chi tiết cũ
        await query('DELETE FROM ChiTietNhapKho WHERE Nhap_kho_id = ?', [id]);
        
        // Tạo mảng chứa các chi tiết đã xử lý
        const processedChiTiet = [];
        
        // Xử lý từng chi tiết
        for (const item of data.chi_tiet) {
          // Lấy thông tin nguyên vật liệu để lấy đơn giá
          const nguyenVatLieu = await query(
            'SELECT Gia FROM NguyenVatLieu WHERE Id = ?',
            [item.Nguyen_vat_lieu_id]
          );
          
          if (nguyenVatLieu.length === 0) {
            throw new Error(`Không tìm thấy nguyên vật liệu ID: ${item.Nguyen_vat_lieu_id}`);
          }
          
          // Lấy đơn giá từ bảng NguyenVatLieu
          const donGia = parseFloat(nguyenVatLieu[0].Gia);
          
          // Tính thành tiền
          const thanhTien = item.So_luong * donGia;
          
          // Thêm vào mảng chi tiết đã xử lý
          processedChiTiet.push([
            id,
            item.Nguyen_vat_lieu_id,
            item.So_luong,
            donGia,
            thanhTien,
            null // Không sử dụng ghi chú chi tiết
          ]);
          
          // Cập nhật số lượng tồn kho của nguyên vật liệu
          const currentSoLuong = currentMap.get(item.Nguyen_vat_lieu_id) || 0;
          const soLuongThayDoi = item.So_luong - currentSoLuong;
          
          await query(
            'UPDATE NguyenVatLieu SET So_luong_ton = So_luong_ton + ?, Ngay_cap_nhat = CURDATE() WHERE Id = ?',
            [soLuongThayDoi, item.Nguyen_vat_lieu_id]
          );
        }
        
        // Thêm chi tiết vào database
        if (processedChiTiet.length > 0) {
          const chiTietSql = `
            INSERT INTO ChiTietNhapKho (
              Nhap_kho_id,
              Nguyen_vat_lieu_id,
              So_luong,
              Don_gia,
              Thanh_tien,
              Ghi_chu
            ) VALUES ?
          `;
          
          await query(chiTietSql, [processedChiTiet]);
        }
        
        // Tính lại tổng tiền
        const tongTienSql = `
          SELECT SUM(Thanh_tien) as tong_tien 
          FROM ChiTietNhapKho 
          WHERE Nhap_kho_id = ?
        `;
        
        const [{ tong_tien }] = await query(tongTienSql, [id]);
        
        // Cập nhật tổng tiền vào phiếu nhập kho
        await query(
          'UPDATE NhapKho SET Tong_tien = ? WHERE Id = ?',
          [tong_tien || 0, id]
        );
      }
      
      await query('COMMIT');
      
      return true;
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error in update:', error);
      throw error;
    }
  }

  // Xóa phiếu nhập kho
  static async delete(id) {
    try {
      await query('START TRANSACTION');
      
      // Lấy chi tiết phiếu nhập kho để hoàn lại số lượng nguyên vật liệu
      const chiTiet = await query(
        'SELECT Nguyen_vat_lieu_id, So_luong FROM ChiTietNhapKho WHERE Nhap_kho_id = ?',
        [id]
      );
      
      // Cập nhật lại số lượng tồn kho
      for (const item of chiTiet) {
        await query(
          'UPDATE NguyenVatLieu SET So_luong_ton = So_luong_ton - ?, Ngay_cap_nhat = CURDATE() WHERE Id = ?',
          [item.So_luong, item.Nguyen_vat_lieu_id]
        );
      }
      
      // Xóa chi tiết phiếu nhập kho
      await query('DELETE FROM ChiTietNhapKho WHERE Nhap_kho_id = ?', [id]);
      
      // Xóa phiếu nhập kho
      await query('DELETE FROM NhapKho WHERE Id = ?', [id]);
      
      await query('COMMIT');
      
      return true;
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error in delete:', error);
      throw error;
    }
  }
}

module.exports = NhapKho; 