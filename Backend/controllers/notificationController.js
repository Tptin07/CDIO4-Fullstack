// Backend/controllers/notificationController.js
import * as notificationModel from '../models/notificationModel.js';

/**
 * GET /api/admin/notifications
 * Lấy tất cả thông báo (chỉ admin)
 */
export async function getAllNotifications(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const result = await notificationModel.getAllNotifications(limit, offset);

    res.json({
      success: true,
      data: result.notifications,
      pagination: {
        total: result.total,
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('❌ Error in getAllNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy danh sách thông báo',
      error: error.message,
    });
  }
}

/**
 * GET /api/admin/notifications/unread
 * Lấy thông báo chưa đọc
 */
export async function getUnreadNotifications(req, res) {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const result = await notificationModel.getUnreadNotifications(limit);

    res.json({
      success: true,
      data: result.notifications,
      unreadCount: result.unreadCount,
    });
  } catch (error) {
    console.error('❌ Error in getUnreadNotifications:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi lấy thông báo chưa đọc',
      error: error.message,
    });
  }
}

/**
 * PUT /api/admin/notifications/:id/read
 * Đánh dấu thông báo là đã đọc
 */
export async function markAsRead(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID thông báo không hợp lệ',
      });
    }

    const notification = await notificationModel.markAsRead(parseInt(id));

    res.json({
      success: true,
      message: 'Đã đánh dấu thông báo là đã đọc',
      data: notification,
    });
  } catch (error) {
    console.error('❌ Error in markAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu thông báo',
      error: error.message,
    });
  }
}

/**
 * PUT /api/admin/notifications/read-all
 * Đánh dấu tất cả thông báo là đã đọc
 */
export async function markAllAsRead(req, res) {
  try {
    await notificationModel.markAllAsRead();

    res.json({
      success: true,
      message: 'Đã đánh dấu tất cả thông báo là đã đọc',
    });
  } catch (error) {
    console.error('❌ Error in markAllAsRead:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi đánh dấu thông báo',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/admin/notifications/:id
 * Xóa thông báo
 */
export async function deleteNotification(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'ID thông báo không hợp lệ',
      });
    }

    await notificationModel.deleteNotification(parseInt(id));

    res.json({
      success: true,
      message: 'Đã xóa thông báo',
    });
  } catch (error) {
    console.error('❌ Error in deleteNotification:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thông báo',
      error: error.message,
    });
  }
}

/**
 * DELETE /api/admin/notifications/read-all
 * Xóa tất cả thông báo đã đọc
 */
export async function deleteAllRead(req, res) {
  try {
    await notificationModel.deleteAllRead();

    res.json({
      success: true,
      message: 'Đã xóa tất cả thông báo đã đọc',
    });
  } catch (error) {
    console.error('❌ Error in deleteAllRead:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi khi xóa thông báo',
      error: error.message,
    });
  }
}

