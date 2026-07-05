// src/controllers/admin.controller.js
// ★ Quyết định kiến trúc: Tách admin logic ra module riêng, không pha trộn với user/job controller
// để dễ kiểm tra quyền và mở rộng sau này (ví dụ: audit log của admin)
const User = require('../models/User.model');
const Job = require('../models/Job.model');
const Application = require('../models/Application.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * GET /api/admin/users — Lấy danh sách tất cả user (có phân trang và lọc theo role/isActive)
 */
const getUsers = async (req, res, next) => {
  try {
    const { role, isActive, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);

    ApiResponse.paginated(
      res,
      { users },
      { total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) }
    );
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/users/:id/status — Khóa/Mở tài khoản user
 * body: { isActive: boolean }
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;
    if (typeof isActive !== 'boolean') return next(ApiError.badRequest('isActive phải là boolean'));

    // Không cho phép tự khóa bản thân
    if (req.params.id === req.user._id.toString()) {
      return next(ApiError.badRequest('Không thể tự khóa tài khoản của mình'));
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) return next(ApiError.notFound('Không tìm thấy người dùng'));

    const action = isActive ? 'mở khóa' : 'khóa';
    ApiResponse.success(res, { user }, `Đã ${action} tài khoản thành công`);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/stats — Thống kê tổng quan hệ thống
 */
const getStats = async (req, res, next) => {
  try {
    // Chạy song song tất cả các lệnh đếm để tối ưu hiệu suất
    const [
      totalCandidates,
      totalEmployers,
      totalAdmins,
      activeJobs,
      draftJobs,
      closedJobs,
      appliedApps,
      reviewingApps,
      interviewApps,
      offeredApps,
      rejectedApps,
    ] = await Promise.all([
      User.countDocuments({ role: 'candidate' }),
      User.countDocuments({ role: 'employer' }),
      User.countDocuments({ role: 'admin' }),
      Job.countDocuments({ status: 'active' }),
      Job.countDocuments({ status: 'draft' }),
      Job.countDocuments({ status: 'closed' }),
      Application.countDocuments({ status: 'applied' }),
      Application.countDocuments({ status: 'reviewing' }),
      Application.countDocuments({ status: 'interview' }),
      Application.countDocuments({ status: 'offered' }),
      Application.countDocuments({ status: 'rejected' }),
    ]);

    const stats = {
      users: { candidates: totalCandidates, employers: totalEmployers, admins: totalAdmins },
      jobs: { active: activeJobs, draft: draftJobs, closed: closedJobs },
      applications: {
        applied: appliedApps, reviewing: reviewingApps, interview: interviewApps,
        offered: offeredApps, rejected: rejectedApps,
      },
    };

    ApiResponse.success(res, { stats }, 'Lấy thống kê thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = { getUsers, updateUserStatus, getStats };
