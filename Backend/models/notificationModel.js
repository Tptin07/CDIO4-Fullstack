// Backend/models/notificationModel.js
import { query } from '../config/database.js';

/**
 * Tạo thông báo mới
 */
export async function createNotification(notificationData) {
  const {
    type = 'system',
    title,
    message,
    related_id = null,
    related_type = null,
  } = notificationData;

  const result = await query(
    `INSERT INTO notifications (type, title, message, related_id, related_type)
     VALUES (?, ?, ?, ?, ?)`,
    [type, title, message, related_id, related_type]
  );

  const notifications = await query(
    `SELECT * FROM notifications WHERE id = ?`,
    [result.insertId]
  );

  return notifications[0];
}

/**
 * Lấy tất cả thông báo (cho admin)
 */
export async function getAllNotifications(limit = 50, offset = 0) {
  const notifications = await query(
    `SELECT * FROM notifications 
     ORDER BY created_at DESC 
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  const totalResult = await query(
    `SELECT COUNT(*) as total FROM notifications`
  );

  return {
    notifications,
    total: totalResult[0]?.total || 0,
  };
}

/**
 * Lấy thông báo chưa đọc
 */
export async function getUnreadNotifications(limit = 50) {
  const notifications = await query(
    `SELECT * FROM notifications 
     WHERE is_read = FALSE 
     ORDER BY created_at DESC 
     LIMIT ?`,
    [limit]
  );

  const totalResult = await query(
    `SELECT COUNT(*) as total FROM notifications WHERE is_read = FALSE`
  );

  return {
    notifications,
    unreadCount: totalResult[0]?.total || 0,
  };
}

/**
 * Đánh dấu thông báo là đã đọc
 */
export async function markAsRead(notificationId) {
  await query(
    `UPDATE notifications SET is_read = TRUE WHERE id = ?`,
    [notificationId]
  );

  const notifications = await query(
    `SELECT * FROM notifications WHERE id = ?`,
    [notificationId]
  );

  return notifications[0];
}

/**
 * Đánh dấu tất cả thông báo là đã đọc
 */
export async function markAllAsRead() {
  await query(
    `UPDATE notifications SET is_read = TRUE WHERE is_read = FALSE`
  );

  return { success: true };
}

/**
 * Xóa thông báo
 */
export async function deleteNotification(notificationId) {
  await query(
    `DELETE FROM notifications WHERE id = ?`,
    [notificationId]
  );

  return { success: true };
}

/**
 * Xóa tất cả thông báo đã đọc
 */
export async function deleteAllRead() {
  await query(
    `DELETE FROM notifications WHERE is_read = TRUE`
  );

  return { success: true };
}

