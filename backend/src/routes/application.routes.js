// src/routes/application.routes.js
const express = require('express');
const { updateApplicationStatus, getMyApplications } = require('../controllers/application.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const router = express.Router();

router.use(protect); // Yêu cầu đăng nhập cho tất cả route bên dưới
router.get('/my', restrictTo('candidate'), getMyApplications);
router.patch('/:id/status', restrictTo('employer', 'admin'), updateApplicationStatus);

module.exports = router;