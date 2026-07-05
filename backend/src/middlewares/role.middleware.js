// src/middlewares/role.middleware.js
const ApiError = require('../utils/ApiError');

const restrictTo = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized('Chưa đăng nhập'));
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden(`Vai trò '${req.user.role}' không có quyền. Yêu cầu: [${allowedRoles.join(', ')}]`));
  }
  next();
};
module.exports = { restrictTo };