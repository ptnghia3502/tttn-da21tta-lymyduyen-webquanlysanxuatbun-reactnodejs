const express = require('express');
const NhapKho = require('../../models/nhapKhoModel');
const { verifyToken, checkRole } = require('../../Middleware/authMiddleware');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: NhapKho
 *   description: Quản lý phiếu nhập kho
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     NhapKho:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: ID phiếu nhập kho
 *         Ma_nhap_kho:
 *           type: string
 *           description: Mã phiếu nhập kho
 *         Ngay_nhap:
 *           type: string
 *           format: date-time
 *           description: Ngày nhập kho
 *         Nguoi_nhap_id:
 *           type: integer
 *           description: ID người nhập kho
 *         Nguoi_nhap:
 *           type: string
 *           description: Tên người nhập kho
 *         Tong_tien:
 *           type: number
 *           description: Tổng tiền nhập kho
 *         Ghi_chu:
 *           type: string
 *           description: Ghi chú
 *       example:
 *         Id: 1
 *         Ma_nhap_kho: NK20230101001
 *         Ngay_nhap: 2023-01-01T00:00:00.000Z
 *         Nguoi_nhap_id: 1
 *         Nguoi_nhap: Admin
 *         Tong_tien: 1000000
 *         Ghi_chu: Nhập kho nguyên vật liệu
 *     
 *     ChiTietNhapKho:
 *       type: object
 *       properties:
 *         Id:
 *           type: integer
 *           description: ID chi tiết phiếu nhập kho
 *         Nguyen_vat_lieu_id:
 *           type: integer
 *           description: ID nguyên vật liệu
 *         Ten_nguyen_lieu:
 *           type: string
 *           description: Tên nguyên vật liệu
 *         So_luong:
 *           type: integer
 *           description: Số lượng nhập
 *         Don_gia:
 *           type: number
 *           description: Đơn giá
 *         Thanh_tien:
 *           type: number
 *           description: Thành tiền
 *         Don_vi_tinh:
 *           type: string
 *           description: Đơn vị tính
 *         Ghi_chu:
 *           type: string
 *           description: Ghi chú
 *       example:
 *         Id: 1
 *         Nguyen_vat_lieu_id: 1
 *         Ten_nguyen_lieu: Bột gạo
 *         So_luong: 100
 *         Don_gia: 10000
 *         Thanh_tien: 1000000
 *         Don_vi_tinh: kg
 *         Ghi_chu: Bột gạo chất lượng cao
 */

/**
 * @swagger
 * /nhap-kho:
 *   get:
 *     summary: Lấy danh sách phiếu nhập kho
 *     tags: [NhapKho]
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
 *         description: Tìm kiếm theo mã phiếu nhập kho
 *     responses:
 *       200:
 *         description: Danh sách phiếu nhập kho
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
 *                     $ref: '#/components/schemas/NhapKho'
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
    const result = await NhapKho.getAll(parseInt(page), parseInt(limit), search);
    
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error in get all nhap kho:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách phiếu nhập kho',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /nhap-kho/{id}:
 *   get:
 *     summary: Lấy chi tiết phiếu nhập kho
 *     tags: [NhapKho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID phiếu nhập kho
 *     responses:
 *       200:
 *         description: Chi tiết phiếu nhập kho
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
 *                     Ma_nhap_kho:
 *                       type: string
 *                     Ngay_nhap:
 *                       type: string
 *                       format: date-time
 *                     Nguoi_nhap_id:
 *                       type: integer
 *                     Nguoi_nhap:
 *                       type: string
 *                     Tong_tien:
 *                       type: number
 *                     Ghi_chu:
 *                       type: string
 *                     chi_tiet:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/ChiTietNhapKho'
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy phiếu nhập kho
 */
router.get('/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const nhapKho = await NhapKho.getById(parseInt(id));
    
    if (!nhapKho) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu nhập kho'
      });
    }
    
    res.json({
      success: true,
      data: nhapKho
    });
  } catch (error) {
    console.error('Error in get nhap kho by id:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy chi tiết phiếu nhập kho',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /nhap-kho:
 *   post:
 *     summary: Tạo phiếu nhập kho mới
 *     tags: [NhapKho]
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
 *                 description: Ghi chú chung cho phiếu nhập kho
 *               chi_tiet:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - Nguyen_vat_lieu_id
 *                     - So_luong
 *                   properties:
 *                     Nguyen_vat_lieu_id:
 *                       type: integer
 *                       description: ID nguyên vật liệu
 *                     So_luong:
 *                       type: integer
 *                       description: Số lượng nhập
 *     responses:
 *       201:
 *         description: Tạo phiếu nhập kho thành công
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
 *                   example: Tạo phiếu nhập kho thành công
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     ma_nhap_kho:
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
        message: 'Vui lòng nhập chi tiết phiếu nhập kho'
      });
    }
    
    // Kiểm tra từng chi tiết
    for (const item of chi_tiet) {
      if (!item.Nguyen_vat_lieu_id || !item.So_luong) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập đầy đủ thông tin chi tiết phiếu nhập kho'
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
    
    const result = await NhapKho.create({
      Nguoi_nhap_id: userId,
      Ghi_chu,
      chi_tiet
    });
    
    res.status(201).json({
      success: true,
      message: 'Tạo phiếu nhập kho thành công',
      data: result
    });
  } catch (error) {
    console.error('Error in create nhap kho:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi tạo phiếu nhập kho',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /nhap-kho/{id}:
 *   put:
 *     summary: Cập nhật phiếu nhập kho
 *     tags: [NhapKho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID phiếu nhập kho
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Ghi_chu:
 *                 type: string
 *                 description: Ghi chú chung cho phiếu nhập kho
 *               chi_tiet:
 *                 type: array
 *                 items:
 *                   type: object
 *                   required:
 *                     - Nguyen_vat_lieu_id
 *                     - So_luong
 *                   properties:
 *                     Nguyen_vat_lieu_id:
 *                       type: integer
 *                       description: ID nguyên vật liệu
 *                     So_luong:
 *                       type: integer
 *                       description: Số lượng nhập
 *     responses:
 *       200:
 *         description: Cập nhật phiếu nhập kho thành công
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
 *                   example: Cập nhật phiếu nhập kho thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy phiếu nhập kho
 */
router.put('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    const { Ghi_chu, chi_tiet } = req.body;
    
    // Kiểm tra phiếu nhập kho có tồn tại không
    const nhapKho = await NhapKho.getById(parseInt(id));
    if (!nhapKho) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu nhập kho'
      });
    }
    
    // Kiểm tra dữ liệu đầu vào nếu có chi tiết
    if (chi_tiet) {
      if (!Array.isArray(chi_tiet) || chi_tiet.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng nhập chi tiết phiếu nhập kho'
        });
      }
      
      // Kiểm tra từng chi tiết
      for (const item of chi_tiet) {
        if (!item.Nguyen_vat_lieu_id || !item.So_luong) {
          return res.status(400).json({
            success: false,
            message: 'Vui lòng nhập đầy đủ thông tin chi tiết phiếu nhập kho'
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
    
    await NhapKho.update(parseInt(id), {
      Ghi_chu,
      chi_tiet
    });
    
    res.json({
      success: true,
      message: 'Cập nhật phiếu nhập kho thành công'
    });
  } catch (error) {
    console.error('Error in update nhap kho:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi cập nhật phiếu nhập kho',
      error: error.message
    });
  }
});

/**
 * @swagger
 * /nhap-kho/{id}:
 *   delete:
 *     summary: Xóa phiếu nhập kho
 *     tags: [NhapKho]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID phiếu nhập kho
 *     responses:
 *       200:
 *         description: Xóa phiếu nhập kho thành công
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
 *                   example: Xóa phiếu nhập kho thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy phiếu nhập kho
 */
router.delete('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const { id } = req.params;
    
    // Kiểm tra phiếu nhập kho có tồn tại không
    const nhapKho = await NhapKho.getById(parseInt(id));
    if (!nhapKho) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy phiếu nhập kho'
      });
    }
    
    await NhapKho.delete(parseInt(id));
    
    res.json({
      success: true,
      message: 'Xóa phiếu nhập kho thành công'
    });
  } catch (error) {
    console.error('Error in delete nhap kho:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa phiếu nhập kho',
      error: error.message
    });
  }
});

module.exports = router; 