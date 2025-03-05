const express = require('express');
const userController = require('../../Controllers/nguoiDungController/userController');

const router = express.Router();

// Mount routes
router.use('/users', userController);  // <-- Đảm bảo đúng path

module.exports = router; 