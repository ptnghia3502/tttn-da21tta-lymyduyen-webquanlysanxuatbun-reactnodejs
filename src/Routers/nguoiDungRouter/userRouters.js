const express = require('express');
const userController = require('../../controllers/nguoiDungController/userController');

const router = express.Router();

// Mount routes from userController
router.use('/users', userController);

module.exports = router; 