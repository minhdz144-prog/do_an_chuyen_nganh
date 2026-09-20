// src/routes/user.routes.js
const express = require('express');
const { updateMe, getMe, toggleSavedJob, getSavedJobs } = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập
router.use(protect);

router.get('/me', getMe);
router.put('/me', updateMe);
router.patch('/me', updateMe);

// ★ F.4: Saved/Bookmarked Jobs (candidate only)
router.post('/me/saved-jobs/:jobId', restrictTo('candidate'), toggleSavedJob);
router.get('/me/saved-jobs', restrictTo('candidate'), getSavedJobs);

module.exports = router;
