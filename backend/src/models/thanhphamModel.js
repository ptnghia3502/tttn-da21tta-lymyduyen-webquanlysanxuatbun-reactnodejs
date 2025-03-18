// src/models/thanhPhamModel.js
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

class ThanhPham {
  // Lấy danh sách thành phẩm
  static async getAll(page = 1, limit = 10, search = '') {
    try {
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
    } catch (error) {
      console.error('Error in getAll:', error);
      throw error;
    }
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
    try {
      // Lấy thông tin hiện tại của thành phẩm
      const currentThanhPham = await this.getById(id);
      if (!currentThanhPham) {
        throw new Error('Không tìm thấy thành phẩm');
      }

      // Tạo object chứa các trường cần update
      const updateFields = {};
      const updateValues = [];

      // Chỉ update những trường được truyền vào
      if (data.Ten_thanh_pham !== undefined) {
        updateFields.Ten_thanh_pham = data.Ten_thanh_pham;
        updateValues.push(data.Ten_thanh_pham);
      }
      if (data.So_luong !== undefined) {
        updateFields.So_luong = data.So_luong;
        updateValues.push(data.So_luong);
      }
      if (data.Don_vi_tinh !== undefined) {
        updateFields.Don_vi_tinh = data.Don_vi_tinh;
        updateValues.push(data.Don_vi_tinh);
      }
      if (data.Gia_ban !== undefined) {
        updateFields.Gia_ban = data.Gia_ban;
        updateValues.push(data.Gia_ban);
      }
      if (data.Mo_ta !== undefined) {
        updateFields.Mo_ta = data.Mo_ta;
        updateValues.push(data.Mo_ta);
      }

      // Nếu không có trường nào được update, return
      if (Object.keys(updateFields).length === 0) {
        return;
      }

      // Tạo câu lệnh SQL động
      const setClause = Object.keys(updateFields)
        .map(field => `${field} = ?`)
        .join(', ');

      const sql = `
        UPDATE ThanhPham 
        SET ${setClause}
        WHERE Id = ?
      `;

      // Thêm id vào cuối mảng values
      updateValues.push(id);

      console.log('Update data:', {
        id,
        updateFields,
        updateValues
      });

      await query(sql, updateValues);
    } catch (error) {
      console.error('Error in update:', error);
      throw error;
    }
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
          Ten_cong_thuc,
          Mo_ta,
          Ngay_tao
        ) VALUES (?, ?, ?, NOW())
      `;
      
      const resultCongThuc = await query(sqlCongThuc, [
        data.Thanh_pham_id,
        data.Ten_cong_thuc,
        data.Mo_ta || null
      ]);

      if (data.nguyen_lieu && data.nguyen_lieu.length > 0) {
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

        await query(sqlChiTiet, [chiTietValues]);
      }

      await query('COMMIT');
      
      // Lấy thông tin công thức vừa thêm
      const congThuc = await query(
        `SELECT 
           c.Id,
           c.Thanh_pham_id,
           c.Ten_cong_thuc,
           c.Mo_ta,
           c.Ngay_tao,
           ct.Nguyen_vat_lieu_id,
           nvl.Ten_nguyen_lieu,
           CAST(ct.So_luong_can AS DECIMAL(10,3)) as So_luong_can,
           ct.Don_vi_tinh
         FROM CongThuc c
         LEFT JOIN ChiTietCongThuc ct ON c.Id = ct.Cong_thuc_id
         LEFT JOIN NguyenVatLieu nvl ON ct.Nguyen_vat_lieu_id = nvl.Id
         WHERE c.Id = ?`,
        [resultCongThuc.insertId]
      );

      return congThuc;

    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  // Sản xuất thành phẩm
  static async sanXuat(data) {
    try {
      await query('START TRANSACTION');

      // Kiểm tra công thức có thuộc về thành phẩm không
      const congThuc = await query(
        'SELECT * FROM CongThuc WHERE Id = ? AND Thanh_pham_id = ?',
        [data.Cong_thuc_id, data.Thanh_pham_id]
      );

      if (congThuc.length === 0) {
        throw new Error('Không tìm thấy công thức phù hợp cho thành phẩm này');
      }

      // Lấy chi tiết công thức
      const chiTietCongThuc = await query(
        'SELECT * FROM ChiTietCongThuc WHERE Cong_thuc_id = ?',
        [data.Cong_thuc_id]
      );

      if (chiTietCongThuc.length === 0) {
        throw new Error('Công thức chưa có nguyên vật liệu');
      }

      // Kiểm tra và cập nhật số lượng nguyên vật liệu
      for (const chiTiet of chiTietCongThuc) {
        const soLuongCan = chiTiet.So_luong_can * data.So_luong;
        const nguyenLieu = await query(
          'SELECT * FROM NguyenVatLieu WHERE Id = ?',
          [chiTiet.Nguyen_vat_lieu_id]
        );

        if (nguyenLieu.length === 0) {
          throw new Error(`Không tìm thấy nguyên vật liệu ID: ${chiTiet.Nguyen_vat_lieu_id}`);
        }

        if (nguyenLieu[0].So_luong_ton < soLuongCan) {
          throw new Error(`Nguyên vật liệu ${nguyenLieu[0].Ten_nguyen_lieu} không đủ số lượng`);
        }

        // Cập nhật số lượng tồn
        await query(
          'UPDATE NguyenVatLieu SET So_luong_ton = So_luong_ton - ? WHERE Id = ?',
          [soLuongCan, chiTiet.Nguyen_vat_lieu_id]
        );
      }

      // Cập nhật số lượng thành phẩm
      await query(
        'UPDATE ThanhPham SET So_luong = So_luong + ? WHERE Id = ?',
        [data.So_luong, data.Thanh_pham_id]
      );

      await query('COMMIT');
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
        GROUP_CONCAT(
          JSON_OBJECT(
            'Nguyen_vat_lieu_id', ct.Nguyen_vat_lieu_id,
            'Ten_nguyen_lieu', nvl.Ten_nguyen_lieu,
            'So_luong_can', CAST(ct.So_luong_can AS DECIMAL(10,3)),
            'Don_vi_tinh', ct.Don_vi_tinh
          )
        ) as nguyen_lieu
      FROM CongThuc c
      LEFT JOIN ThanhPham tp ON c.Thanh_pham_id = tp.Id
      LEFT JOIN ChiTietCongThuc ct ON c.Id = ct.Cong_thuc_id
      LEFT JOIN NguyenVatLieu nvl ON ct.Nguyen_vat_lieu_id = nvl.Id
      GROUP BY c.Id, c.Thanh_pham_id, c.Ten_cong_thuc, tp.Ten_thanh_pham
      ORDER BY c.Id DESC
    `;
    
    const results = await query(sql);
    
    // Xử lý kết quả để chuyển đổi chuỗi nguyen_lieu thành mảng JSON
    return results.map(result => ({
      ...result,
      nguyen_lieu: result.nguyen_lieu ? JSON.parse(`[${result.nguyen_lieu}]`) : []
    }));
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

      // Kiểm tra công thức có tồn tại không
      const currentCongThuc = await query(
        'SELECT * FROM CongThuc WHERE Id = ?',
        [id]
      );
      
      if (currentCongThuc.length === 0) {
        throw new Error('Không tìm thấy công thức');
      }

      // Chỉ update tên công thức và mô tả nếu được truyền vào
      if (data.Ten_cong_thuc !== undefined || data.Mo_ta !== undefined) {
        const updateFields = [];
        const updateValues = [];

        if (data.Ten_cong_thuc !== undefined) {
          updateFields.push('Ten_cong_thuc = ?');
          updateValues.push(data.Ten_cong_thuc);
        }

        if (data.Mo_ta !== undefined) {
          updateFields.push('Mo_ta = ?');
          updateValues.push(data.Mo_ta);
        }

        updateValues.push(id);

        const sqlCongThuc = `
          UPDATE CongThuc 
          SET ${updateFields.join(', ')}
          WHERE Id = ?
        `;
        await query(sqlCongThuc, updateValues);
      }

      // Chỉ update chi tiết công thức nếu được truyền vào
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
           c.Mo_ta,
           c.Ngay_tao,
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

  // Lấy tất cả công thức của một thành phẩm
  static async getCongThucByThanhPhamId(thanhPhamId) {
    const sql = `
      SELECT 
        c.Id,
        c.Thanh_pham_id,
        c.Ten_cong_thuc,
        tp.Ten_thanh_pham,
        GROUP_CONCAT(
          JSON_OBJECT(
            'Nguyen_vat_lieu_id', ct.Nguyen_vat_lieu_id,
            'Ten_nguyen_lieu', nvl.Ten_nguyen_lieu,
            'So_luong_can', CAST(ct.So_luong_can AS DECIMAL(10,3)),
            'Don_vi_tinh', ct.Don_vi_tinh
          )
        ) as nguyen_lieu
      FROM CongThuc c
      INNER JOIN ThanhPham tp ON c.Thanh_pham_id = tp.Id
      LEFT JOIN ChiTietCongThuc ct ON c.Id = ct.Cong_thuc_id
      LEFT JOIN NguyenVatLieu nvl ON ct.Nguyen_vat_lieu_id = nvl.Id
      WHERE c.Thanh_pham_id = ? AND tp.Id = ?
      GROUP BY c.Id, c.Thanh_pham_id, c.Ten_cong_thuc, tp.Ten_thanh_pham
      ORDER BY c.Id DESC
    `;
    
    const results = await query(sql, [thanhPhamId, thanhPhamId]);
    
    // Xử lý kết quả để chuyển đổi chuỗi nguyen_lieu thành mảng JSON
    return results.map(result => ({
      ...result,
      nguyen_lieu: result.nguyen_lieu ? JSON.parse(`[${result.nguyen_lieu}]`) : []
    }));
  }
}

module.exports = ThanhPham;
