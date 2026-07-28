const express = require('express');
const router = express.Router();
const { organizeFiles } = require('../controllers/organizeController');

router.post('/', organizeFiles);

module.exports = router;
