import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

/**
 * Middleware xác thực JWT token
 */
export async function authenticateToken(req, res, next) {
  // Lấy token từ header
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Không có token xác thực. Vui lòng đăng nhập.'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'your-secret-key-change-in-production'
    );

    // Kiểm tra user có tồn tại và không bị khóa
    const users = await query(
      'SELECT id, email, role, status FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (!users || users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại. Vui lòng đăng nhập lại.'
      });
    }

    const user = users[0];

    // Kiểm tra tài khoản có bị khóa không
    if (user.status === 'banned') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.'
      });
    }

    // Kiểm tra tài khoản có bị vô hiệu hóa không
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.'
      });
    }

    // Lưu thông tin user vào request
    req.user = {
      ...decoded,
      status: user.status
    };
    next();
  } catch (error) {
    console.error('❌ Auth middleware error:', error.name, error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn. Vui lòng đăng nhập lại.',
        error: error.message,
        errorName: error.name
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Token không hợp lệ',
        error: error.message,
        errorName: error.name
      });
    }

    return res.status(403).json({
      success: false,
      message: 'Lỗi xác thực',
      error: error.message,
      errorName: error.name
    });
  }
}

