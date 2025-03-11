const connection = require('../config/database');
const util = require('util');
const query = util.promisify(connection.query).bind(connection);

class NguyenVatLieu {
  static async getAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const whereClause = search ? 'WHERE Ten_nguyen_lieu LIKE ?' : '';
    const searchParam = search ? `%${search}%` : '';
    
    const sql = `
      SELECT * FROM NguyenVatLieu 
      ${whereClause}
      ORDER BY Id DESC
      LIMIT ? OFFSET ?
    `;

    const params = search ? [searchParam, limit, offset] : [limit, offset];
    const results = await query(sql, params);
    
    const countSql = `SELECT COUNT(*) as total FROM NguyenVatLieu ${whereClause}`;
    const countParams = search ? [searchParam] : [];
    const [{ total }] = await query(countSql, countParams);

    return {
      data: results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  static async getById(id) {
    const sql = 'SELECT * FROM NguyenVatLieu WHERE Id = ?';
    const results = await query(sql, [id]);
    return results[0];
  }

  static async create(data) {
    const sql = `
      INSERT INTO NguyenVatLieu (
        Ten_nguyen_lieu,
        Gia,
        So_luong_ton,
        Don_vi_tinh,
        Ngay_cap_nhat
      ) VALUES (?, ?, ?, ?, CURRENT_DATE)
    `;
    
    const result = await query(sql, [
      data.Ten_nguyen_lieu,
      data.Gia,
      data.So_luong_ton || 0,
      data.Don_vi_tinh
    ]);

    return result.insertId;
  }

  static async update(id, data) {
    const sql = `
      UPDATE NguyenVatLieu 
      SET 
        Ten_nguyen_lieu = ?,
        Gia = ?,
        So_luong_ton = ?,
        Don_vi_tinh = ?,
        Ngay_cap_nhat = CURRENT_DATE
      WHERE Id = ?
    `;

    return query(sql, [
      data.Ten_nguyen_lieu,
      data.Gia,
      data.So_luong_ton,
      data.Don_vi_tinh,
      id
    ]);
  }

  static async delete(id) {
    return query('DELETE FROM NguyenVatLieu WHERE Id = ?', [id]);
  }

  static async checkExists(tenNguyenLieu, excludeId = null) {
    const sql = excludeId 
      ? 'SELECT Id FROM NguyenVatLieu WHERE Ten_nguyen_lieu = ? AND Id != ?'
      : 'SELECT Id FROM NguyenVatLieu WHERE Ten_nguyen_lieu = ?';
    
    const params = excludeId ? [tenNguyenLieu, excludeId] : [tenNguyenLieu];
    const results = await query(sql, params);
    return results.length > 0;
  }
}

module.exports = NguyenVatLieu;
