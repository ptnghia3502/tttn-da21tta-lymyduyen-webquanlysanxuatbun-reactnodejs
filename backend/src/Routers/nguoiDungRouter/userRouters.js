const express = require('express');
const router = express.Router();
const userController = require('../../Controllers/nguoiDungController/userController');
const { verifyToken, checkRole } = require('../../Middleware/authMiddleware');
const { validate, userSchema } = require('../../Middleware/validationMiddleware');

/**
 * @swagger
 * tags:
 *   name: Authentication
 *   description: User authentication endpoints
 */

/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management endpoints
 */

// Định nghĩa các routes
router.post('/users/login', userController.login);
router.post('/users/register', validate(userSchema.register), userController.register);

// Thêm route PUT để cập nhật thông tin người dùng
router.put('/users', verifyToken, validate(userSchema.update), userController.updateUser);

// Routes khác cần xác thực
router.get('/users', verifyToken, checkRole(['Admin']), userController.getAllUsers);
router.get('/users/:id', verifyToken, userController.getUserById);
router.delete('/users/:id', verifyToken, checkRole(['Admin']), userController.deleteUser);

// Route gán quyền
router.post('/users/assign-role', verifyToken, checkRole(['Admin']), userController.assignRole);

module.exports = router; 