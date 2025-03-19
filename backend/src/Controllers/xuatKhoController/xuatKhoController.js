const express = require('express');
const XuatKho = require('../../models/xuatKhoModel');
const { verifyToken, checkRole } = require('../../Middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: XuatKho
 *   description: Quản lý phiếu xuất kho
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     XuatKho:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: ID phiếu xuất kho
 *         Ma_xuat_kho:
 *           type: string
 *           description: Mã phiếu xuất kho
 *         Ngay_xuat:
 *           type: string
 *           format: date-time
 *           description: Ngày xuất kho
 *         Nguoi_xuat_id:
 *           type: integer
 *           description: ID người xuất kho
 *         Nguoi_xuat:
 *           type: string
 *           description: Tên người xuất kho
 *         Tong_tien:
 *           type: number
 *           description: Tổng tiền xuất kho
 *         Ghi_chu:
 *           type: string
 *           description: Ghi chú
 *       example:
 *         Id: 1
 *         Ma_xuat_kho: XK20230101001
 *         Ngay_xuat: 2023-01-01T00:00:00.000Z
 *         Nguoi_xuat_id: 1
 *         Nguoi_xuat: Admin
 *         Tong_tien: 1000000
 *         Ghi_chu: Xuất kho thành phẩm
 *     
 *     ChiTietXuatKho:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: ID chi tiết phiếu xuất kho
 *         Thanh_pham_id:
 *           type: integer
 *           description: ID thành phẩm
 *         Ten_thanh_pham:
 *           type: string
 *           description: Tên thành phẩm
 *         So_luong:
 *           type: integer
 *           description: Số lượng xuất
 *         Gia_ban:
 *           type: number
 *           description: Giá bán
 *         Thanh_tien:
 *           type: number
 *           description: Thành tiền
 *         Don_vi_tinh:
 *           type: string
 *           description: Đơn vị tính
 *       example:
 *         Id: 1
 *         Thanh_pham_id: 1
 *         Ten_thanh_pham: Bún tươi
 *         So_luong: 100
 *         Gia_ban: 25000
 *         Thanh_tien: 2500000
 *         Don_vi_tinh: kg
 */

/**
 * @swagger
 * /xuat-kho:
 *   get:
 *     summary: Lấy danh sách phiếu xuất kho
 *     tags: [XuatKho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Số trang
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Số lượng mỗi trang
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Tìm kiếm theo mã phiếu xuất kho
 *     responses:
 *       200:
 *         description: Danh sách phiếu xuất kho
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
 *                     $ref: '#/components/schemas/XuatKho'
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
 *         description: Không có quyền truy cập
 */
router.get('/', verifyToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const result = await XuatKho.getAll(parseInt(page), parseInt(limit), search);
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error in get all xuat kho:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phiếu xuất kho',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /xuat-kho/{id}:
 *   get:
 *     summary: Lấy chi tiết phiếu xuất kho
 *     tags: [XuatKho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID phiếu xuất kho
 *     responses:
 *       200:
 *         description: Chi tiết phiếu xuất kho
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
 *                     Id:
 *                       type: integer
 *                     Ma_xuat_kho:
 *                       type: string
 *                     Ngay_xuat:
 *                       type: string
 *                       format: date-time
 *                     Nguoi_xuat_id:
 *                       type: integer
 *                     Nguoi_xuat:
 *                       type: string
 *                     Tong_tien:
 *                       type: number
 *                     Ghi_chu:
 *                       type: string
 *                     chi_tiet:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChiTietXuatKho'
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy phiếu xuất kho
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const xuatKho = await XuatKho.getById(parseInt(id));
    
    if (!xuatKho) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu xuất kho'
      });
    }
    
    res.json({
      success: true,
      data: xuatKho
    });
  } catch (error) {
    console.error('Error in get xuat kho by id:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết phiếu xuất kho',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /xuat-kho:
 *   post:
 *     summary: Tạo phiếu xuất kho mới
 *     tags: [XuatKho]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Ghi_chu:
 *                 type: string
 *                 description: Ghi chú
 *               chi_tiet:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - Thanh_pham_id
 *                     - So_luong
 *                   properties:
 *                     Thanh_pham_id:
 *                       type: integer
 *                       description: ID thành phẩm
 *                     So_luong:
 *                       type: integer
 *                       description: Số lượng xuất
 *     responses:
 *       201:
 *         description: Tạo phiếu xuất kho thành công
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
 *                   example: Tạo phiếu xuất kho thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     ma_xuat_kho:
 *                       type: string
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { Ghi_chu, chi_tiet } = req.body;
    
    // Kiểm tra dữ liệu đầu vào
    if (!chi_tiet || !Array.isArray(chi_tiet) || chi_tiet.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập chi tiết phiếu xuất kho'
      });
    }
    
    // Kiểm tra từng chi tiết
    for (const item of chi_tiet) {
      if (!item.Thanh_pham_id || !item.So_luong) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin chi tiết phiếu xuất kho'
        });
      }
      
      if (item.So_luong <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Số lượng phải lớn hơn 0'
        });
      }
    }
    
    // Lấy ID người dùng từ token
    const userId = req.userId;
    
    const result = await XuatKho.create({
      Nguoi_xuat_id: userId,
      Ghi_chu,
      chi_tiet
    });
    
    res.status(201).json({
      success: true,
      message: 'Tạo phiếu xuất kho thành công',
      data: result
    });
  } catch (error) {
    console.error('Error in create xuat kho:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo phiếu xuất kho',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /xuat-kho/{id}:
 *   put:
 *     summary: Cập nhật phiếu xuất kho
 *     tags: [XuatKho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID phiếu xuất kho
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Ghi_chu:
 *                 type: string
 *                 description: Ghi chú
 *               chi_tiet:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - Thanh_pham_id
 *                     - So_luong
 *                   properties:
 *                     Thanh_pham_id:
 *                       type: integer
 *                       description: ID thành phẩm
 *                     So_luong:
 *                       type: integer
 *                       description: Số lượng xuất
 *     responses:
 *       200:
 *         description: Cập nhật phiếu xuất kho thành công
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
 *                   example: Cập nhật phiếu xuất kho thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy phiếu xuất kho
 */
router.put('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { Ghi_chu, chi_tiet } = req.body;
    
    // Kiểm tra phiếu xuất kho có tồn tại không
    const xuatKho = await XuatKho.getById(parseInt(id));
    if (!xuatKho) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu xuất kho'
      });
    }
    
    // Kiểm tra dữ liệu đầu vào nếu có chi tiết
    if (chi_tiet) {
      if (!Array.isArray(chi_tiet) || chi_tiet.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập chi tiết phiếu xuất kho'
        });
      }
      
      // Kiểm tra từng chi tiết
      for (const item of chi_tiet) {
        if (!item.Thanh_pham_id || !item.So_luong) {
          return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập đầy đủ thông tin chi tiết phiếu xuất kho'
          });
        }
        
        if (item.So_luong <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Số lượng phải lớn hơn 0'
          });
        }
      }
    }
    
    await XuatKho.update(parseInt(id), {
      Ghi_chu,
      chi_tiet
    });
    
    res.json({
      success: true,
      message: 'Cập nhật phiếu xuất kho thành công'
    });
  } catch (error) {
    console.error('Error in update xuat kho:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật phiếu xuất kho',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /xuat-kho/{id}:
 *   delete:
 *     summary: Xóa phiếu xuất kho
 *     tags: [XuatKho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID phiếu xuất kho
 *     responses:
 *       200:
 *         description: Xóa phiếu xuất kho thành công
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
 *                   example: Xóa phiếu xuất kho thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy phiếu xuất kho
 */
router.delete('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra phiếu xuất kho có tồn tại không
    const xuatKho = await XuatKho.getById(parseInt(id));
    if (!xuatKho) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu xuất kho'
      });
    }
    
    await XuatKho.delete(parseInt(id));
    
    res.json({
      success: true,
      message: 'Xóa phiếu xuất kho thành công'
    });
  } catch (error) {
    console.error('Error in delete xuat kho:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa phiếu xuất kho',
      error: error.message
    });
  }
});

module.exports = router; 