// src/routes/user.routes.js
const express = require('express');
const { updateMe, getMe } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập
router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMe);

module.exports = router;
