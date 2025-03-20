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

class XuatKho {
  // Lấy danh sách phiếu xuất kho với phân trang
  static async getAll(page = 1, limit = 10, search = '') {
    try {
      const offset = (page - 1) * limit;
      const whereClause = search ? 'WHERE xk.Ma_xuat_kho LIKE ?' : '';
      const params = search ? [`%${search}%`, limit, offset] : [limit, offset];

      const sql = `
        SELECT 
          xk.Id, 
          xk.Ma_xuat_kho, 
          xk.Ngay_xuat, 
          xk.Tong_tien, 
          xk.Ghi_chu,
          nd.Ho_ten as Nguoi_xuat
        FROM XuatKho xk
        LEFT JOIN NguoiDung nd ON xk.Nguoi_xuat_id = nd.Id
        ${whereClause}
        ORDER BY xk.Ngay_xuat DESC 
        LIMIT ? OFFSET ?
      `;

      const countSql = `SELECT COUNT(*) as total FROM XuatKho xk ${whereClause}`;
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

  // Lấy chi tiết phiếu xuất kho
  static async getById(id) {
    try {
      // Lấy thông tin phiếu xuất kho
      const xuatKhoSql = `
        SELECT 
          xk.Id, 
          xk.Ma_xuat_kho, 
          xk.Ngay_xuat, 
          xk.Tong_tien, 
          xk.Ghi_chu,
          xk.Nguoi_xuat_id,
          nd.Ho_ten as Nguoi_xuat
        FROM XuatKho xk
        LEFT JOIN NguoiDung nd ON xk.Nguoi_xuat_id = nd.Id
        WHERE xk.Id = ?
      `;
      
      // Lấy chi tiết phiếu xuất kho
      const chiTietSql = `
        SELECT 
          ctxk.Id,
          ctxk.Thanh_pham_id,
          tp.Ten_thanh_pham,
          ctxk.So_luong,
          tp.Gia_ban,
          (ctxk.So_luong * tp.Gia_ban) as Thanh_tien,
          tp.Don_vi_tinh
        FROM ChiTietXuatKho ctxk
        LEFT JOIN ThanhPham tp ON ctxk.Thanh_pham_id = tp.Id
        WHERE ctxk.Xuat_kho_id = ?
      `;

      const [xuatKho] = await query(xuatKhoSql, [id]);
      
      if (!xuatKho) {
        return null;
      }
      
      const chiTiet = await query(chiTietSql, [id]);
      
      return {
        ...xuatKho,
        chi_tiet: chiTiet
      };
    } catch (error) {
      console.error('Error in getById:', error);
      throw error;
    }
  }

  // Tạo phiếu xuất kho mới
  static async create(data) {
    try {
      await query('START TRANSACTION');

      // Tạo mã xuất kho tự động: XK + năm + tháng + ngày + số thứ tự
      const today = new Date();
      const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
      
      // Lấy số phiếu xuất kho trong ngày để tạo mã
      const countSql = `
        SELECT COUNT(*) as count 
        FROM XuatKho 
        WHERE DATE(Ngay_xuat) = CURDATE()
      `;
      const [{ count }] = await query(countSql);
      
      const maXuatKho = `XK${dateStr}${(count + 1).toString().padStart(3, '0')}`;
      
      // Thêm phiếu xuất kho
      const xuatKhoSql = `
        INSERT INTO XuatKho (
          Ma_xuat_kho, 
          Ngay_xuat, 
          Nguoi_xuat_id, 
          Tong_tien, 
          Ghi_chu
        ) VALUES (?, NOW(), ?, ?, ?)
      `;
      
      const xuatKhoResult = await query(xuatKhoSql, [
        maXuatKho,
        data.Nguoi_xuat_id,
        data.Tong_tien || 0,
        data.Ghi_chu
      ]);
      
      const xuatKhoId = xuatKhoResult.insertId;
      
      // Thêm chi tiết phiếu xuất kho
      if (data.chi_tiet && data.chi_tiet.length > 0) {
        const chiTietSql = `
          INSERT INTO ChiTietXuatKho (
            Xuat_kho_id,
            Thanh_pham_id,
            So_luong,
            Ngay_xuat
          ) VALUES ?
        `;
        
        const chiTietValues = data.chi_tiet.map(item => [
          xuatKhoId,
          item.Thanh_pham_id,
          item.So_luong,
          new Date()
        ]);
        
        await query(chiTietSql, [chiTietValues]);
        
        // Cập nhật số lượng tồn kho của thành phẩm
        for (const item of data.chi_tiet) {
          // Kiểm tra số lượng tồn kho
          const thanhPham = await query(
            'SELECT So_luong, Gia_ban FROM ThanhPham WHERE Id = ?',
            [item.Thanh_pham_id]
          );
          
          if (thanhPham.length === 0) {
            throw new Error(`Không tìm thấy thành phẩm ID: ${item.Thanh_pham_id}`);
          }
          
          if (thanhPham[0].So_luong < item.So_luong) {
            throw new Error(`Thành phẩm không đủ số lượng để xuất kho`);
          }
          
          // Cập nhật số lượng tồn kho
          await query(
            'UPDATE ThanhPham SET So_luong = So_luong - ? WHERE Id = ?',
            [item.So_luong, item.Thanh_pham_id]
          );
        }
      }
      
      // Tính lại tổng tiền
      const tongTienSql = `
        SELECT SUM(tp.Gia_ban * ctxk.So_luong) as tong_tien 
        FROM ChiTietXuatKho ctxk
        JOIN ThanhPham tp ON ctxk.Thanh_pham_id = tp.Id
        WHERE ctxk.Xuat_kho_id = ?
      `;
      
      const [{ tong_tien }] = await query(tongTienSql, [xuatKhoId]);
      
      // Cập nhật tổng tiền vào phiếu xuất kho
      await query(
        'UPDATE XuatKho SET Tong_tien = ? WHERE Id = ?',
        [tong_tien || 0, xuatKhoId]
      );
      
      await query('COMMIT');
      
      return {
        id: xuatKhoId,
        ma_xuat_kho: maXuatKho
      };
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error in create:', error);
      throw error;
    }
  }

  // Cập nhật phiếu xuất kho
  static async update(id, data) {
    try {
      await query('START TRANSACTION');
      
      // Cập nhật thông tin phiếu xuất kho
      if (data.Ghi_chu !== undefined) {
        await query(
          'UPDATE XuatKho SET Ghi_chu = ? WHERE Id = ?',
          [data.Ghi_chu, id]
        );
      }
      
      // Cập nhật chi tiết phiếu xuất kho nếu có
      if (data.chi_tiet && data.chi_tiet.length > 0) {
        // Lấy chi tiết hiện tại để tính toán sự thay đổi số lượng
        const currentChiTiet = await query(
          'SELECT Thanh_pham_id, So_luong FROM ChiTietXuatKho WHERE Xuat_kho_id = ?',
          [id]
        );
        
        // Tạo map để dễ dàng tra cứu
        const currentMap = new Map();
        currentChiTiet.forEach(item => {
          currentMap.set(item.Thanh_pham_id, item.So_luong);
        });
        
        // Hoàn lại số lượng thành phẩm đã xuất
        for (const item of currentChiTiet) {
          await query(
            'UPDATE ThanhPham SET So_luong = So_luong + ? WHERE Id = ?',
            [item.So_luong, item.Thanh_pham_id]
          );
        }
        
        // Xóa chi tiết cũ
        await query('DELETE FROM ChiTietXuatKho WHERE Xuat_kho_id = ?', [id]);
        
        // Thêm chi tiết mới
        const chiTietSql = `
          INSERT INTO ChiTietXuatKho (
            Xuat_kho_id,
            Thanh_pham_id,
            So_luong,
            Ngay_xuat
          ) VALUES ?
        `;
        
        const chiTietValues = data.chi_tiet.map(item => [
          id,
          item.Thanh_pham_id,
          item.So_luong,
          new Date()
        ]);
        
        await query(chiTietSql, [chiTietValues]);
        
        // Cập nhật số lượng tồn kho của thành phẩm
        for (const item of data.chi_tiet) {
          // Kiểm tra số lượng tồn kho
          const thanhPham = await query(
            'SELECT So_luong FROM ThanhPham WHERE Id = ?',
            [item.Thanh_pham_id]
          );
          
          if (thanhPham.length === 0) {
            throw new Error(`Không tìm thấy thành phẩm ID: ${item.Thanh_pham_id}`);
          }
          
          if (thanhPham[0].So_luong < item.So_luong) {
            throw new Error(`Thành phẩm không đủ số lượng để xuất kho`);
          }
          
          // Cập nhật số lượng tồn kho
          await query(
            'UPDATE ThanhPham SET So_luong = So_luong - ? WHERE Id = ?',
            [item.So_luong, item.Thanh_pham_id]
          );
        }
        
        // Tính lại tổng tiền
        const tongTienSql = `
          SELECT SUM(tp.Gia_ban * ctxk.So_luong) as tong_tien 
          FROM ChiTietXuatKho ctxk
          JOIN ThanhPham tp ON ctxk.Thanh_pham_id = tp.Id
          WHERE ctxk.Xuat_kho_id = ?
        `;
        
        const [{ tong_tien }] = await query(tongTienSql, [id]);
        
        // Cập nhật tổng tiền vào phiếu xuất kho
        await query(
          'UPDATE XuatKho SET Tong_tien = ? WHERE Id = ?',
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

  // Xóa phiếu xuất kho
  static async delete(id) {
    try {
      await query('START TRANSACTION');
      
      // Lấy chi tiết phiếu xuất kho để hoàn lại số lượng thành phẩm
      const chiTiet = await query(
        'SELECT Thanh_pham_id, So_luong FROM ChiTietXuatKho WHERE Xuat_kho_id = ?',
        [id]
      );
      
      // Cập nhật lại số lượng tồn kho
      for (const item of chiTiet) {
        await query(
          'UPDATE ThanhPham SET So_luong = So_luong + ? WHERE Id = ?',
          [item.So_luong, item.Thanh_pham_id]
        );
      }
      
      // Xóa chi tiết phiếu xuất kho
      await query('DELETE FROM ChiTietXuatKho WHERE Xuat_kho_id = ?', [id]);
      
      // Xóa phiếu xuất kho
      await query('DELETE FROM XuatKho WHERE Id = ?', [id]);
      
      await query('COMMIT');
      
      return true;
    } catch (error) {
      await query('ROLLBACK');
      console.error('Error in delete:', error);
      throw error;
    }
  }
}

module.exports = XuatKho; 