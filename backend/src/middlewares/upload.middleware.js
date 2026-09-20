// src/middlewares/upload.middleware.js
// ★ F.3: File upload middleware dùng multer
// Hai loại: resume (pdf/doc/docx ≤5MB) và logo (jpg/png ≤2MB)
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ★ Đảm bảo thư mục uploads tồn tại khi khởi tạo
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
['resumes', 'logos'].forEach(dir => {
  const fullPath = path.join(UPLOAD_DIR, dir);
  if (!fs.existsSync(fullPath)) fs.mkdirSync(fullPath, { recursive: true });
});

// Tạo tên file duy nhất: userId_timestamp.ext
const createStorage = (subDir) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(UPLOAD_DIR, subDir)),
  filename: (req, file, cb) => {
    const uniqueName = `${req.user._id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  },
});

// ★ Filter cho resume: chỉ PDF, DOC, DOCX
const resumeFileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file PDF, DOC, hoặc DOCX'), false);
  }
};

// ★ Filter cho logo: chỉ JPG, PNG, WEBP
const logoFileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file JPG, PNG, hoặc WEBP'), false);
  }
};

const uploadResume = multer({
  storage: createStorage('resumes'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: resumeFileFilter,
});

const uploadLogo = multer({
  storage: createStorage('logos'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: logoFileFilter,
});

module.exports = { uploadResume, uploadLogo };
