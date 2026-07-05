// src/controllers/auth.controller.js
const User = require('../models/User.model');
const { generateToken } = require('../services/token.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const sendAuthResponse = (res, user, statusCode, message) => {
  const token = generateToken({ id: user._id, role: user.role });
  const userData = user.toObject();
  delete userData.password;
  return res.status(statusCode).json({ success: true, message, token, data: { user: userData } });
};

const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (role === 'admin') return next(ApiError.forbidden('Không thể tự đăng ký tài khoản Admin'));
    if (await User.findOne({ email })) return next(ApiError.conflict('Email này đã được sử dụng'));
    const user = await User.create({ name, email, password, role: role || 'candidate' });
    sendAuthResponse(res, user, 201, 'Đăng ký thành công! Chào mừng bạn.');
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return next(ApiError.badRequest('Email và mật khẩu là bắt buộc'));
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) return next(ApiError.unauthorized('Email hoặc mật khẩu không chính xác'));
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(ApiError.unauthorized('Email hoặc mật khẩu không chính xác'));
    sendAuthResponse(res, user, 200, 'Đăng nhập thành công');
  } catch (error) { next(error); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('companyId', 'name logo location industry');
    ApiResponse.success(res, { user }, 'Lấy thông tin thành công');
  } catch (error) { next(error); }
};

const updateMe = async (req, res, next) => {
  try {
    const updates = { ...req.body };
    // Bỏ qua những field nhạy cảm
    delete updates.password;
    delete updates.role;
    delete updates.email;
    delete updates.isActive;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('companyId', 'name logo location industry');

    ApiResponse.success(res, { user }, 'Cập nhật hồ sơ thành công');
  } catch (error) { next(error); }
};

module.exports = { register, login, getMe, updateMe };