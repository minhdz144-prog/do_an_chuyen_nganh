// src/routes/upload.routes.js
// ★ F.3: Routes cho upload file (resume, logo)
const express = require('express');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/role.middleware');
const { uploadResume, uploadLogo } = require('../middlewares/upload.middleware');
const ApiResponse = require('../utils/ApiResponse');
const router = express.Router();

// Tất cả routes upload đều yêu cầu đăng nhập
router.use(protect);

/**
 * POST /api/uploads/resume — Upload CV/Resume (candidate only)
 * Trả về URL tương đối để lưu vào DB
 */
const { extractSkillsFromPDF, extractSkillsFromDocx } = require('../utils/cvExtractor');
const fs = require('fs');

router.post('/resume', restrictTo('candidate'), (req, res, next) => {
  uploadResume.single('resume')(req, res, async (err) => {
    if (err) {
      // ★ Xử lý lỗi multer (file quá lớn, sai định dạng)
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'File quá lớn (tối đa 5MB)' : err.message;
      return res.status(400).json({ success: false, message });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn file CV' });

    let extractedSkills = [];
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      if (req.file.mimetype === 'application/pdf') {
        extractedSkills = await extractSkillsFromPDF(fileBuffer);
      } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || req.file.mimetype === 'application/msword') {
        extractedSkills = await extractSkillsFromDocx(fileBuffer);
      }
    } catch (parseError) {
      console.error('Error parsing CV for skills:', parseError);
    }

    const fileUrl = `/uploads/resumes/${req.file.filename}`;
    ApiResponse.success(res, { url: fileUrl, originalName: req.file.originalname, extractedSkills }, 'Upload CV thành công');
  });
});

/**
 * POST /api/uploads/logo — Upload logo công ty (employer only)
 */
router.post('/logo', restrictTo('employer'), (req, res, next) => {
  uploadLogo.single('logo')(req, res, (err) => {
    if (err) {
      const message = err.code === 'LIMIT_FILE_SIZE' ? 'File quá lớn (tối đa 2MB)' : err.message;
      return res.status(400).json({ success: false, message });
    }
    if (!req.file) return res.status(400).json({ success: false, message: 'Vui lòng chọn file ảnh logo' });

    const fileUrl = `/uploads/logos/${req.file.filename}`;
    ApiResponse.success(res, { url: fileUrl, originalName: req.file.originalname }, 'Upload logo thành công');
  });
});

module.exports = router;
