const connection = require('../config/database');
const util = require('util');
const query = util.promisify(connection.query).bind(connection);

class Role {
  static async getAll() {
    return query('SELECT * FROM Quyen');
  }

  static async findById(id) {
    const roles = await query('SELECT * FROM Quyen WHERE Id = ?', [id]);
    return roles[0];
  }

  static async create(roleData) {
    const { tenQuyen, moTa } = roleData;
    const result = await query(
      'INSERT INTO Quyen (Ten_quyen, Mo_ta) VALUES (?, ?)',
      [tenQuyen, moTa]
    );
    return this.findById(result.insertId);
  }

  static async update(id, roleData) {
    const { tenQuyen, moTa } = roleData;
    await query(
      'UPDATE Quyen SET Ten_quyen = ?, Mo_ta = ? WHERE Id = ?',
      [tenQuyen, moTa, id]
    );
    return this.findById(id);
  }

  static async getUsersWithRole(roleId) {
    return query(`
      SELECT n.* 
      FROM NguoiDung n
      JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id
      WHERE qn.Quyen_id = ?
    `, [roleId]);
  }
}

module.exports = Role; 