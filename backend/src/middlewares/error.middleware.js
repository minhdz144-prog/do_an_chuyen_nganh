// src/middlewares/error.middleware.js
const ApiError = require('../utils/ApiError');

const errorMiddleware = (err, req, res, next) => {
  let error = { ...err, message: err.message };
  error.statusCode = err.statusCode || 500;

  if (err.name === 'CastError') error = ApiError.badRequest(`ID không hợp lệ: ${err.value}`);
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = ApiError.conflict(`'${err.keyValue[field]}' đã tồn tại cho trường '${field}'`);
  }
  if (err.name === 'ValidationError') {
    const msgs = Object.values(err.errors).map((e) => e.message);
    error = ApiError.badRequest(msgs.join('. '));
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || 'Lỗi máy chủ nội bộ',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
module.exports = errorMiddleware;