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

    // Ép kiểu từ chuỗi sang số nguyên (Integer) - Express query params luôn là string
    // CRITICAL: MySQL LIMIT và OFFSET phải là số nguyên, không được là undefined/null/string
    let limit = 50; // Default
    let offset = 0; // Default
    
    if (req.query.limit !== undefined && req.query.limit !== null) {
      const parsed = parseInt(req.query.limit, 10);
      if (!isNaN(parsed) && parsed > 0) {
        limit = parsed;
      }
    }
    
    if (req.query.offset !== undefined && req.query.offset !== null) {
      const parsed = parseInt(req.query.offset, 10);
      if (!isNaN(parsed) && parsed >= 0) {
        offset = parsed;
      }
    }
    
    // CRITICAL: Đảm bảo là số nguyên (Number), không phải string
    const validLimit = Number(limit);
    const validOffset = Number(offset);
    
    // Validate types trước khi truyền vào model
    if (typeof validLimit !== 'number' || isNaN(validLimit) || validLimit < 1) {
      console.error(`❌ Invalid limit: ${req.query.limit} -> ${validLimit}`);
      throw new Error(`Invalid limit parameter: ${req.query.limit}`);
    }
    if (typeof validOffset !== 'number' || isNaN(validOffset) || validOffset < 0) {
      console.error(`❌ Invalid offset: ${req.query.offset} -> ${validOffset}`);
      throw new Error(`Invalid offset parameter: ${req.query.offset}`);
    }

    // Debug log
    console.log(`🔍 getConversations - query params: limit=${req.query.limit}, offset=${req.query.offset}`);
    console.log(`🔍 getConversations - parsed: limit=${validLimit} (${typeof validLimit}), offset=${validOffset} (${typeof validOffset})`);

    // employee hoặc admin
    const conversations = await chatModel.getAllConversations(
      validLimit,
      validOffset
    );

    res.json({
      success: true,
      data: conversations || [],
    });
  } catch (error) {
    console.error("❌ Error in getConversations:", error);
    console.error("   Error details:", {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      stack: error.stack,
    });
    
    // Xử lý các lỗi cụ thể
    let statusCode = 500;
    let errorMessage = "Lỗi khi lấy danh sách cuộc trò chuyện";
    
    if (error.code === 'ER_NO_SUCH_TABLE') {
      statusCode = 500;
      errorMessage = "Bảng conversations chưa được tạo trong database. Vui lòng liên hệ quản trị viên.";
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
      statusCode = 503;
      errorMessage = "Không thể kết nối đến database. Vui lòng thử lại sau.";
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      ...(process.env.NODE_ENV === "development" && { 
        error: error.message,
        code: error.code,
        sqlState: error.sqlState,
        sqlMessage: error.sqlMessage
      }),
    });
  }
}

/**
 * GET /api/chat/messages/:conversation_id
 * Lấy danh sách tin nhắn trong một conversation
 * - Employee/Admin: xem tất cả conversations
 * - Customer: chỉ xem conversation của chính họ
 */
export async function getMessages(req, res) {
  let conversation_id = null;
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userRole = req.user.role || "customer";
    const userId = req.user.userId;
    conversation_id = req.params.conversation_id;
    
    // Validate conversation_id - keep as string (VARCHAR in database)
    if (!conversation_id || typeof conversation_id !== 'string' || conversation_id.trim() === "") {
      return res.status(400).json({
        success: false,
        message: "conversation_id không hợp lệ",
      });
    }
    
    // Clean conversation_id - remove any whitespace
    conversation_id = conversation_id.trim();

    // CRITICAL: Parse strings to integers - Express query params are always strings
    // MySQL LIMIT and OFFSET require integers, not strings
    const limit = req.query.limit ? parseInt(req.query.limit, 10) : 50;
    const offset = req.query.offset ? parseInt(req.query.offset, 10) : 0;
    
    // Ensure they are valid numbers (not NaN) and positive
    // Convert to Number to ensure MySQL receives integers
    const validLimit = (isNaN(limit) || limit < 1) ? 50 : Number(limit);
    const validOffset = (isNaN(offset) || offset < 0) ? 0 : Number(offset);
    
    // Debug logging
    console.log(`🔍 getMessages - conversation_id: "${conversation_id}", limit: ${validLimit} (${typeof validLimit}), offset: ${validOffset} (${typeof validOffset})`);

    // Kiểm tra conversation có tồn tại không
    let conversation;
    try {
      conversation = await chatModel.getConversationById(conversation_id);
    } catch (dbError) {
      console.error("❌ Database error in getConversationById:", dbError);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi kiểm tra cuộc trò chuyện",
      });
    }

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc trò chuyện",
      });
    }

    // Nếu là customer, kiểm tra xem conversation có thuộc về họ không
    if (userRole === "customer") {
      if (conversation.customer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem cuộc trò chuyện này",
        });
      }
    }

    // Lấy tin nhắn
    let messages;
    try {
      messages = await chatModel.getMessages(
        conversation_id,
        validLimit,
        validOffset
      );
    } catch (msgError) {
      console.error("❌ Database error in getMessages:", msgError);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi lấy tin nhắn",
      });
    }

    // Đánh dấu đã đọc (không block nếu lỗi)
    try {
      await chatModel.markMessagesAsRead(conversation_id, userId);
    } catch (readError) {
      console.error("❌ Error marking as read (non-blocking):", readError);
      // Không throw error, chỉ log
    }

    res.json({
      success: true,
      data: messages || [],
    });
  } catch (error) {
    console.error("❌ Error in getMessages:", error);
    console.error("   Error details:", {
      message: error.message,
      code: error.code,
      sqlState: error.sqlState,
      sqlMessage: error.sqlMessage,
      conversation_id: conversation_id,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy tin nhắn",
      ...(process.env.NODE_ENV === "development" && { 
        error: error.message,
        code: error.code 
      }),
    });
  }
}

/**
 * PUT /api/chat/messages/read/:conversation_id
 * Đánh dấu tin nhắn đã đọc
 * - Employee/Admin: đánh dấu đã đọc cho tất cả conversations
 * - Customer: chỉ đánh dấu đã đọc cho conversation của chính họ
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

    // Nếu là customer, kiểm tra xem conversation có thuộc về họ không
    if (userRole === "customer") {
      if (conversation.customer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền đánh dấu đã đọc cuộc trò chuyện này",
        });
      }
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
 * Lấy thông tin một conversation
 * - Employee/Admin: xem tất cả conversations
 * - Customer: chỉ xem conversation của chính họ
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
    const userId = req.user.userId;
    const { conversation_id } = req.params;

    const conversation = await chatModel.getConversationById(conversation_id);
    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy cuộc trò chuyện",
      });
    }

    // Nếu là customer, kiểm tra xem conversation có thuộc về họ không
    if (userRole === "customer") {
      if (conversation.customer_id !== userId) {
        return res.status(403).json({
          success: false,
          message: "Bạn không có quyền xem cuộc trò chuyện này",
        });
      }
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

/**
 * GET /api/chat/customer/conversation
 * Lấy hoặc tạo conversation cho customer
 */
export async function getOrCreateCustomerConversation(req, res) {
  try {
    console.log("📞 [getOrCreateCustomerConversation] Request received");
    console.log("   req.user:", req.user ? { userId: req.user.userId, role: req.user.role } : "null");

    if (!req.user || !req.user.userId) {
      console.log("   ❌ No user or userId");
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userRole = req.user.role || "customer";
    if (userRole !== "customer") {
      console.log("   ❌ User is not customer, role:", userRole);
      return res.status(403).json({
        success: false,
        message: "Chỉ khách hàng mới có quyền sử dụng endpoint này",
      });
    }

    const userId = req.user.userId;
    console.log("   ✅ User authenticated, userId:", userId);

    // Tìm nhân viên đang online hoặc gán cho nhân viên đầu tiên
    console.log("   🔍 Searching for employees...");
    let employees;
    try {
      employees = await query(
        `SELECT id, role FROM users 
         WHERE role IN ('employee', 'admin') AND status = 'active' 
         ORDER BY id ASC LIMIT 1`
      );
      console.log("   ✅ Found employees:", employees.length);
    } catch (dbError) {
      console.error("   ❌ Database error when querying employees:", dbError);
      throw dbError;
    }
    
    if (employees.length === 0) {
      console.log("   ❌ No employees found");
      return res.status(404).json({
        success: false,
        message: "Hiện không có nhân viên nào online",
      });
    }

    const employeeId = employees[0].id;
    console.log("   ✅ Employee found, employeeId:", employeeId);

    // Tạo hoặc lấy conversation
    console.log("   🔄 Getting or creating conversation...");
    let conversation;
    try {
      conversation = await chatModel.getOrCreateConversation(
        userId,
        employeeId
      );
      console.log("   ✅ Conversation:", conversation ? conversation.conversation_id : "null");
    } catch (convError) {
      console.error("   ❌ Error in getOrCreateConversation:", convError);
      console.error("   Stack:", convError.stack);
      throw convError;
    }

    if (!conversation) {
      console.error("   ❌ Conversation is null after getOrCreateConversation");
      return res.status(500).json({
        success: false,
        message: "Không thể tạo hoặc lấy cuộc trò chuyện",
      });
    }

    console.log("   ✅ Success, returning conversation");
    res.json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    console.error("❌ Error in getOrCreateCustomerConversation:", error);
    console.error("   Error name:", error.name);
    console.error("   Error message:", error.message);
    console.error("   Error code:", error.code);
    console.error("   Error sqlState:", error.sqlState);
    console.error("   Error sqlMessage:", error.sqlMessage);
    console.error("   Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi khi lấy hoặc tạo cuộc trò chuyện",
      ...(process.env.NODE_ENV === "development" && { 
        error: error.message,
        code: error.code,
        stack: error.stack 
      }),
    });
  }
}

