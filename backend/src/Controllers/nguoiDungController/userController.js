const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const connection = require('../../config/database');
const { verifyToken, checkRole } = require('../../Middleware/authMiddleware');
const { userSchema, roleSchema, validate } = require('../../Middleware/validationMiddleware');
const util = require('util');
const ApiResponse = require('../../utils/response');

const router = express.Router();
const query = util.promisify(connection.query).bind(connection);

// Thêm vào đầu file
const handleError = (res, error, message) => {
  console.error(error);
  res.status(500).json({
    success: false,
    message: message,
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
};

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - fullName
 *         - email
 *       properties:
 *         id:
 *           type: integer
 *           description: The auto-generated id of the user
 *         username:
 *           type: string
 *           description: The username
 *         fullName:
 *           type: string
 *           description: The user's full name
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email
 *         phone:
 *           type: string
 *           description: The user's phone number
 *         status:
 *           type: integer
 *           description: User status (0 = inactive, 1 = active)
 *         roles:
 *           type: array
 *           items:
 *             type: string
 *           description: User roles
 *       example:
 *         id: 1
 *         username: admin
 *         fullName: Administrator
 *         email: admin@example.com
 *         phone: "0123456789"
 *         status: 1
 *         roles: ["Admin"]
 *
 *     LoginRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           description: The username
 *         password:
 *           type: string
 *           description: The password
 *       example:
 *         username: admin
 *         password: Admin123@
 *
 *     RegisterRequest:
 *       type: object
 *       required:
 *         - username
 *         - password
 *         - fullName
 *         - email
 *       properties:
 *         username:
 *           type: string
 *           description: The username
 *         password:
 *           type: string
 *           description: The password
 *         fullName:
 *           type: string
 *           description: The user's full name
 *         email:
 *           type: string
 *           format: email
 *           description: The user's email
 *         phone:
 *           type: string
 *           description: The user's phone number
 *       example:
 *         username: newuser
 *         password: Password123@
 *         fullName: New User
 *         email: newuser@example.com
 *         phone: "0123456789"
 */

/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login to the system
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                       example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Tên đăng nhập hoặc mật khẩu không đúng
 */
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

/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Đăng ký tài khoản thành công
 *       400:
 *         description: Invalid input or username/email already exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Tên đăng nhập đã tồn tại
 */
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

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for name, email or username
 *       - in: query
 *         name: status
 *         schema:
 *           type: integer
 *           enum: [0, 1]
 *         description: Filter by status (0 = inactive, 1 = active)
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 25
 *                     totalPages:
 *                       type: integer
 *                       example: 3
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     hasNextPage:
 *                       type: boolean
 *                       example: true
 *                     hasPrevPage:
 *                       type: boolean
 *                       example: false
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 */
const getAllUsers = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1); // Đảm bảo page >= 1
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10)); // Giới hạn limit từ 1-100
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status !== undefined ? parseInt(req.query.status) : undefined;

    // Xây dựng câu query cơ bản
    let conditions = [];
    let queryParams = [];

    // Thêm điều kiện tìm kiếm
    if (search) {
      conditions.push('(n.Ho_ten LIKE ? OR n.Email LIKE ? OR n.Ten_dang_nhap LIKE ?)');
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Thêm điều kiện lọc theo trạng thái
    if (status !== undefined) {
      conditions.push('n.Trang_thai = ?');
      queryParams.push(status);
    }

    // Tạo WHERE clause
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Query đếm tổng số bản ghi
    const countQuery = `
      SELECT COUNT(DISTINCT n.Id) as total 
      FROM NguoiDung n 
      LEFT JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id 
      LEFT JOIN Quyen q ON qn.Quyen_id = q.Id
      ${whereClause}
    `;

    // Query lấy dữ liệu có phân trang
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

    // Thêm params cho LIMIT và OFFSET
    const dataQueryParams = [...queryParams, limit, offset];

    // Thực hiện queries
    const [totalResult, users] = await Promise.all([
      query(countQuery, queryParams),
      query(dataQuery, dataQueryParams)
    ]);

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Format dữ liệu trả về
    const formattedUsers = users.map(user => ({
      id: user.Id,
      username: user.Ten_dang_nhap,
      fullName: user.Ho_ten,
      email: user.Email,
      phone: user.SDT,
      status: user.Trang_thai,
      createdAt: user.Ngay_Tao,
      roles: user.roles ? user.roles.split(',') : []
    }));

    res.json({
      success: true,
      data: formattedUsers,
      pagination: {
        total,
        totalPages,
        page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi lấy danh sách người dùng');
  }
};

// Đăng ký tài khoản
router.post('/register', validate(userSchema.register), async (req, res) => {
  try {
    const { username, password, fullName, email, phone } = req.body;

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
});

// Đổi mật khẩu
router.put('/change-password', verifyToken, validate(userSchema.changePassword), async (req, res) => {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword } = req.body;

    // Kiểm tra mật khẩu cũ
    const user = await query('SELECT Mat_khau FROM NguoiDung WHERE Id = ?', [userId]);
    if (!user || user.length === 0) {
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

    // Hash mật khẩu mới
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Cập nhật mật khẩu
    await query(
      'UPDATE NguoiDung SET Mat_khau = ? WHERE Id = ?',
      [hashedPassword, userId]
    );

    res.json({
      success: true,
      message: 'Đổi mật khẩu thành công'
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi đổi mật khẩu');
  }
});

// Gán quyền cho người dùng (Admin)
router.post('/assign-role', verifyToken, checkRole(['Admin']), validate(roleSchema.assignRole), async (req, res) => {
  try {
    const { userId, roleIds } = req.body;

    // Kiểm tra người dùng tồn tại
    const userExists = await query('SELECT Id FROM NguoiDung WHERE Id = ?', [userId]);
    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra các quyền tồn tại
    const roleExists = await query(
      'SELECT Id FROM Quyen WHERE Id IN (?)',
      [roleIds]
    );
    if (roleExists.length !== roleIds.length) {
      return res.status(404).json({
        success: false,
        message: 'Một số quyền không tồn tại'
      });
    }

    // Kiểm tra không cho phép xóa quyền Admin của Admin cuối cùng
    const adminCount = await query(`
      SELECT COUNT(*) as count
      FROM NguoiDung n
      JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id
      JOIN Quyen q ON qn.Quyen_id = q.Id
      WHERE q.Ten_quyen = 'Admin'
    `);

    const isAdmin = await query(`
      SELECT 1
      FROM Quyen_NguoiDung qn
      JOIN Quyen q ON qn.Quyen_id = q.Id
      WHERE qn.Nguoi_dung_id = ? AND q.Ten_quyen = 'Admin'
    `, [userId]);

    const adminRole = await query('SELECT Id FROM Quyen WHERE Ten_quyen = ?', ['Admin']);
    const hasAdminRole = roleIds.includes(adminRole[0].Id);

    if (adminCount[0].count === 1 && isAdmin.length > 0 && !hasAdminRole) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa quyền Admin của Admin cuối cùng'
      });
    }

    // Xóa tất cả quyền hiện tại của user
    await query('DELETE FROM Quyen_NguoiDung WHERE Nguoi_dung_id = ?', [userId]);

    // Thêm các quyền mới
    const values = roleIds.map(roleId => [userId, roleId]);
    await query(
      'INSERT INTO Quyen_NguoiDung (Nguoi_dung_id, Quyen_id) VALUES ?',
      [values]
    );

    // Lấy thông tin quyền mới được gán
    const newRoles = await query(`
      SELECT q.Id, q.Ten_quyen
      FROM Quyen q
      JOIN Quyen_NguoiDung qn ON q.Id = qn.Quyen_id
      WHERE qn.Nguoi_dung_id = ?
    `, [userId]);

    res.json({
      success: true,
      message: 'Gán quyền thành công',
      data: {
        userId,
        roles: newRoles
      }
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi gán quyền');
  }
});

// Lấy danh sách người dùng (Admin)
router.get('/', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1); // Đảm bảo page >= 1
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10)); // Giới hạn limit từ 1-100
    const offset = (page - 1) * limit;
    const search = req.query.search || '';
    const status = req.query.status !== undefined ? parseInt(req.query.status) : undefined;

    // Xây dựng câu query cơ bản
    let conditions = [];
    let queryParams = [];

    // Thêm điều kiện tìm kiếm
    if (search) {
      conditions.push('(n.Ho_ten LIKE ? OR n.Email LIKE ? OR n.Ten_dang_nhap LIKE ?)');
      const searchPattern = `%${search}%`;
      queryParams.push(searchPattern, searchPattern, searchPattern);
    }

    // Thêm điều kiện lọc theo trạng thái
    if (status !== undefined) {
      conditions.push('n.Trang_thai = ?');
      queryParams.push(status);
    }

    // Tạo WHERE clause
    const whereClause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : '';

    // Query đếm tổng số bản ghi
    const countQuery = `
      SELECT COUNT(DISTINCT n.Id) as total 
      FROM NguoiDung n 
      LEFT JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id 
      LEFT JOIN Quyen q ON qn.Quyen_id = q.Id
      ${whereClause}
    `;

    // Query lấy dữ liệu có phân trang
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

    // Thêm params cho LIMIT và OFFSET
    const dataQueryParams = [...queryParams, limit, offset];

    // Thực hiện queries
    const [totalResult, users] = await Promise.all([
      query(countQuery, queryParams),
      query(dataQuery, dataQueryParams)
    ]);

    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    // Format dữ liệu trả về
    const formattedUsers = users.map(user => ({
      id: user.Id,
      username: user.Ten_dang_nhap,
      fullName: user.Ho_ten,
      email: user.Email,
      phone: user.SDT,
      status: user.Trang_thai,
      createdAt: user.Ngay_Tao,
      roles: user.roles ? user.roles.split(',') : []
    }));

    res.json({
      success: true,
      data: formattedUsers,
      pagination: {
        total,
        totalPages,
        page,
        limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi lấy danh sách người dùng');
  }
});

// Chi tiết người dùng (Admin)
router.get('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const userId = req.params.id;
    const userQuery = `
      SELECT n.*, GROUP_CONCAT(q.Ten_quyen) as roles 
      FROM NguoiDung n 
      LEFT JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id 
      LEFT JOIN Quyen q ON qn.Quyen_id = q.Id 
      WHERE n.Id = ?
      GROUP BY n.Id
    `;
    
    const users = await query(userQuery, [userId]);
    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    const user = users[0];
    res.json({
      success: true,
      data: {
        id: user.Id,
        username: user.Ten_dang_nhap,
        fullName: user.Ho_ten,
        email: user.Email,
        phone: user.SDT,
        status: user.Trang_thai,
        createdAt: user.Ngay_Tao,
        roles: user.roles ? user.roles.split(',') : []
      }
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi lấy thông tin người dùng');
  }
});

// Cập nhật người dùng (Admin)
router.put('/:id', verifyToken, checkRole(['Admin']), validate(userSchema.update), async (req, res) => {
  try {
    const userId = req.params.id;
    const { fullName, email, phone, status } = req.body;

    // Kiểm tra người dùng tồn tại
    const userExists = await query(
      'SELECT Id FROM NguoiDung WHERE Id = ?',
      [userId]
    );
    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra email đã tồn tại (trừ email hiện tại)
    const existingEmail = await query(
      'SELECT Id FROM NguoiDung WHERE Email = ? AND Id != ?',
      [email, userId]
    );
    if (existingEmail.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Email đã tồn tại'
      });
    }

    // Cập nhật thông tin
    await query(
      'UPDATE NguoiDung SET Ho_ten = ?, Email = ?, SDT = ?, Trang_thai = ? WHERE Id = ?',
      [fullName, email, phone, status, userId]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin người dùng thành công'
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi cập nhật thông tin người dùng');
  }
});

// Xóa người dùng (Admin)
router.delete('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const userId = req.params.id;

    // Kiểm tra người dùng tồn tại
    const userExists = await query(
      'SELECT Id FROM NguoiDung WHERE Id = ?',
      [userId]
    );
    if (userExists.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Kiểm tra không cho phép xóa tài khoản Admin cuối cùng
    const adminCount = await query(`
      SELECT COUNT(*) as count
      FROM NguoiDung n
      JOIN Quyen_NguoiDung qn ON n.Id = qn.Nguoi_dung_id
      JOIN Quyen q ON qn.Quyen_id = q.Id
      WHERE q.Ten_quyen = 'Admin'
    `);

    const isAdmin = await query(`
      SELECT 1
      FROM Quyen_NguoiDung qn
      JOIN Quyen q ON qn.Quyen_id = q.Id
      WHERE qn.Nguoi_dung_id = ? AND q.Ten_quyen = 'Admin'
    `, [userId]);

    if (adminCount[0].count === 1 && isAdmin.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Không thể xóa tài khoản Admin cuối cùng'
      });
    }

    // Xóa các quyền của người dùng
    await query('DELETE FROM Quyen_NguoiDung WHERE Nguoi_dung_id = ?', [userId]);
    
    // Xóa người dùng
    await query('DELETE FROM NguoiDung WHERE Id = ?', [userId]);

    res.json({
      success: true,
      message: 'Xóa người dùng thành công'
    });
  } catch (error) {
    handleError(res, error, 'Lỗi khi xóa người dùng');
  }
});

// Thêm route đăng xuất
router.post('/logout', verifyToken, async (req, res) => {
  try {
    // Có thể thêm logic để blacklist token nếu cần
    res.json(ApiResponse.success(null, 'Đăng xuất thành công'));
  } catch (error) {
    handleError(res, error, 'Lỗi khi đăng xuất');
  }
});

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  try {
    const userId = req.userId; // Lấy từ token
    const { hoTen, email, sdt, matKhau } = req.body;

    // Kiểm tra người dùng tồn tại
    const [user] = await query('SELECT * FROM NguoiDung WHERE Id = ?', [userId]);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng'
      });
    }

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      Ho_ten: hoTen || user.Ho_ten,
      Email: email || user.Email,
      SDT: sdt || user.SDT
    };

    // Nếu có cập nhật mật khẩu
    if (matKhau) {
      const hashedPassword = await bcrypt.hash(matKhau, 10);
      updateData.Mat_khau = hashedPassword;
    }

    // Cập nhật thông tin
    await query(
      'UPDATE NguoiDung SET ? WHERE Id = ?',
      [updateData, userId]
    );

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công'
    });

  } catch (error) {
    handleError(res, error, 'Lỗi khi cập nhật thông tin người dùng');
  }
};

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

// Export tất cả các hàm
module.exports = {
  login,
  register,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  assignRole
}; 