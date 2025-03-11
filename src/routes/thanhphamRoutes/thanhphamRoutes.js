// src/routes/thanhPhamRoutes.js
const express = require('express');
const router = express.Router();
const thanhPhamController = require('../../controller/thanhPhamController/thanhphamController');
const { verifyToken, checkRole } = require('../../middleware/authMiddleware');

// Định nghĩa các routes - hỗ trợ cả 2 dạng URL
// Dạng không có dấu gạch ngang
router.get('/thanhpham', verifyToken, thanhPhamController.getAllThanhPham);
router.get('/thanhpham/:id', verifyToken, thanhPhamController.getThanhPhamById);
router.post('/thanhpham', verifyToken, checkRole(['Admin']), thanhPhamController.createThanhPham);
router.put('/thanhpham/:id', verifyToken, checkRole(['Admin']), thanhPhamController.updateThanhPham);
router.delete('/thanhpham/:id', verifyToken, checkRole(['Admin']), thanhPhamController.deleteThanhPham);
router.post('/thanhpham/:id/san-xuat', verifyToken, checkRole(['Admin']), thanhPhamController.sanXuatThanhPham);

// Dạng có dấu gạch ngang
router.get('/thanh-pham', verifyToken, thanhPhamController.getAllThanhPham);
router.get('/thanh-pham/:id', verifyToken, thanhPhamController.getThanhPhamById);
router.post('/thanh-pham', verifyToken, checkRole(['Admin']), thanhPhamController.createThanhPham);
router.put('/thanh-pham/:id', verifyToken, checkRole(['Admin']), thanhPhamController.updateThanhPham);
router.delete('/thanh-pham/:id', verifyToken, checkRole(['Admin']), thanhPhamController.deleteThanhPham);
router.post('/thanh-pham/:id/cong-thuc', verifyToken, checkRole(['Admin']), thanhPhamController.themCongThuc);
router.post('/thanh-pham/:id/san-xuat', verifyToken, checkRole(['Admin']), thanhPhamController.sanXuat);

// Thêm công thức
router.post('/thanh-pham/:id/cong-thuc', verifyToken, checkRole(['Admin']), thanhPhamController.themCongThuc);

// Sản xuất thành phẩm
router.post('/thanh-pham/:id/san-xuat', verifyToken, checkRole(['Admin']), thanhPhamController.sanXuat);

// Thêm route xóa công thức
router.delete('/thanh-pham/cong-thuc/:id', verifyToken, checkRole(['Admin']), thanhPhamController.xoaCongThuc);

// Thêm routes cho công thức
router.get('/thanh-pham/cong-thuc', verifyToken, thanhPhamController.getAllCongThuc);
router.get('/thanh-pham/cong-thuc/:id', verifyToken, thanhPhamController.getCongThucById);

// Thêm route cập nhật công thức
router.put('/thanh-pham/cong-thuc/:id', verifyToken, checkRole(['Admin']), thanhPhamController.updateCongThuc);

// Không sử dụng router.use() vì thanhPhamController là object
// router.use('/', thanhPhamController);  // Dòng này gây lỗi

module.exports = router;
