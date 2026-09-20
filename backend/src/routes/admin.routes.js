// src/routes/admin.routes.js
const express = require('express');
const { getUsers, updateUserStatus, getStats, getCompanies, verifyCompany } = require('../controllers/admin.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const router = express.Router();

// ★ Áp dụng middleware protect + restrictTo('admin') cho toàn bộ /api/admin/*
router.use(protect, restrictTo('admin'));

router.get('/users', getUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/stats', getStats);
router.get('/companies', getCompanies);                  // ★ F.2: Danh sách công ty
router.patch('/companies/:id/verify', verifyCompany);    // ★ F.2: Duyệt/hủy xác minh

module.exports = router;
