const express = require('express');
const { verifyToken, checkRole } = require('../../Middleware/authMiddleware');
const { roleSchema, validate } = require('../../Middleware/validationMiddleware');
const connection = require('../../Config/database');
const util = require('util');
const query = util.promisify(connection.query).bind(connection);

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Roles
 *   description: Role management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required:
 *         - tenQuyen
 *       properties:
 *         Id:
 *           type: integer
 *           description: The auto-generated id of the role
 *         Ten_quyen:
 *           type: string
 *           description: The name of the role
 *         Mo_ta:
 *           type: string
 *           description: Description of the role
 *       example:
 *         Id: 1
 *         Ten_quyen: Admin
 *         Mo_ta: Administrator role with full access
 */

/**
 * @swagger
 * /roles:
 *   get:
 *     summary: Get all roles
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of roles
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
 *                     $ref: '#/components/schemas/Role'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 */

/**
 * @swagger
 * /roles:
 *   post:
 *     summary: Create a new role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenQuyen
 *             properties:
 *               tenQuyen:
 *                 type: string
 *                 description: The name of the role
 *               moTa:
 *                 type: string
 *                 description: Description of the role
 *     responses:
 *       201:
 *         description: Role created successfully
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
 *                   example: Tạo quyền thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *       400:
 *         description: Invalid input or role name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 */

/**
 * @swagger
 * /roles/{id}:
 *   put:
 *     summary: Update a role
 *     tags: [Roles]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Role ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tenQuyen
 *             properties:
 *               tenQuyen:
 *                 type: string
 *                 description: The name of the role
 *               moTa:
 *                 type: string
 *                 description: Description of the role
 *     responses:
 *       200:
 *         description: Role updated successfully
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
 *                   example: Cập nhật quyền thành công
 *       400:
 *         description: Invalid input or role name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 *       404:
 *         description: Role not found
 */

// Lấy danh sách quyền
router.get('/', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const roles = await query('SELECT * FROM Quyen');
    res.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error getting roles:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách quyền',
      error: error.message
    });
  }
});

// Tạo quyền mới
router.post('/', verifyToken, checkRole(['Admin']), validate(roleSchema.create), async (req, res) => {
  try {
    const { tenQuyen, moTa } = req.body;

    // Kiểm tra quyền đã tồn tại
    const existingRole = await query('SELECT Id FROM Quyen WHERE Ten_quyen = ?', [tenQuyen]);
    if (existingRole.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tên quyền đã tồn tại'
      });
    }

    // Thêm quyền mới
    const result = await query(
      'INSERT INTO Quyen (Ten_quyen, Mo_ta) VALUES (?, ?)',
      [tenQuyen, moTa]
    );

    res.status(201).json({
      success: true,
      message: 'Tạo quyền thành công',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating role:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo quyền',
      error: error.message
    });
  }
});

// Cập nhật quyền
router.put('/:id', verifyToken, checkRole(['Admin']), validate(roleSchema.create), async (req, res) => {
  try {
    const { id } = req.params;
    const { tenQuyen, moTa } = req.body;

    // Kiểm tra quyền tồn tại
    const role = await query('SELECT * FROM Quyen WHERE Id = ?', [id]);
    if (role.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy quyền'
      });
    }

    // Kiểm tra tên quyền đã tồn tại
    const existingRole = await query(
      'SELECT Id FROM Quyen WHERE Ten_quyen = ? AND Id != ?',
      [tenQuyen, id]
    );
    if (existingRole.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tên quyền đã tồn tại'
      });
    }

    // Cập nhật quyền
    await query(
      'UPDATE Quyen SET Ten_quyen = ?, Mo_ta = ? WHERE Id = ?',
      [tenQuyen, moTa, id]
    );

    res.json({
      success: true,
      message: 'Cập nhật quyền thành công'
    });
  } catch (error) {
    console.error('Error updating role:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật quyền',
      error: error.message
    });
  }
});

module.exports = router; 