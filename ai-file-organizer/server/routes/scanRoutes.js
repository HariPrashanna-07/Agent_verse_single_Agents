const express = require('express');
const router = express.Router();
const upload = require('../middlewares/upload');
const { scanFolder } = require('../controllers/scanController');

// POST /api/scan - Accepts multipart upload of folder files
router.post('/', upload.array('files', 100), scanFolder);

module.exports = router;
