// src/routes/job.routes.js
const express = require('express');
const { getAllJobs, getJobById, createJob, updateJob, deleteJob, getRecommendedJobs, getMatchPreview, aiSearchJobs } = require('../controllers/job.controller');
const { applyToJob, getJobApplications } = require('../controllers/application.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const validate = require('../middlewares/validate.middleware');
const { createJobSchema, updateJobSchema } = require('../validators/job.validator');
const router = express.Router();

// Public route cho Live Matching Hero (preview)
router.get('/match-preview', getMatchPreview);

// Public route cho AI Search (tìm kiếm theo danh sách kỹ năng)
router.get('/ai-search', aiSearchJobs);

// Route Gợi ý việc làm (Phải nằm trên route /:id)
router.get('/recommended', protect, restrictTo('candidate'), getRecommendedJobs);

router.get('/', getAllJobs);
router.get('/:id', getJobById);
router.post('/', protect, restrictTo('employer'), validate(createJobSchema), createJob);
router.put('/:id', protect, restrictTo('employer'), validate(updateJobSchema), updateJob);
router.patch('/:id', protect, restrictTo('employer'), validate(updateJobSchema), updateJob);
router.delete('/:id', protect, restrictTo('employer', 'admin'), deleteJob);

router.post('/:jobId/apply', protect, restrictTo('candidate'), applyToJob);
router.get('/:jobId/applications', protect, restrictTo('employer', 'admin'), getJobApplications);

module.exports = router;