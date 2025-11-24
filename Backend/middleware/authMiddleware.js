import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

async function resolveUserFromToken(token) {
  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key-change-in-production"
  );

  const users = await query(
    "SELECT id, email, role, status, name FROM users WHERE id = ?",
    [decoded.userId]
  );

  if (!users || users.length === 0) {
    const error = new Error("USER_NOT_FOUND");
    error.clientMessage = "Người dùng không tồn tại. Vui lòng đăng nhập lại.";
    error.statusCode = 401;
    throw error;
  }

  const user = users[0];

  if (user.status === "banned") {
    const error = new Error("ACCOUNT_LOCKED");
    error.clientMessage =
      "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên.";
    error.statusCode = 403;
    throw error;
  }

  if (user.status === "inactive") {
    const error = new Error("ACCOUNT_INACTIVE");
    error.clientMessage =
      "Tài khoản của bạn đã bị vô hiệu hóa. Vui lòng liên hệ quản trị viên.";
    error.statusCode = 403;
    throw error;
  }

  return {
    ...decoded,
    status: user.status,
    role: user.role,
    email: user.email,
    name: user.name,
  };
}

function handleAuthError(error, res) {
  console.error("❌ Auth middleware error:", error.name, error.message);

  if (error.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      message: "Token đã hết hạn. Vui lòng đăng nhập lại.",
      error: error.message,
      errorName: error.name,
    });
  }

  if (error.name === "JsonWebTokenError") {
    return res.status(403).json({
      success: false,
      message: "Token không hợp lệ",
      error: error.message,
      errorName: error.name,
    });
  }

  if (error.clientMessage) {
    return res.status(error.statusCode || 403).json({
      success: false,
      message: error.clientMessage,
    });
  }

  return res.status(403).json({
    success: false,
    message: "Lỗi xác thực",
    error: error.message,
    errorName: error.name,
  });
}

/**
 * Middleware xác thực JWT token
 */
export async function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Không có token xác thực. Vui lòng đăng nhập.",
    });
  }

  try {
    req.user = await resolveUserFromToken(token);
    next();
  } catch (error) {
    handleAuthError(error, res);
  }
}

/**
 * Middleware xác thực tùy chọn - không yêu cầu token
 */
export async function optionalAuthenticate(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return next();
  }

  try {
    req.user = await resolveUserFromToken(token);
    next();
  } catch (error) {
    handleAuthError(error, res);
  }
}
