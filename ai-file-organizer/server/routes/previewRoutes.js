const express = require('express');
const router = express.Router();
const { generatePreview } = require('../controllers/previewController');

// POST /api/preview - Generate AI organization plan & duplicate check
router.post('/', generatePreview);

module.exports = router;
