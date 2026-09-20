// src/controllers/auth.controller.js
const crypto = require('crypto');
const User = require('../models/User.model');
const { generateToken } = require('../services/token.service');
const { sendResetPasswordEmail } = require('../services/email.service');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');

const sendAuthResponse = (res, user, statusCode, message, rememberMe = false) => {
  const expiresIn = rememberMe ? '30d' : '1d';
  const token = generateToken({ id: user._id, role: user.role }, expiresIn);
  const userData = user.toObject();
  delete userData.password;
  return res.status(statusCode).json({ success: true, message, token, rememberMe, data: { user: userData } });
};

// ─── Register ─────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (role === 'admin') return next(ApiError.forbidden('Không thể tự đăng ký tài khoản Admin'));
    if (!password || password.length < 6) return next(ApiError.badRequest('Mật khẩu phải có ít nhất 6 ký tự'));
    if (await User.findOne({ email })) return next(ApiError.conflict('Email này đã được sử dụng'));
    const user = await User.create({ name, email, password, role: role || 'candidate', authProvider: 'local' });
    sendAuthResponse(res, user, 201, 'Đăng ký thành công! Chào mừng bạn.');
  } catch (error) { next(error); }
};

// ─── Login ────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) return next(ApiError.badRequest('Email và mật khẩu là bắt buộc'));
    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) return next(ApiError.unauthorized('Email hoặc mật khẩu không chính xác'));
    if (user.authProvider === 'google' && !user.password) {
      return next(ApiError.badRequest('Tài khoản này đăng nhập bằng Google. Vui lòng sử dụng nút "Đăng nhập bằng Google".'));
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return next(ApiError.unauthorized('Email hoặc mật khẩu không chính xác'));
    sendAuthResponse(res, user, 200, 'Đăng nhập thành công', !!rememberMe);
  } catch (error) { next(error); }
};

// ─── Google Login ─────────────────────────────────
const googleLogin = async (req, res, next) => {
  try {
    const { credential, role } = req.body;
    if (!credential) return next(ApiError.badRequest('Google credential là bắt buộc'));
    
    // Verify Google ID token via Google's tokeninfo endpoint
    const response = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!response.ok) return next(ApiError.unauthorized('Google token không hợp lệ'));
    
    const payload = await response.json();
    const { sub: googleId, email, name, picture } = payload;
    
    // Verify audience matches our client ID
    if (process.env.GOOGLE_CLIENT_ID && payload.aud !== process.env.GOOGLE_CLIENT_ID) {
      return next(ApiError.unauthorized('Google token không dành cho ứng dụng này'));
    }

    // Find existing user or create new one
    let user = await User.findOne({ $or: [{ googleId }, { email }] });
    
    if (user) {
      // Link Google ID if existing user logged in via email before
      if (!user.googleId) {
        user.googleId = googleId;
        user.authProvider = 'google';
        if (picture && !user.avatar) user.avatar = picture;
        await user.save();
      }
    } else {
      // Create new user
      user = await User.create({
        name,
        email,
        googleId,
        authProvider: 'google',
        avatar: picture,
        role: role || 'candidate',
      });
    }

    if (!user.isActive) return next(ApiError.unauthorized('Tài khoản đã bị vô hiệu hóa'));

    sendAuthResponse(res, user, 200, 'Đăng nhập bằng Google thành công');
  } catch (error) { next(error); }
};

// ─── Forgot Password ──────────────────────────────
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(ApiError.badRequest('Email là bắt buộc'));

    const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordExpires');
    if (!user) {
      // Không tiết lộ email có tồn tại hay không (bảo mật)
      return ApiResponse.success(res, null, 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã OTP.');
    }

    if (user.authProvider === 'google' && !user.password) {
      return next(ApiError.badRequest('Tài khoản này đăng nhập bằng Google, không cần mật khẩu.'));
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút
    await user.save({ validateBeforeSave: false });

    // Fire-and-forget gửi OTP
    sendResetPasswordEmail(email, otp);

    ApiResponse.success(res, null, 'Nếu email tồn tại trong hệ thống, bạn sẽ nhận được mã OTP.');
  } catch (error) { next(error); }
};

// ─── Reset Password ───────────────────────────────
const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return next(ApiError.badRequest('Email, mã OTP và mật khẩu mới là bắt buộc'));
    if (newPassword.length < 6) return next(ApiError.badRequest('Mật khẩu mới phải có ít nhất 6 ký tự'));

    const user = await User.findOne({ email }).select('+resetPasswordOTP +resetPasswordExpires +password');
    if (!user) return next(ApiError.badRequest('Mã OTP không hợp lệ hoặc đã hết hạn'));

    // Check OTP
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp) {
      return next(ApiError.badRequest('Mã OTP không chính xác'));
    }
    if (!user.resetPasswordExpires || user.resetPasswordExpires < new Date()) {
      return next(ApiError.badRequest('Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới.'));
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    ApiResponse.success(res, null, 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập với mật khẩu mới.');
  } catch (error) { next(error); }
};

// ─── Get Me ───────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('companyId', 'name logo location industry');
    ApiResponse.success(res, { user }, 'Lấy thông tin thành công');
  } catch (error) { next(error); }
};

// ─── Update Me ────────────────────────────────────
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

module.exports = { register, login, googleLogin, forgotPassword, resetPassword, getMe, updateMe };