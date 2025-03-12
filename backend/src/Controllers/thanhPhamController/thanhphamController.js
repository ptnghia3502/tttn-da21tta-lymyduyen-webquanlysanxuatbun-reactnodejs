// src/controllers/thanhPhamController.js
const express = require('express');
const ThanhPham = require('../../models/thanhphamModel');
const { verifyToken, checkRole } = require('../../Middleware/authMiddleware');
const router = express.Router();

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

// Thêm mới: API sản xuất thành phẩm
const sanXuatThanhPham = async (req, res) => {
  try {
    const thanhPham = await ThanhPham.getById(req.params.id);
    if (!thanhPham) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy thành phẩm'
      });
    }

    const donSanXuatId = await ThanhPham.sanXuat({
      Thanh_pham_id: req.params.id,
      So_luong: req.body.So_luong,
      nguyen_lieu: req.body.nguyen_lieu
    });

    res.status(201).json({
      success: true,
      message: 'Tạo đơn sản xuất thành công',
      data: { id: donSanXuatId }
    });
  } catch (error) {
    console.error('Error creating production order:', error);
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
    const congThucId = req.params.id;

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
    const congThucId = req.params.id;
    const congThuc = await ThanhPham.getCongThucById(congThucId);

    if (!congThuc.length) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy công thức'
      });
    }

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

module.exports = {
  getAllThanhPham,
  getThanhPhamById,
  createThanhPham,
  updateThanhPham,
  deleteThanhPham,
  sanXuatThanhPham,
  themCongThuc,
  sanXuat,
  xoaCongThuc,
  getAllCongThuc,
  getCongThucById,
  updateCongThuc
};
