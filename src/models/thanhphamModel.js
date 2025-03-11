// src/models/thanhPhamModel.js
const connection = require('../config/database');
const util = require('util');
const query = util.promisify(connection.query).bind(connection);

class ThanhPham {
  // Lấy danh sách thành phẩm
  static async getAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const whereClause = search ? 'WHERE Ten_thanh_pham LIKE ?' : '';
    const params = search ? [`%${search}%`, limit, offset] : [limit, offset];

    const sql = `
      SELECT * FROM ThanhPham 
      ${whereClause}
      ORDER BY Id DESC 
      LIMIT ? OFFSET ?
    `;

    const countSql = `SELECT COUNT(*) as total FROM ThanhPham ${whereClause}`;
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
  }

  // Lấy chi tiết thành phẩm
  static async getById(id) {
    const sql = 'SELECT * FROM ThanhPham WHERE Id = ?';
    const rows = await query(sql, [id]);
    return rows[0];
  }

  // Kiểm tra tên thành phẩm đã tồn tại
  static async checkExists(tenThanhPham, excludeId = null) {
    const sql = excludeId 
      ? 'SELECT Id FROM ThanhPham WHERE Ten_thanh_pham = ? AND Id != ?'
      : 'SELECT Id FROM ThanhPham WHERE Ten_thanh_pham = ?';
    
    const params = excludeId ? [tenThanhPham, excludeId] : [tenThanhPham];
    const rows = await query(sql, params);
    return rows.length > 0;
  }

  // Thêm thành phẩm mới
  static async create(data) {
    const sql = `
      INSERT INTO ThanhPham (
        Ten_thanh_pham,
        So_luong,
        Don_vi_tinh,
        Ngay_san_xuat,
        Gia_ban,
        Mo_ta
      ) VALUES (?, ?, ?, CURDATE(), ?, ?)
    `;
    
    console.log('Insert data:', {
      Ten_thanh_pham: data.Ten_thanh_pham,
      So_luong: data.So_luong,
      Don_vi_tinh: data.Don_vi_tinh,
      Gia_ban: data.Gia_ban,
      Mo_ta: data.Mo_ta
    });

    const result = await query(sql, [
      data.Ten_thanh_pham,
      data.So_luong || 0,
      data.Don_vi_tinh,
      data.Gia_ban,
      data.Mo_ta
    ]);
    return result.insertId;
  }

  // Cập nhật thành phẩm
  static async update(id, data) {
    const sql = `
      UPDATE ThanhPham 
      SET 
        Ten_thanh_pham = ?,
        So_luong = ?,
        Don_vi_tinh = ?,
        Gia_ban = ?,
        Mo_ta = ?
      WHERE Id = ?
    `;

    console.log('Update data:', {
      id,
      Ten_thanh_pham: data.Ten_thanh_pham,
      So_luong: data.So_luong,
      Don_vi_tinh: data.Don_vi_tinh,
      Gia_ban: data.Gia_ban,
      Mo_ta: data.Mo_ta
    });

    await query(sql, [
      data.Ten_thanh_pham,
      data.So_luong || 0,
      data.Don_vi_tinh,
      data.Gia_ban,
      data.Mo_ta,
      id
    ]);
  }

  // Xóa thành phẩm
  static async delete(id) {
    const sql = 'DELETE FROM ThanhPham WHERE Id = ?';
    await query(sql, [id]);
  }

  // Thêm công thức cho thành phẩm
  static async themCongThuc(data) {
    try {
      await query('START TRANSACTION');

      // Thêm công thức
      const sqlCongThuc = `
        INSERT INTO CongThuc (
          Thanh_pham_id, 
          Ten_cong_thuc
        ) VALUES (?, ?)
      `;
      
      // Log để debug
      console.log('=== DEBUG INFO ===');
      console.log('SQL Công thức:', sqlCongThuc);
      console.log('Data công thức:', [data.Thanh_pham_id, data.Ten_cong_thuc]);

      const resultCongThuc = await query(sqlCongThuc, [
        data.Thanh_pham_id,
        data.Ten_cong_thuc
      ]);

      console.log('Kết quả thêm công thức:', resultCongThuc);

      if (data.nguyen_lieu && data.nguyen_lieu.length > 0) {
        // Kiểm tra cấu trúc bảng
        const tableInfo = await query('DESCRIBE ChiTietCongThuc');
        console.log('Cấu trúc bảng ChiTietCongThuc:', tableInfo);

        // Thêm chi tiết công thức
        const sqlChiTiet = `
          INSERT INTO ChiTietCongThuc (
            Cong_thuc_id, 
            Nguyen_vat_lieu_id, 
            So_luong_can,
            Don_vi_tinh
          ) VALUES ?
        `;

        const chiTietValues = data.nguyen_lieu.map(item => [
          resultCongThuc.insertId,
          item.Nguyen_vat_lieu_id,
          parseFloat(item.So_luong_can),
          item.Don_vi_tinh
        ]);

        console.log('SQL Chi tiết:', sqlChiTiet);
        console.log('Data chi tiết:', chiTietValues);

        try {
          await query(sqlChiTiet, [chiTietValues]);
        } catch (error) {
          console.error('Lỗi khi thêm chi tiết:', error);
          throw error;
        }
      }

      await query('COMMIT');
      
      // Lấy thông tin công thức vừa thêm
      const congThuc = await query(
        `SELECT 
           c.Id,
           c.Thanh_pham_id,
           c.Ten_cong_thuc,
           ct.Nguyen_vat_lieu_id,
           CAST(ct.So_luong_can AS DECIMAL(10,3)) as So_luong_can,
           ct.Don_vi_tinh
         FROM CongThuc c
         LEFT JOIN ChiTietCongThuc ct ON c.Id = ct.Cong_thuc_id
         WHERE c.Id = ?`,
        [resultCongThuc.insertId]
      );

      return congThuc;

    } catch (error) {
      console.error('Lỗi chi tiết khi thêm công thức:', error);
      await query('ROLLBACK');
      throw error;
    }
  }

  // Sản xuất thành phẩm
  static async sanXuat(data) {
    try {
      await query('START TRANSACTION');

      // Kiểm tra công thức
      const congThuc = await query(
        'SELECT * FROM CongThuc WHERE Id = ? AND Thanh_pham_id = ?',
        [data.Cong_thuc_id, data.Thanh_pham_id]
      );
      if (congThuc.length === 0) {
        throw new Error('Không tìm thấy công thức phù hợp');
      }

      // Lấy chi tiết công thức
      const chiTietCongThuc = await query(
        'SELECT * FROM ChiTietCongThuc WHERE Cong_thuc_id = ?',
        [data.Cong_thuc_id]
      );

      // Kiểm tra số lượng nguyên vật liệu trong kho
      for (const item of chiTietCongThuc) {
        const nguyenLieu = await query(
          'SELECT So_luong_ton FROM NguyenVatLieu WHERE Id = ?',
          [item.Nguyen_vat_lieu_id]
        );
        
        const soLuongCan = item.So_luong_can * data.So_luong;
        if (nguyenLieu[0].So_luong_ton < soLuongCan) {
          throw new Error(`Không đủ nguyên liệu ${item.Nguyen_vat_lieu_id}`);
        }
      }

      // Trừ nguyên vật liệu trong kho
      for (const item of chiTietCongThuc) {
        const soLuongCan = item.So_luong_can * data.So_luong;
        await query(
          'UPDATE NguyenVatLieu SET So_luong_ton = So_luong_ton - ? WHERE Id = ?',
          [soLuongCan, item.Nguyen_vat_lieu_id]
        );
      }

      // Cộng số lượng thành phẩm
      await query(
        'UPDATE ThanhPham SET So_luong = So_luong + ? WHERE Id = ?',
        [data.So_luong, data.Thanh_pham_id]
      );

      // Lưu lịch sử sản xuất
      await query(
        `INSERT INTO LichSuSanXuat (
          Thanh_pham_id, 
          Cong_thuc_id, 
          So_luong, 
          Nguoi_thuc_hien
        ) VALUES (?, ?, ?, ?)`,
        [data.Thanh_pham_id, data.Cong_thuc_id, data.So_luong, data.Nguoi_thuc_hien]
      );

      await query('COMMIT');
      return true;
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  // Xóa công thức
  static async xoaCongThuc(id) {
    try {
      await query('START TRANSACTION');

      // Xóa chi tiết công thức trước (do có khóa ngoại)
      await query('DELETE FROM ChiTietCongThuc WHERE Cong_thuc_id = ?', [id]);
      
      // Sau đó xóa công thức
      await query('DELETE FROM CongThuc WHERE Id = ?', [id]);

      await query('COMMIT');
      return true;
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  // Lấy tất cả công thức
  static async getAllCongThuc() {
    const sql = `
      SELECT 
        c.Id,
        c.Thanh_pham_id,
        c.Ten_cong_thuc,
        tp.Ten_thanh_pham,
        ct.Nguyen_vat_lieu_id,
        nvl.Ten_nguyen_lieu,
        CAST(ct.So_luong_can AS DECIMAL(10,3)) as So_luong_can,
        ct.Don_vi_tinh
      FROM CongThuc c
      LEFT JOIN ThanhPham tp ON c.Thanh_pham_id = tp.Id
      LEFT JOIN ChiTietCongThuc ct ON c.Id = ct.Cong_thuc_id
      LEFT JOIN NguyenVatLieu nvl ON ct.Nguyen_vat_lieu_id = nvl.Id
      ORDER BY c.Id DESC
    `;
    return await query(sql);
  }

  // Lấy chi tiết một công thức
  static async getCongThucById(id) {
    const sql = `
      SELECT 
        c.Id,
        c.Thanh_pham_id,
        c.Ten_cong_thuc,
        tp.Ten_thanh_pham,
        ct.Nguyen_vat_lieu_id,
        nvl.Ten_nguyen_lieu,
        CAST(ct.So_luong_can AS DECIMAL(10,3)) as So_luong_can,
        ct.Don_vi_tinh
      FROM CongThuc c
      LEFT JOIN ThanhPham tp ON c.Thanh_pham_id = tp.Id
      LEFT JOIN ChiTietCongThuc ct ON c.Id = ct.Cong_thuc_id
      LEFT JOIN NguyenVatLieu nvl ON ct.Nguyen_vat_lieu_id = nvl.Id
      WHERE c.Id = ?
    `;
    return await query(sql, [id]);
  }

  // Cập nhật công thức
  static async updateCongThuc(id, data) {
    try {
      await query('START TRANSACTION');

      // Cập nhật thông tin công thức
      const sqlCongThuc = `
        UPDATE CongThuc 
        SET 
          Ten_cong_thuc = ?
        WHERE Id = ?
      `;

      await query(sqlCongThuc, [
        data.Ten_cong_thuc,
        id
      ]);

      if (data.nguyen_lieu && data.nguyen_lieu.length > 0) {
        // Xóa chi tiết công thức cũ
        await query('DELETE FROM ChiTietCongThuc WHERE Cong_thuc_id = ?', [id]);

        // Thêm chi tiết công thức mới
        const sqlChiTiet = `
          INSERT INTO ChiTietCongThuc (
            Cong_thuc_id, 
            Nguyen_vat_lieu_id, 
            So_luong_can,
            Don_vi_tinh
          ) VALUES ?
        `;

        const chiTietValues = data.nguyen_lieu.map(item => [
          id,
          item.Nguyen_vat_lieu_id,
          parseFloat(item.So_luong_can),
          item.Don_vi_tinh
        ]);

        await query(sqlChiTiet, [chiTietValues]);
      }

      await query('COMMIT');

      // Lấy thông tin công thức sau khi cập nhật
      const congThuc = await query(
        `SELECT 
           c.Id,
           c.Thanh_pham_id,
           c.Ten_cong_thuc,
           tp.Ten_thanh_pham,
           ct.Nguyen_vat_lieu_id,
           nvl.Ten_nguyen_lieu,
           CAST(ct.So_luong_can AS DECIMAL(10,3)) as So_luong_can,
           ct.Don_vi_tinh
         FROM CongThuc c
         LEFT JOIN ThanhPham tp ON c.Thanh_pham_id = tp.Id
         LEFT JOIN ChiTietCongThuc ct ON c.Id = ct.Cong_thuc_id
         LEFT JOIN NguyenVatLieu nvl ON ct.Nguyen_vat_lieu_id = nvl.Id
         WHERE c.Id = ?`,
        [id]
      );

      return congThuc;

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }
}

module.exports = ThanhPham;
