// src/routes/admin.routes.js
const express = require('express');
const { getUsers, updateUserStatus, getStats } = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const router = express.Router();

// ★ Áp dụng middleware protect + restrictTo('admin') cho toàn bộ /api/admin/*
router.use(protect, restrictTo('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/stats', getStats);

module.exports = router;
