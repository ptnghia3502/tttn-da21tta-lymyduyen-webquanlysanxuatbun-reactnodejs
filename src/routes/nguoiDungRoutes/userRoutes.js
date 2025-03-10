const express = require('express');
const router = express.Router();
const userController = require('../../controller/nguoiDungController/userController');

// Định nghĩa các routes
router.post('/users/login', userController.login);
router.post('/users/register', userController.register);
router.post('/users/logout', userController.logout);
router.get('/users', userController.getAllUsers);
router.get('/users/:id', userController.getUserById);
router.put('/users/:id', userController.updateUser);
router.delete('/users/:id', userController.deleteUser);
router.post('/users/assign-role', userController.assignRole);
router.put('/users/change-password', userController.changePassword);

module.exports = router; 