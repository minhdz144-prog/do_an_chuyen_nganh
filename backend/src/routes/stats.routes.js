const express = require('express');
const { getPublicStats, getCategoryStats } = require('../controllers/stats.controller');
const router = express.Router();

router.get('/public', getPublicStats);
router.get('/categories', getCategoryStats);

module.exports = router;
