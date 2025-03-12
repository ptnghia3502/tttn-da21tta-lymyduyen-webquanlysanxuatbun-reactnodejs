// src/routes/thanhPhamRoutes.js
const express = require('express');
const router = express.Router();
const thanhPhamController = require('../../Controllers/thanhPhamController/thanhphamController');
const { verifyToken, checkRole } = require('../../Middleware/authMiddleware');

// Định nghĩa các routes
router.get('/thanh-pham', verifyToken, thanhPhamController.getAllThanhPham);
router.post('/thanh-pham', verifyToken, checkRole(['Admin']), thanhPhamController.createThanhPham);
router.delete('/thanh-pham/:id', verifyToken, checkRole(['Admin']), thanhPhamController.deleteThanhPham);
router.post('/thanh-pham/:id/san-xuat', verifyToken, checkRole(['Admin']), thanhPhamController.sanXuat);
router.post('/thanh-pham/:id/cong-thuc', verifyToken, checkRole(['Admin']), thanhPhamController.themCongThuc);
router.delete('/thanh-pham/cong-thuc/:id', verifyToken, checkRole(['Admin']), thanhPhamController.xoaCongThuc);
router.get('/thanh-pham/cong-thuc', verifyToken, thanhPhamController.getAllCongThuc);
router.get('/thanh-pham/cong-thuc/:id', verifyToken, thanhPhamController.getCongThucById);

module.exports = router;
