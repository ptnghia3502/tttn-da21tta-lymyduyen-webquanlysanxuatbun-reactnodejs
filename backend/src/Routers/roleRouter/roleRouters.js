const express = require('express');
const roleController = require('../../Controllers/roleController/roleController');

const router = express.Router();

// Mount routes
router.use('/roles', roleController);  // Sửa path thành 'roles'

module.exports = router; 