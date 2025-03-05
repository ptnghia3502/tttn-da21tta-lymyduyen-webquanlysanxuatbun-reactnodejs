const connection = require('../Config/database');
const util = require('util');
const query = util.promisify(connection.query).bind(connection);

class NguyenLieu {
  static async getAll(page = 1, limit = 10, search = '') {
    const offset = (page - 1) * limit;
    const whereClause = search ? 'WHERE Ten_nguyen_lieu LIKE ?' : '';
    const searchParam = search ? `%${search}%` : '';
    
    const sql = `
      SELECT 
        nl.*,
        dvt.Ten_don_vi as Don_vi_tinh
      FROM NguyenLieu nl
      LEFT JOIN DonViTinh dvt ON nl.Don_vi_tinh_id = dvt.Id
      ${whereClause}
      LIMIT ? OFFSET ?
    `;

    const params = search ? [searchParam, limit, offset] : [limit, offset];
    const results = await query(sql, params);
    
    const countSql = `SELECT COUNT(*) as total FROM NguyenLieu ${whereClause}`;
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
    const sql = `
      SELECT 
        nl.*,
        dvt.Ten_don_vi as Don_vi_tinh
      FROM NguyenLieu nl
      LEFT JOIN DonViTinh dvt ON nl.Don_vi_tinh_id = dvt.Id
      WHERE nl.Id = ?
    `;
    const results = await query(sql, [id]);
    return results[0];
  }

  static async create(data) {
    const sql = `
      INSERT INTO NguyenLieu (
        Ten_nguyen_lieu, 
        Mo_ta, 
        Don_vi_tinh_id,
        So_luong,
        Gia,
        Trang_thai
      ) VALUES (?, ?, ?, ?, ?, ?)
    `;
    const result = await query(sql, [
      data.tenNguyenLieu,
      data.moTa,
      data.donViTinhId,
      data.soLuong,
      data.gia,
      data.trangThai
    ]);
    return result.insertId;
  }

  static async update(id, data) {
    const sql = `
      UPDATE NguyenLieu 
      SET 
        Ten_nguyen_lieu = ?,
        Mo_ta = ?,
        Don_vi_tinh_id = ?,
        So_luong = ?,
        Gia = ?,
        Trang_thai = ?
      WHERE Id = ?
    `;
    return query(sql, [
      data.tenNguyenLieu,
      data.moTa, 
      data.donViTinhId,
      data.soLuong,
      data.gia,
      data.trangThai,
      id
    ]);
  }

  static async delete(id) {
    return query('DELETE FROM NguyenLieu WHERE Id = ?', [id]);
  }
}

module.exports = NguyenLieu; 