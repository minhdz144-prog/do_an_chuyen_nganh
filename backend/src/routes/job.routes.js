// src/routes/job.routes.js
const express = require('express');
const { getAllJobs, getJobById, createJob, updateJob, deleteJob, getRecommendedJobs } = require('../controllers/job.controller');
const { applyToJob, getJobApplications } = require('../controllers/application.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const router = express.Router();

// Route Gợi ý việc làm (Phải nằm trên route /:id)
router.get('/recommended', protect, restrictTo('candidate'), getRecommendedJobs);

router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/', protect, restrictTo('employer'), createJob);
router.put('/:id', protect, restrictTo('employer'), updateJob);
router.delete('/:id', protect, restrictTo('employer', 'admin'), deleteJob);

router.post('/:jobId/apply', protect, restrictTo('candidate'), applyToJob);
router.get('/:jobId/applications', protect, restrictTo('employer', 'admin'), getJobApplications);

module.exports = router;