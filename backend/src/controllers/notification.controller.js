const Notification = require('../models/Notification.model');
const ApiResponse = require('../utils/ApiResponse');

exports.getNotifications = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 20;
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
    
    // Đếm số thông báo chưa đọc
    const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

    ApiResponse.success(res, { notifications, unreadCount });
  } catch (error) {
    next(error);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo' });
    }
    ApiResponse.success(res, { notification });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );
    ApiResponse.success(res, null, 'Đã đánh dấu tất cả là đã đọc');
  } catch (error) {
    next(error);
  }
};
