const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../../config/database');
const { verifyToken, checkRole } = require('../../middleware/authMiddleware');
const { userSchema, roleSchema, validate } = require('../../middleware/validationMiddleware');
const util = require('util');
const ApiResponse = require('../../utils/response');
const query = util.promisify(connection.query).bind(connection);

const router = express.Router();

// Thêm vào đầu file
const handleError = (res, error, message) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    console.log('Login attempt:', { username });

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin đăng nhập'
      });
    }

    const userQuery = `
      SELECT n.*, GROUP_CONCAT(q.Ten_quyen) as roles 
      FROM NguoiDung n 
      LEFT JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id 
      LEFT JOIN Quyen q ON qn.Quyen_id = q.Id 
      WHERE n.Ten_dang_nhap = ?
      GROUP BY n.Id
    `;

    const users = await query(userQuery, [username]);
    console.log('User found:', users.length > 0);

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.Mat_khau);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Tên đăng nhập hoặc mật khẩu không đúng'
      });
    }

    if (user.Trang_thai === 0) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }

    const token = jwt.sign(
      { id: user.Id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.Id,
          username: user.Ten_dang_nhap,
          fullName: user.Ho_ten,
          email: user.Email,
          roles: user.roles ? user.roles.split(',') : []
        }
      }
    });
  } catch (error) {
    handleError(res, error, 'Lỗi đăng nhập');
  }
};

// Đăng ký
const register = async (req, res) => {
  try {
    const { username, password, fullName, email, phone } = req.body;

    // Validate password format
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt'
      });
    }

    // Kiểm tra username đã tồn tại
    const existingUser = await query(
      'SELECT Id FROM NguoiDung WHERE Ten_dang_nhap = ?',
      [username]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tên đăng nhập đã tồn tại'
      });
    }

    // Kiểm tra email đã tồn tại
    const existingEmail = await query(
      'SELECT Id FROM NguoiDung WHERE Email = ?',
      [email]
    );
    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }

    // Hash mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Thêm người dùng mới
    const result = await query(
      'INSERT INTO NguoiDung (Ten_dang_nhap, Mat_khau, Ho_ten, Email, SDT, Trang_thai) VALUES (?, ?, ?, ?, ?, 1)',
      [username, hashedPassword, fullName, email, phone]
    );

    // Gán quyền User mặc định
    const userRole = await query('SELECT Id FROM Quyen WHERE Ten_quyen = ?', ['User']);
    if (userRole.length > 0) {
      await query(
        'INSERT INTO Quyen_NguoiDung (Nguoi_dung_id, Quyen_id) VALUES (?, ?)',
        [result.insertId, userRole[0].Id]
      );
    }

    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công'
    });
  } catch (error) {
    handleError(res, error, 'Lỗi đăng ký tài khoản');
  }
};

// Đăng xuất
const logout = async (req, res) => {
  try {
    res.json({
      success: true,
      message: 'Đăng xuất thành công'
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi đăng xuất');
  }
};

// Lấy danh sách người dùng
const getAllUsers = async (req, res) => {
  try {
    const users = await query('SELECT * FROM NguoiDung');
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi lấy danh sách người dùng');
  }
};

// Lấy thông tin người dùng theo ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await query('SELECT * FROM NguoiDung WHERE Id = ?', [id]);
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }
    res.json({
      success: true,
      data: user[0]
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi lấy thông tin người dùng');
  }
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { fullName, email, phone } = req.body;
    await query(
      'UPDATE NguoiDung SET Ho_ten = ?, Email = ?, SDT = ? WHERE Id = ?',
      [fullName, email, phone, id]
    );
    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công'
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi cập nhật thông tin người dùng');
  }
};

// Xóa người dùng
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await query('DELETE FROM NguoiDung WHERE Id = ?', [id]);
    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi xóa người dùng');
  }
};

// Gán quyền cho người dùng
const assignRole = async (req, res) => {
  try {
    const { userId, roleIds } = req.body;
    // Xóa quyền cũ
    await query('DELETE FROM Quyen_NguoiDung WHERE Nguoi_dung_id = ?', [userId]);
    // Thêm quyền mới
    for (const roleId of roleIds) {
      await query(
        'INSERT INTO Quyen_NguoiDung (Nguoi_dung_id, Quyen_id) VALUES (?, ?)',
        [userId, roleId]
      );
    }
    res.json({
      success: true,
      message: 'Gán quyền thành công'
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi gán quyền');
  }
};

// Đổi mật khẩu
const changePassword = async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;
    const user = await query('SELECT Mat_khau FROM NguoiDung WHERE Id = ?', [userId]);
    
    if (user.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const isMatch = await bcrypt.compare(oldPassword, user[0].Mat_khau);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Mật khẩu cũ không đúng'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await query('UPDATE NguoiDung SET Mat_khau = ? WHERE Id = ?', [hashedPassword, userId]);

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi đổi mật khẩu');
  }
};

module.exports = {
  login,
  register,
  logout,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignRole,
  changePassword
}; 