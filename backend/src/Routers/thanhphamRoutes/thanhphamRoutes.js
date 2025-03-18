// src/routes/thanhPhamRoutes.js
const express = require('express');
const router = express.Router();
const {
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
} = require('../../Controllers/thanhPhamController/thanhPhamController');
const { verifyToken, checkRole } = require('../../Middleware/authMiddleware');

// Định nghĩa các routes
router.get('/thanh-pham', verifyToken, getAllThanhPham);
router.get('/thanh-pham/:id', verifyToken, getThanhPhamById);
router.post('/thanh-pham', verifyToken, checkRole(['Admin']), createThanhPham);
router.put('/thanh-pham/:id', verifyToken, checkRole(['Admin']), updateThanhPham);
router.delete('/thanh-pham/:id', verifyToken, checkRole(['Admin']), deleteThanhPham);
router.post('/thanh-pham/:id/san-xuat', verifyToken, checkRole(['Admin']), sanXuatThanhPham);
router.post('/thanh-pham/:id/cong-thuc', verifyToken, checkRole(['Admin']), themCongThuc);
router.get('/thanh-pham/:id/cong-thuc', verifyToken, getCongThucByThanhPhamId);
router.get('/thanh-pham/:id/cong-thuc/:congThucId', verifyToken, getCongThucById);
router.put('/thanh-pham/:id/cong-thuc/:congThucId', verifyToken, checkRole(['Admin']), updateCongThuc);
router.delete('/thanh-pham/:id/cong-thuc/:congThucId', verifyToken, checkRole(['Admin']), xoaCongThuc);

module.exports = router;
