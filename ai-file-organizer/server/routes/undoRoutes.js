const express = require('express');
const router = express.Router();
const { undoScan } = require('../controllers/undoController');

router.post('/', undoScan);

module.exports = router;
