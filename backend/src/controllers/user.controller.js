// src/controllers/user.controller.js
// ★ Quyết định kiến trúc: Tách endpoint cập nhật profile ra /api/users/me thay vì PUT /auth/me
// để giữ auth routes thuần túy cho auth logic, và user routes cho profile logic.
const User = require('../models/User.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

/**
 * PUT /api/users/me — Cập nhật profile bản thân (mọi role)
 * Whitelist nghiêm ngặt: không cho sửa email, role, password qua endpoint này
 */
const updateMe = async (req, res, next) => {
  try {
    const { name, phone, avatar, candidateProfile } = req.body;

    // ★ Xây object cập nhật có chọn lọc thay vì spread toàn bộ req.body (bảo mật)
    const updatePayload = {};
    if (name !== undefined) updatePayload.name = name;
    if (phone !== undefined) updatePayload.phone = phone;
    if (avatar !== undefined) updatePayload.avatar = avatar;

    // Chỉ cho phép candidate cập nhật candidateProfile
    if (req.user.role === 'candidate' && candidateProfile) {
      const allowedProfileFields = ['skills', 'yearsOfExperience', 'location', 'resumeUrl', 'bio', 'educationLevel'];
      const profileUpdate = {};
      allowedProfileFields.forEach(field => {
        if (candidateProfile[field] !== undefined) {
          profileUpdate[`candidateProfile.${field}`] = candidateProfile[field];
        }
      });
      Object.assign(updatePayload, profileUpdate);
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updatePayload },
      { new: true, runValidators: true }
    ).populate('companyId', 'name logo location industry');

    if (!user) return next(ApiError.notFound('Không tìm thấy người dùng'));

    ApiResponse.success(res, { user }, 'Cập nhật thông tin thành công');
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/me — Lấy thông tin profile bản thân
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('companyId', 'name logo location industry');
    ApiResponse.success(res, { user }, 'Lấy thông tin thành công');
  } catch (error) {
    next(error);
  }
};

module.exports = { updateMe, getMe };
