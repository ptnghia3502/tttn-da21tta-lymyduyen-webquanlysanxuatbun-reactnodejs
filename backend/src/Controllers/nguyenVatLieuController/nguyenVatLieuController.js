const express = require('express');
const NguyenVatLieu = require('../../models/nguyenvatlieuModel');
const { verifyToken, checkRole } = require('../../Middleware/authMiddleware');
const { validate } = require('../../Middleware/validationMiddleware');
const router = express.Router();

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

    const nameExists = await NguyenVatLieu.checkExists(req.body.Ten_nguyen_lieu, req.params.id);
    if (nameExists) {
      return res.status(400).json({
        success: false,
        message: 'Tên nguyên vật liệu đã tồn tại'
      });
    }

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
