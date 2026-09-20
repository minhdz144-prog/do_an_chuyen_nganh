// src/app.js
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth.routes');
const jobRoutes = require('./routes/job.routes');
const applicationRoutes = require('./routes/application.routes');
const companyRoutes = require('./routes/company.routes');
const userRoutes = require('./routes/user.routes');       // ★ Gap D: user profile self-update
const adminRoutes = require('./routes/admin.routes');     // ★ Gap E: admin management
const uploadRoutes = require('./routes/upload.routes');   // ★ F.3: file upload
const notificationRoutes = require('./routes/notification.routes');
const path = require('path');
const errorMiddleware = require('./middlewares/error.middleware');

const app = express();
// ─── Security ───────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));
// Rate limiting: 100 req / 15 phút / IP (chống brute-force)
// Rate limiting: trong dev cho phép nhiều hơn để tránh bị chặn khi test
// ★ Production nên giữ max: 100 để chống brute-force
const isDev = process.env.NODE_ENV === 'development';
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 2000 : 200,  // Dev: 2000 req, Production: 200 req / 15 phút
  standardHeaders: true,
  skip: (req) => isDev && (req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1'),
  message: { success: false, message: 'Quá nhiều yêu cầu, thử lại sau 15 phút' }
});
app.use('/api', apiLimiter);
// ─── Body Parser ─────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
// ─── Standardize API Responses ──────────────────────
app.use(require('./middlewares/responseHandler'));
// ─── Routes ─────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api/users', userRoutes);     // ★ Mới thêm: /api/users/me
app.use('/api/admin', adminRoutes);    // ★ Mới thêm: /api/admin/*
app.use('/api/uploads', uploadRoutes); // ★ F.3: file upload
app.use('/api/stats', require('./routes/stats.routes')); // ★ B.4: Public stats
app.use('/api/notifications', notificationRoutes);
app.use('/api/ai', require('./routes/ai.routes'));      // ★ Gen-AI: Interview Questions + Cover Letter
// ★ F.3: Serve uploaded files as static assets
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// ─── Health Check ────────────────────────────────────
app.get('/api/health', (_, res) =>
  res.json({ success: true, status: 'OK', timestamp: new Date() })
);
// ─── 404 & Global Error Handler (luôn đặt CUỐI CÙNG) ─
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: `Route không tồn tại: ${req.method} ${req.originalUrl}` });
});
app.use(errorMiddleware);

module.exports = app;