import * as chatModel from "../models/chatModel.js";
import { query } from "../config/database.js";

/**
 * POST /api/chat/send
 * Gửi tin nhắn từ user hoặc nhân viên
 */
export async function sendMessage(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userId = req.user.userId;
    const userRole = req.user.role || "customer";
    const { message, conversation_id, receiver_id, message_type = "text" } =
      req.body;

    // Validation
    if (!message || message.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "Nội dung tin nhắn không được để trống",
      });
    }

    let conversationId = conversation_id;
    let receiverId = receiver_id;
    let receiverRole = null;

    // Nếu là customer gửi tin nhắn
    if (userRole === "customer") {
      // Tìm nhân viên đang online hoặc gán cho nhân viên đầu tiên
      if (!receiverId) {
        const employees = await query(
          `SELECT id, role FROM users 
           WHERE role IN ('employee', 'admin') AND status = 'active' 
           ORDER BY id ASC LIMIT 1`
        );
        if (employees.length > 0) {
          receiverId = employees[0].id;
          receiverRole = employees[0].role;
        } else {
          return res.status(404).json({
            success: false,
            message: "Hiện không có nhân viên nào online",
          });
        }
      } else {
        const receiver = await query(
          `SELECT role FROM users WHERE id = ? AND role IN ('employee', 'admin')`,
          [receiverId]
        );
        if (receiver.length === 0) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy nhân viên",
          });
        }
        receiverRole = receiver[0].role;
      }

      // Tạo hoặc lấy conversation
      const conversation = await chatModel.getOrCreateConversation(
        userId,
        receiverId
      );
      conversationId = conversation.conversation_id;
    } else {
      // Nếu là employee/admin gửi tin nhắn
      if (!receiverId) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng chỉ định người nhận (receiver_id)",
        });
      }

      const receiver = await query(
        `SELECT role FROM users WHERE id = ?`,
        [receiverId]
      );
      if (receiver.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy người nhận",
        });
      }
      receiverRole = receiver[0].role;

      // Tìm conversation hoặc tạo mới
      const conversation = await chatModel.getOrCreateConversation(
        receiverId,
        userId
      );
      conversationId = conversation.conversation_id;
    }

    // Gửi tin nhắn
    const newMessage = await chatModel.sendMessage({
      conversationId,
      senderId: userId,
      senderRole: userRole,
      receiverId,
      receiverRole,
      message: message.trim(),
      messageType: message_type,
    });

    res.json({
      success: true,
      message: "Đã gửi tin nhắn thành công",
      data: newMessage,
    });
  } catch (error) {
    console.error("❌ Error in sendMessage:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi gửi tin nhắn",
    });
  }
}

/**
 * GET /api/chat/conversations
 * Lấy danh sách conversations - CHỈ DÀNH CHO NHÂN VIÊN/ADMIN
 */
export async function getConversations(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userRole = req.user.role || "customer";
    
    // Chỉ employee và admin mới được xem conversations
    if (userRole === "customer") {
      return res.status(403).json({
        success: false,
        message: "Chỉ nhân viên mới có quyền xem danh sách cuộc trò chuyện",
      });
    }

    const { limit = 50, offset = 0 } = req.query;

    // employee hoặc admin
    const conversations = await chatModel.getAllConversations(
      parseInt(limit),
      parseInt(offset)
    );

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    console.error("❌ Error in getConversations:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy danh sách cuộc trò chuyện",
    });
  }
}

/**
 * GET /api/chat/messages/:conversation_id
 * Lấy danh sách tin nhắn trong một conversation - CHỈ DÀNH CHO NHÂN VIÊN/ADMIN
 */
export async function getMessages(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userRole = req.user.role || "customer";
    
    // Chỉ employee và admin mới được xem tin nhắn
    if (userRole === "customer") {
      return res.status(403).json({
        success: false,
        message: "Chỉ nhân viên mới có quyền xem tin nhắn",
      });
    }

    const userId = req.user.userId;
    const { conversation_id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Kiểm tra conversation có tồn tại không
    const conversation = await chatModel.getConversationById(conversation_id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc trò chuyện",
      });
    }

    // Lấy tin nhắn
    const messages = await chatModel.getMessages(
      conversation_id,
      parseInt(limit),
      parseInt(offset)
    );

    // Đánh dấu đã đọc khi nhân viên xem tin nhắn
    await chatModel.markMessagesAsRead(conversation_id, userId);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error) {
    console.error("❌ Error in getMessages:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy tin nhắn",
    });
  }
}

/**
 * PUT /api/chat/messages/read/:conversation_id
 * Đánh dấu tin nhắn đã đọc - CHỈ DÀNH CHO NHÂN VIÊN/ADMIN
 */
export async function markAsRead(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userRole = req.user.role || "customer";
    
    // Chỉ employee và admin mới được đánh dấu đã đọc
    if (userRole === "customer") {
      return res.status(403).json({
        success: false,
        message: "Chỉ nhân viên mới có quyền thực hiện thao tác này",
      });
    }

    const userId = req.user.userId;
    const { conversation_id } = req.params;

    // Kiểm tra conversation có tồn tại không
    const conversation = await chatModel.getConversationById(conversation_id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc trò chuyện",
      });
    }

    await chatModel.markMessagesAsRead(conversation_id, userId);

    res.json({
      success: true,
      message: "Đã đánh dấu tin nhắn đã đọc",
    });
  } catch (error) {
    console.error("❌ Error in markAsRead:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi đánh dấu tin nhắn đã đọc",
    });
  }
}

/**
 * GET /api/chat/unread-count
 * Lấy số lượng tin nhắn chưa đọc
 */
export async function getUnreadCount(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userId = req.user.userId;
    const result = await chatModel.getUnreadCount(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in getUnreadCount:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy số lượng tin nhắn chưa đọc",
    });
  }
}

/**
 * GET /api/chat/conversation/:conversation_id
 * Lấy thông tin một conversation - CHỈ DÀNH CHO NHÂN VIÊN/ADMIN
 */
export async function getConversation(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userRole = req.user.role || "customer";
    
    // Chỉ employee và admin mới được xem conversation
    if (userRole === "customer") {
      return res.status(403).json({
        success: false,
        message: "Chỉ nhân viên mới có quyền xem thông tin cuộc trò chuyện",
      });
    }

    const { conversation_id } = req.params;

    const conversation = await chatModel.getConversationById(conversation_id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc trò chuyện",
      });
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("❌ Error in getConversation:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy thông tin cuộc trò chuyện",
    });
  }
}

