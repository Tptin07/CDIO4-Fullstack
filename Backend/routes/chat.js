import express from "express";
import {
  sendMessage,
  getConversations,
  getMessages,
  markAsRead,
  getUnreadCount,
  getConversation,
} from "../controllers/chatController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(authenticateToken);

// POST /api/chat/send - Gửi tin nhắn
router.post("/send", sendMessage);

// GET /api/chat/conversations - Lấy danh sách conversations
router.get("/conversations", getConversations);

// GET /api/chat/conversation/:conversation_id - Lấy thông tin một conversation
router.get("/conversation/:conversation_id", getConversation);

// GET /api/chat/messages/:conversation_id - Lấy danh sách tin nhắn
router.get("/messages/:conversation_id", getMessages);

// PUT /api/chat/messages/read/:conversation_id - Đánh dấu tin nhắn đã đọc
router.put("/messages/read/:conversation_id", markAsRead);

// GET /api/chat/unread-count - Lấy số lượng tin nhắn chưa đọc
router.get("/unread-count", getUnreadCount);

export default router;

