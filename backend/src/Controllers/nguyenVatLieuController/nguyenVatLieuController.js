const express = require('express');
const NguyenVatLieu = require('../../models/nguyenVatLieuModel');
const { verifyToken, checkRole } = require('../../Middleware/authMiddleware');
const { validate } = require('../../Middleware/validationMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: NguyenVatLieu
 *   description: Nguyên vật liệu management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NguyenVatLieu:
 *       type: object
 *       required:
 *         - Ten_nguyen_lieu
 *       properties:
 *         Id:
 *           type: integer
 *           description: The auto-generated id of the material
 *         Ten_nguyen_lieu:
 *           type: string
 *           description: The name of the material
 *         Mo_ta:
 *           type: string
 *           description: Description of the material
 *         Don_vi:
 *           type: string
 *           description: Unit of measurement
 *         So_luong:
 *           type: number
 *           description: Current quantity
 *         Gia:
 *           type: number
 *           description: Price per unit
 *       example:
 *         Id: 1
 *         Ten_nguyen_lieu: Bột gạo
 *         Mo_ta: Bột gạo làm bún
 *         Don_vi: kg
 *         So_luong: 100
 *         Gia: 15000
 */

/**
 * @swagger
 * /nguyen-vat-lieu:
 *   get:
 *     summary: Get all materials with pagination
 *     tags: [NguyenVatLieu]
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
 *         description: Search term for material name
 *     responses:
 *       200:
 *         description: List of materials
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
 *                     $ref: '#/components/schemas/NguyenVatLieu'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /nguyen-vat-lieu/{id}:
 *   get:
 *     summary: Get material by ID
 *     tags: [NguyenVatLieu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/NguyenVatLieu'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Material not found
 */

/**
 * @swagger
 * /nguyen-vat-lieu:
 *   post:
 *     summary: Create a new material
 *     tags: [NguyenVatLieu]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Ten_nguyen_lieu
 *             properties:
 *               Ten_nguyen_lieu:
 *                 type: string
 *                 description: The name of the material
 *               Mo_ta:
 *                 type: string
 *                 description: Description of the material
 *               Don_vi:
 *                 type: string
 *                 description: Unit of measurement
 *               So_luong:
 *                 type: number
 *                 description: Initial quantity
 *               Gia:
 *                 type: number
 *                 description: Price per unit
 *     responses:
 *       201:
 *         description: Material created successfully
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
 *                   example: Thêm nguyên vật liệu thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *       400:
 *         description: Invalid input or material name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 */

/**
 * @swagger
 * /nguyen-vat-lieu/{id}:
 *   put:
 *     summary: Update a material
 *     tags: [NguyenVatLieu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Material ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Ten_nguyen_lieu:
 *                 type: string
 *                 description: The name of the material
 *               Mo_ta:
 *                 type: string
 *                 description: Description of the material
 *               Don_vi:
 *                 type: string
 *                 description: Unit of measurement
 *               So_luong:
 *                 type: number
 *                 description: Current quantity
 *               Gia:
 *                 type: number
 *                 description: Price per unit
 *     responses:
 *       200:
 *         description: Material updated successfully
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
 *                   example: Cập nhật nguyên vật liệu thành công
 *       400:
 *         description: Invalid input or material name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 *       404:
 *         description: Material not found
 */

/**
 * @swagger
 * /nguyen-vat-lieu/{id}:
 *   delete:
 *     summary: Delete a material
 *     tags: [NguyenVatLieu]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Material ID
 *     responses:
 *       200:
 *         description: Material deleted successfully
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
 *                   example: Xóa nguyên vật liệu thành công
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 *       404:
 *         description: Material not found
 */

// Get all
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await NguyenVatLieu.getAll(parseInt(page), parseInt(limit), search);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error getting materials:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách nguyên vật liệu',
      error: error.message
    });
  }
});

// Get by id
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const material = await NguyenVatLieu.getById(req.params.id);
    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nguyên vật liệu'
      });
    }
    res.json({
      success: true,
      data: material
    });
  } catch (error) {
    console.error('Error getting material:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin nguyên vật liệu',
      error: error.message
    });
  }
});

// Create
router.post('/', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const exists = await NguyenVatLieu.checkExists(req.body.Ten_nguyen_lieu);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Tên nguyên vật liệu đã tồn tại'
      });
    }

    const id = await NguyenVatLieu.create(req.body);
    res.status(201).json({
      success: true,
      message: 'Thêm nguyên vật liệu thành công',
      data: { id }
    });
  } catch (error) {
    console.error('Error creating material:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm nguyên vật liệu',
      error: error.message
    });
  }
});

// Update
router.put('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const exists = await NguyenVatLieu.getById(req.params.id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nguyên vật liệu'
      });
    }

    // const nameExists = await NguyenVatLieu.checkExists(req.body.Ten_nguyen_lieu, req.params.Id);
    // if (nameExists) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Tên nguyên vật liệu đã tồn tại'
    //   });
    // }
    console.log(req.body);
    
    await NguyenVatLieu.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Cập nhật nguyên vật liệu thành công'
    });
  } catch (error) {
    console.error('Error updating material:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật nguyên vật liệu',
      error: error.message
    });
  }
});

// Delete
router.delete('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const exists = await NguyenVatLieu.getById(req.params.id);
    if (!exists) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy nguyên vật liệu'
      });
    }

    await NguyenVatLieu.delete(req.params.id);
    res.json({
      success: true,
      message: 'Xóa nguyên vật liệu thành công'
    });
  } catch (error) {
    console.error('Error deleting material:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa nguyên vật liệu',
      error: error.message
    });
  }
});

module.exports = router;
