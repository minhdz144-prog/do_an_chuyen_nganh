// src/middlewares/responseHandler.js

/**
 * Middleware để chuẩn hóa API Response
 * 
 * Cách sử dụng trong Controller:
 * thay vì res.json({ ... })
 * dùng: res.success(data, "Message") hoặc res.error(statusCode, "Error message")
 */
const responseHandler = (req, res, next) => {
  // Thêm method success
  res.success = (data = null, message = 'Thành công', statusCode = 200) => {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  };

  // Thêm method error
  res.error = (statusCode = 500, message = 'Lỗi hệ thống', errorDetails = null) => {
    return res.status(statusCode).json({
      success: false,
      message,
      error: errorDetails
    });
  };

  next();
};

module.exports = responseHandler;
