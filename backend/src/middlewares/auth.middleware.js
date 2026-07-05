// src/middlewares/auth.middleware.js
const { verifyToken } = require('../services/token.service');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(ApiError.unauthorized('Token xác thực không tồn tại'));
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    const currentUser = await User.findById(decoded.id);
    if (!currentUser || !currentUser.isActive) {
      return next(ApiError.unauthorized('Tài khoản không tồn tại hoặc đã bị vô hiệu hóa'));
    }
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') return next(ApiError.unauthorized('Token không hợp lệ'));
    if (error.name === 'TokenExpiredError') return next(ApiError.unauthorized('Phiên đăng nhập hết hạn, vui lòng đăng nhập lại'));
    next(error);
  }
};
module.exports = { protect };