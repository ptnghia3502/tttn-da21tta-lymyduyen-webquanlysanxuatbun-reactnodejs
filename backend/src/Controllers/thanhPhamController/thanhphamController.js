// src/controllers/thanhPhamController.js
const express = require('express');
const ThanhPham = require('../../models/thanhphamModel');
const { verifyToken, checkRole } = require('../../Middleware/authMiddleware');
const router = express.Router();
const jwt = require('jsonwebtoken');

/**
 * @swagger
 * tags:
 *   name: ThanhPham
 *   description: Thành phẩm management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ThanhPham:
 *       type: object
 *       required:
 *         - Ten_thanh_pham
 *         - Don_vi_tinh
 *         - Gia_ban
 *       properties:
 *         Id:
 *           type: integer
 *           description: The auto-generated id of the product
 *         Ten_thanh_pham:
 *           type: string
 *           description: The name of the product
 *         Mo_ta:
 *           type: string
 *           description: Description of the product
 *         Gia_ban:
 *           type: number
 *           description: Selling price
 *         Don_vi_tinh:
 *           type: string
 *           description: Unit of measurement
 *         So_luong:
 *           type: integer
 *           description: Current quantity
 *       example:
 *         Id: 1
 *         Ten_thanh_pham: Bún tươi
 *         Mo_ta: Bún tươi sản xuất từ bột gạo
 *         Gia_ban: 25000
 *         Don_vi_tinh: kg
 *         So_luong: 50
 * 
 *     CongThuc:
 *       type: object
 *       required:
 *         - Ten_cong_thuc
 *         - nguyen_lieu
 *       properties:
 *         Id:
 *           type: integer
 *           description: The auto-generated id of the recipe
 *         Thanh_pham_id:
 *           type: integer
 *           description: ID of the product this recipe is for
 *         Ten_cong_thuc:
 *           type: string
 *           description: Name of the recipe
 *         Mo_ta:
 *           type: string
 *           description: Description of the recipe
 *         nguyen_lieu:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               Nguyen_lieu_id:
 *                 type: integer
 *                 description: ID of the material
 *               So_luong:
 *                 type: number
 *                 description: Required quantity
 *       example:
 *         Id: 1
 *         Thanh_pham_id: 1
 *         Ten_cong_thuc: Công thức bún tươi
 *         Mo_ta: Công thức làm bún tươi từ bột gạo
 *         nguyen_lieu:
 *           - Nguyen_lieu_id: 1
 *             So_luong: 2.5
 */

/**
 * @swagger
 * /thanh-pham:
 *   get:
 *     summary: Get all products with pagination
 *     tags: [ThanhPham]
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
 *         description: Search term for product name
 *     responses:
 *       200:
 *         description: List of products
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
 *                     $ref: '#/components/schemas/ThanhPham'
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
 * /thanh-pham/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [ThanhPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ThanhPham'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /thanh-pham:
 *   post:
 *     summary: Create a new product
 *     tags: [ThanhPham]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Ten_thanh_pham
 *               - Don_vi_tinh
 *               - Gia_ban
 *             properties:
 *               Ten_thanh_pham:
 *                 type: string
 *                 description: The name of the product
 *               Mo_ta:
 *                 type: string
 *                 description: Description of the product
 *               Gia_ban:
 *                 type: number
 *                 description: Selling price
 *               Don_vi_tinh:
 *                 type: string
 *                 description: Unit of measurement
 *               So_luong:
 *                 type: integer
 *                 description: Initial quantity
 *     responses:
 *       201:
 *         description: Product created successfully
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
 *                   example: Thêm thành phẩm thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *       400:
 *         description: Invalid input or product name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 */

/**
 * @swagger
 * /thanh-pham/{id}:
 *   put:
 *     summary: Update a product
 *     tags: [ThanhPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Ten_thanh_pham:
 *                 type: string
 *                 description: The name of the product
 *               Mo_ta:
 *                 type: string
 *                 description: Description of the product
 *               Gia_ban:
 *                 type: number
 *                 description: Selling price
 *               Don_vi_tinh:
 *                 type: string
 *                 description: Unit of measurement
 *               So_luong:
 *                 type: integer
 *                 description: Current quantity
 *     responses:
 *       200:
 *         description: Product updated successfully
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
 *                   example: Cập nhật thành phẩm thành công
 *       400:
 *         description: Invalid input or product name already exists
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /thanh-pham/{id}:
 *   delete:
 *     summary: Delete a product
 *     tags: [ThanhPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
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
 *                   example: Xóa thành phẩm thành công
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /thanh-pham/{id}/san-xuat:
 *   post:
 *     summary: Tạo đơn sản xuất cho thành phẩm
 *     tags: [ThanhPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của thành phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Cong_thuc_id
 *               - So_luong
 *             properties:
 *               Cong_thuc_id:
 *                 type: integer
 *                 description: ID của công thức sản xuất
 *                 example: 1
 *               So_luong:
 *                 type: integer
 *                 description: Số lượng thành phẩm cần sản xuất
 *                 example: 100
 *     responses:
 *       201:
 *         description: Đơn sản xuất được tạo thành công
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
 *                   example: "Tạo đơn sản xuất thành công"
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       description: ID của đơn sản xuất
 *       400:
 *         description: Dữ liệu không hợp lệ
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
 *                   example: "Vui lòng nhập đầy đủ thông tin sản xuất"
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền thực hiện thao tác
 *       404:
 *         description: Không tìm thấy thành phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /thanh-pham/{id}/cong-thuc:
 *   post:
 *     summary: Thêm công thức mới cho thành phẩm
 *     tags: [ThanhPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID của thành phẩm
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Ten_cong_thuc
 *               - nguyen_lieu
 *             properties:
 *               Ten_cong_thuc:
 *                 type: string
 *                 description: Tên công thức
 *                 example: "Công thức 1"
 *               nguyen_lieu:
 *                 type: array
 *                 description: Danh sách nguyên vật liệu trong công thức
 *                 items:
 *                   type: object
 *                   required:
 *                     - Nguyen_vat_lieu_id
 *                     - So_luong_can
 *                     - Don_vi_tinh
 *                   properties:
 *                     Nguyen_vat_lieu_id:
 *                       type: integer
 *                       description: ID của nguyên vật liệu
 *                       example: 1
 *                     So_luong_can:
 *                       type: number
 *                       description: Số lượng cần cho công thức
 *                       example: 100
 *                     Don_vi_tinh:
 *                       type: string
 *                       description: Đơn vị tính
 *                       example: "kg"
 *     responses:
 *       201:
 *         description: Công thức được tạo thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Thêm công thức thành công"
 *                 data:
 *                   $ref: '#/components/schemas/CongThuc'
 *       400:
 *         description: Dữ liệu không hợp lệ
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Dữ liệu không hợp lệ"
 *       401:
 *         description: Không có quyền truy cập
 *       403:
 *         description: Không có quyền thực hiện thao tác
 *       404:
 *         description: Không tìm thấy thành phẩm
 *       500:
 *         description: Lỗi server
 */

/**
 * @swagger
 * /thanh-pham/{id}/cong-thuc:
 *   get:
 *     summary: Get all recipes for a product
 *     tags: [ThanhPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: List of recipes
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
 *                     $ref: '#/components/schemas/CongThuc'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */

/**
 * @swagger
 * /thanh-pham/{id}/cong-thuc/{congThucId}:
 *   get:
 *     summary: Get recipe details by ID
 *     tags: [ThanhPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *       - in: path
 *         name: congThucId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/CongThuc'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Recipe not found
 */

/**
 * @swagger
 * /thanh-pham/{id}/cong-thuc/{congThucId}:
 *   put:
 *     summary: Update a recipe
 *     tags: [ThanhPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *       - in: path
 *         name: congThucId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Ten_cong_thuc:
 *                 type: string
 *                 description: Name of the recipe
 *               Mo_ta:
 *                 type: string
 *                 description: Description of the recipe
 *               nguyen_lieu:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     Nguyen_lieu_id:
 *                       type: integer
 *                       description: ID of the material
 *                     So_luong:
 *                       type: number
 *                       description: Required quantity
 *     responses:
 *       200:
 *         description: Recipe updated successfully
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
 *                   example: Cập nhật công thức thành công
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 *       404:
 *         description: Recipe not found
 */

/**
 * @swagger
 * /thanh-pham/{id}/cong-thuc/{congThucId}:
 *   delete:
 *     summary: Delete a recipe
 *     tags: [ThanhPham]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *       - in: path
 *         name: congThucId
 *         required: true
 *         schema:
 *           type: integer
 *         description: Recipe ID
 *     responses:
 *       200:
 *         description: Recipe deleted successfully
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
 *                   example: Xóa công thức thành công
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - requires Admin role
 *       404:
 *         description: Recipe not found
 */

// Lấy danh sách thành phẩm
const getAllThanhPham = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await ThanhPham.getAll(parseInt(page), parseInt(limit), search);
    
    res.json({
      success: true,
      ...result
    });
  } catch (error) {
    console.error('Error getting products:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách thành phẩm',
      error: error.message
    });
  }
};

// Lấy chi tiết thành phẩm
const getThanhPhamById = async (req, res) => {
  try {
    const thanhPham = await ThanhPham.getById(req.params.id);
    if (!thanhPham) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành phẩm'
      });
    }
    
    res.json({
      success: true,
      data: thanhPham
    });
  } catch (error) {
    console.error('Error getting product:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin thành phẩm',
      error: error.message
    });
  }
};

// Thêm thành phẩm mới
const createThanhPham = async (req, res) => {
  try {
    const { Ten_thanh_pham, Mo_ta, Gia_ban, Don_vi_tinh, So_luong } = req.body;

    // Validate dữ liệu
    if (!Ten_thanh_pham || !Don_vi_tinh || !Gia_ban) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin bắt buộc'
      });
    }

    // Log để debug
    console.log('Creating product with data:', {
      Ten_thanh_pham,
      Mo_ta,
      Gia_ban,
      Don_vi_tinh,
      So_luong
    });

    const exists = await ThanhPham.checkExists(Ten_thanh_pham);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Tên thành phẩm đã tồn tại'
      });
    }

    const id = await ThanhPham.create({
      Ten_thanh_pham,
      Mo_ta,
      Gia_ban,
      Don_vi_tinh,
      So_luong: parseInt(So_luong) || 0 // Đảm bảo So_luong là số
    });

    res.status(201).json({
      success: true,
      message: 'Thêm thành phẩm thành công',
      data: { id }
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm thành phẩm',
      error: error.message
    });
  }
};

// Cập nhật thành phẩm
const updateThanhPham = async (req, res) => {
  try {
    const exists = await ThanhPham.checkExists(req.body.Ten_thanh_pham, req.params.id);
    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Tên thành phẩm đã tồn tại'
      });
    }

    await ThanhPham.update(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Cập nhật thành phẩm thành công'
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật thành phẩm',
      error: error.message
    });
  }
};

// Xóa thành phẩm
const deleteThanhPham = async (req, res) => {
  try {
    await ThanhPham.delete(req.params.id);
    res.json({
      success: true,
      message: 'Xóa thành phẩm thành công'
    });
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thành phẩm',
      error: error.message
    });
  }
};

// Sản xuất thành phẩm
const sanXuatThanhPham = async (req, res) => {
  try {
    const { id } = req.params;
    const { Cong_thuc_id, So_luong } = req.body;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Không tìm thấy token xác thực'
      });
    }

    // Kiểm tra dữ liệu đầu vào
    if (!Cong_thuc_id || !So_luong) {
      return res.status(400).json({
        success: false,
        message: 'Thiếu thông tin công thức hoặc số lượng'
      });
    }

    // Lấy thông tin user từ token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Kiểm tra thành phẩm có tồn tại không
    const thanhPham = await ThanhPham.getById(id);
    if (!thanhPham) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành phẩm'
      });
    }

    // Gọi model để sản xuất
    await ThanhPham.sanXuat({
      Thanh_pham_id: parseInt(id),
      Cong_thuc_id: parseInt(Cong_thuc_id),
      So_luong: parseInt(So_luong),
      Nguoi_thuc_hien: userId
    });

    res.status(201).json({
      success: true,
      message: 'Tạo đơn sản xuất thành công'
    });
  } catch (error) {
    console.error('Error in sanXuatThanhPham:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo đơn sản xuất',
      error: error.message
    });
  }
};

// Thêm các function mới
const themCongThuc = async (req, res) => {
  try {
    const thanhPhamId = req.params.id;
    const { Ten_cong_thuc, Mo_ta, nguyen_lieu } = req.body;

    // Validate dữ liệu
    if (!Ten_cong_thuc || !nguyen_lieu || !nguyen_lieu.length) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin công thức'
      });
    }

    const congThucId = await ThanhPham.themCongThuc({
      Thanh_pham_id: thanhPhamId,
      Ten_cong_thuc,
      Mo_ta,
      nguyen_lieu
    });

    res.status(201).json({
      success: true,
      message: 'Thêm công thức thành công',
      data: { id: congThucId }
    });
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi thêm công thức',
      error: error.message
    });
  }
};

const sanXuat = async (req, res) => {
  try {
    const thanhPhamId = req.params.id;
    const { Cong_thuc_id, So_luong } = req.body;
    const Nguoi_thuc_hien = req.user.id; // Lấy từ token

    // Validate dữ liệu
    if (!Cong_thuc_id || !So_luong) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin sản xuất'
      });
    }

    await ThanhPham.sanXuat({
      Thanh_pham_id: thanhPhamId,
      Cong_thuc_id,
      So_luong,
      Nguoi_thuc_hien
    });

    res.json({
      success: true,
      message: 'Sản xuất thành phẩm thành công'
    });
  } catch (error) {
    console.error('Error producing product:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi sản xuất thành phẩm',
      error: error.message
    });
  }
};

// Xóa công thức
const xoaCongThuc = async (req, res) => {
  try {
    const { congThucId } = req.params;

    await ThanhPham.xoaCongThuc(congThucId);

    res.json({
      success: true,
      message: 'Xóa công thức thành công'
    });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa công thức',
      error: error.message
    });
  }
};

// Lấy tất cả công thức
const getAllCongThuc = async (req, res) => {
  try {
    const congThuc = await ThanhPham.getAllCongThuc();
    res.json({
      success: true,
      data: congThuc
    });
  } catch (error) {
    console.error('Error getting recipes:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách công thức',
      error: error.message
    });
  }
};

// Lấy chi tiết một công thức
const getCongThucById = async (req, res) => {
  try {
    const { congThucId } = req.params;
    const congThuc = await ThanhPham.getCongThucById(congThucId);

    if (!congThuc.length) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công thức'
      });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    res.json({
      success: true,
      data: congThuc
    });
  } catch (error) {
    console.error('Error getting recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông tin công thức',
      error: error.message
    });
  }
};

// Cập nhật công thức
const updateCongThuc = async (req, res) => {
  try {
    const congThucId = req.params.id;
    const { Ten_cong_thuc, nguyen_lieu } = req.body;

    // Validate dữ liệu
    if (!Ten_cong_thuc || !nguyen_lieu || !nguyen_lieu.length) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ thông tin công thức'
      });
    }

    const congThuc = await ThanhPham.updateCongThuc(congThucId, {
      Ten_cong_thuc,
      nguyen_lieu
    });

    res.json({
      success: true,
      message: 'Cập nhật công thức thành công',
      data: congThuc
    });
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật công thức',
      error: error.message
    });
  }
};

// Lấy tất cả công thức của một thành phẩm
const getCongThucByThanhPhamId = async (req, res) => {
  try {
    const { id } = req.params;
    const congThuc = await ThanhPham.getCongThucByThanhPhamId(id);
    
    // Set response headers
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.json({
      success: true,
      data: congThuc
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách công thức:', error);
    res.status(500).json({ 
      success: false,
      message: 'Lỗi khi lấy danh sách công thức' 
    });
  }
};

// Routes
router.get('/', verifyToken, getAllThanhPham);
router.get('/:id', verifyToken, getThanhPhamById);
router.post('/', verifyToken, checkRole(['Admin']), createThanhPham);
router.put('/:id', verifyToken, checkRole(['Admin']), updateThanhPham);
router.delete('/:id', verifyToken, checkRole(['Admin']), deleteThanhPham);

// Sản xuất routes
router.post('/:id/san-xuat', verifyToken, checkRole(['Admin']), sanXuatThanhPham);

// Công thức routes
router.post('/:id/cong-thuc', verifyToken, checkRole(['Admin']), themCongThuc);
router.get('/:id/cong-thuc', verifyToken, getCongThucByThanhPhamId);
router.get('/:id/cong-thuc/:congThucId', verifyToken, getCongThucById);
router.put('/:id/cong-thuc/:congThucId', verifyToken, checkRole(['Admin']), updateCongThuc);
router.delete('/:id/cong-thuc/:congThucId', verifyToken, checkRole(['Admin']), xoaCongThuc);

module.exports = {
  getAllThanhPham,
  getThanhPhamById,
  createThanhPham,
  updateThanhPham,
  deleteThanhPham,
  sanXuatThanhPham,
  themCongThuc,
  getAllCongThuc,
  getCongThucById,
  updateCongThuc,
  xoaCongThuc,
  getCongThucByThanhPhamId
};
