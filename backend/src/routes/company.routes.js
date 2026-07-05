// src/routes/company.routes.js
const express = require('express');
const { createCompany, getCompanyById, updateCompany } = require('../controllers/company.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const router = express.Router();

router.post('/', protect, restrictTo('employer'), createCompany);
router.get('/:id', getCompanyById);
router.put('/:id', protect, restrictTo('employer', 'admin'), updateCompany);

module.exports = router;
