// src/utils/ApiResponse.js
// Đảm bảo 100% response trả về cùng cấu trúc JSON
class ApiResponse {
  static success(res, data, message = 'Thành công', statusCode = 200) {
    return res.status(statusCode).json({ success: true, message, data });
  }
  static created(res, data, message = 'Tạo mới thành công') {
    return this.success(res, data, message, 201);
  }
  // Dùng khi trả về danh sách có phân trang
  static paginated(res, data, pagination, message = 'Thành công') {
    return res.status(200).json({
      success: true, message, data,
      pagination, // { total, page, limit, totalPages }
    });
  }
}
module.exports = ApiResponse;