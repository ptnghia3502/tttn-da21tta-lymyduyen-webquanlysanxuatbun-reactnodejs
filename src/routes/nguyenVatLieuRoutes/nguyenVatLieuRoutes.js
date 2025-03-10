const express = require('express');
const nguyenVatLieuController = require('../../controller/nguyenVatLieuController/nguyenVatLieuController');

const router = express.Router();

router.use('/nguyen-vat-lieu', nguyenVatLieuController);

module.exports = router;
