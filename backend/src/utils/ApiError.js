// src/utils/ApiError.js
// Custom Error phân biệt lỗi nghiệp vụ vs lỗi hệ thống
class ApiError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode  = statusCode;
    this.isOperational = true; // ★ Flag: lỗi có thể xử lý, không phải bug
    Error.captureStackTrace(this, this.constructor);
  }
  static badRequest(msg)  { return new ApiError(msg, 400); }
  static unauthorized(msg = 'Vui lòng đăng nhập') { return new ApiError(msg, 401); }
  static forbidden(msg = 'Không có quyền truy cập') { return new ApiError(msg, 403); }
  static notFound(msg = 'Không tìm thấy')  { return new ApiError(msg, 404); }
  static conflict(msg)    { return new ApiError(msg, 409); }
}
module.exports = ApiError;