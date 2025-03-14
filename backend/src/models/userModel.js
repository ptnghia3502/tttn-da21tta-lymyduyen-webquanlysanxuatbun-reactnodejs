const connection = require('../config/database');
const util = require('util');
const query = util.promisify(connection.query).bind(connection);

class User {
  static async findByUsername(username) {
    const sql = `
      SELECT n.*, GROUP_CONCAT(q.Ten_quyen) as roles 
      FROM NguoiDung n 
      LEFT JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id 
      LEFT JOIN Quyen q ON qn.Quyen_id = q.Id 
      WHERE n.Ten_dang_nhap = ?
      GROUP BY n.Id
    `;
    return query(sql, [username]);
  }

  static async findById(id) {
    const sql = `
      SELECT n.*, GROUP_CONCAT(q.Ten_quyen) as roles 
      FROM NguoiDung n 
      LEFT JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id 
      LEFT JOIN Quyen q ON qn.Quyen_id = q.Id 
      WHERE n.Id = ?
      GROUP BY n.Id
    `;
    return query(sql, [id]);
  }

  static async findByEmail(email) {
    return query('SELECT * FROM NguoiDung WHERE Email = ?', [email]);
  }

  static async create(userData) {
    const { username, password, fullName, email, phone } = userData;
    const sql = 'INSERT INTO NguoiDung (Ten_dang_nhap, Mat_khau, Ho_ten, Email, SDT, Trang_thai) VALUES (?, ?, ?, ?, ?, 1)';
    return query(sql, [username, password, fullName, email, phone]);
  }

  static async update(id, userData) {
    const { fullName, email, phone, status } = userData;
    const sql = 'UPDATE NguoiDung SET Ho_ten = ?, Email = ?, SDT = ?, Trang_thai = ? WHERE Id = ?';
    return query(sql, [fullName, email, phone, status, id]);
  }

  static async delete(id) {
    return query('DELETE FROM NguoiDung WHERE Id = ?', [id]);
  }

  static async updatePassword(id, hashedPassword) {
    return query('UPDATE NguoiDung SET Mat_khau = ? WHERE Id = ?', [hashedPassword, id]);
  }

  static async getList({ page, limit, search, status }) {
    let conditions = [];
    let queryParams = [];

    if (search) {
      conditions.push('(n.Ho_ten LIKE ? OR n.Email LIKE ? OR n.Ten_dang_nhap LIKE ?)');
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    if (status !== undefined) {
      conditions.push('n.Trang_thai = ?');
      queryParams.push(status);
    }

    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';
    const offset = (page - 1) * limit;

    const countQuery = `
      SELECT COUNT(DISTINCT n.Id) as total 
      FROM NguoiDung n 
      LEFT JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id 
      LEFT JOIN Quyen q ON qn.Quyen_id = q.Id
      ${whereClause}
    `;

    const dataQuery = `
      SELECT 
        n.Id,
        n.Ten_dang_nhap,
        n.Ho_ten,
        n.Email,
        n.SDT,
        n.Trang_thai,
        n.Ngay_Tao,
        GROUP_CONCAT(DISTINCT q.Ten_quyen) as roles
      FROM NguoiDung n 
      LEFT JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id 
      LEFT JOIN Quyen q ON qn.Quyen_id = q.Id
      ${whereClause}
      GROUP BY n.Id
      ORDER BY n.Ngay_Tao DESC
      LIMIT ? OFFSET ?
    `;

    const [totalResult, users] = await Promise.all([
      query(countQuery, queryParams),
      query(dataQuery, [...queryParams, limit, offset])
    ]);

    return {
      users,
      total: totalResult[0].total
    };
  }

  static async getRoles(userId) {
    const sql = `
      SELECT q.Id, q.Ten_quyen
      FROM Quyen q
      JOIN Quyen_NguoiDung qn ON q.Id = qn.Quyen_id
      WHERE qn.Nguoi_dung_id = ?
    `;
    return query(sql, [userId]);
  }

  static async assignRoles(userId, roleIds) {
    await query('DELETE FROM Quyen_NguoiDung WHERE Nguoi_dung_id = ?', [userId]);
    
    if (roleIds.length > 0) {
      const values = roleIds.map(roleId => [userId, roleId]);
      return query(
        'INSERT INTO Quyen_NguoiDung (Nguoi_dung_id, Quyen_id) VALUES ?',
        [values]
      );
    }
  }

  static async countAdmins() {
    const sql = `
      SELECT COUNT(*) as count
      FROM NguoiDung n
      JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id
      JOIN Quyen q ON qn.Quyen_id = q.Id
      WHERE q.Ten_quyen = 'Admin'
    `;
    const result = await query(sql);
    return result[0].count;
  }

  static async isAdmin(userId) {
    const sql = `
      SELECT 1
      FROM Quyen_NguoiDung qn
      JOIN Quyen q ON qn.Quyen_id = q.Id
      WHERE qn.Nguoi_dung_id = ? AND q.Ten_quyen = 'Admin'
    `;
    const result = await query(sql, [userId]);
    return result.length > 0;
  }
}

module.exports = User; 