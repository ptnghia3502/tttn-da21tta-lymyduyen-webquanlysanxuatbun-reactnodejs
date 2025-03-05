const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/userModel');

class UserService {
  static async login(username, password) {
    const users = await User.findByUsername(username);
    if (users.length === 0) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.Mat_khau);
    if (!isMatch) {
      throw new Error('Tên đăng nhập hoặc mật khẩu không đúng');
    }

    if (user.Trang_thai === 0) {
      throw new Error('Tài khoản đã bị khóa');
    }

    const token = jwt.sign(
      { id: user.Id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    return {
      token,
      user: {
        id: user.Id,
        username: user.Ten_dang_nhap,
        fullName: user.Ho_ten,
        email: user.Email,
        roles: user.roles ? user.roles.split(',') : []
      }
    };
  }

  static async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        throw new Error('User not found');
      }

      const accessToken = jwt.sign(
        { id: user.Id },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      return { accessToken };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  // Thêm các phương thức khác...
}

module.exports = UserService; 