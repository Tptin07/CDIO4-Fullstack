import { query } from "../config/database.js";
import { ensureChatTables } from "../utils/ensureChatTables.js";

/**
 * Tạo hoặc lấy conversation_id giữa customer và employee
 */
export async function getOrCreateConversation(customerId, employeeId = null) {
  try {
    // Tạo conversation_id dựa trên customer_id
    // Nếu có employee_id cụ thể, có thể tạo conversation_id riêng
    const conversationId = employeeId
      ? `conv_${customerId}_${employeeId}`
      : `conv_customer_${customerId}`;

    // Kiểm tra xem conversation đã tồn tại chưa
    const existing = await query(
      `SELECT * FROM conversations WHERE conversation_id = ?`,
      [conversationId]
    );

    if (existing && existing.length > 0) {
      return existing[0];
    }

    // Tạo conversation mới
    await query(
      `INSERT INTO conversations (conversation_id, customer_id, employee_id, status)
       VALUES (?, ?, ?, 'active')`,
      [conversationId, customerId, employeeId]
    );

    const newConv = await query(
      `SELECT * FROM conversations WHERE conversation_id = ?`,
      [conversationId]
    );

    if (!newConv || newConv.length === 0) {
      throw new Error("Không thể tạo conversation mới");
    }

    return newConv[0];
  } catch (error) {
    console.error("❌ Error in getOrCreateConversation:", error);
    throw error;
  }
}

/**
 * Gửi tin nhắn
 */
export async function sendMessage(data) {
  const {
    conversationId,
    senderId,
    senderRole,
    receiverId,
    receiverRole,
    message,
    messageType = "text",
  } = data;

  // Insert tin nhắn
  const result = await query(
    `INSERT INTO chat_messages 
     (conversation_id, sender_id, sender_role, receiver_id, receiver_role, message, message_type)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      conversationId,
      senderId,
      senderRole,
      receiverId,
      receiverRole,
      message,
      messageType,
    ]
  );

  const messageId = result.insertId;

  // Cập nhật conversation: last_message và last_message_at
  // Cập nhật unread_count: customer hoặc employee/admin
  const unreadField = receiverRole === "customer" ? "unread_count_customer" : "unread_count_employee";
  const updateQuery = `UPDATE conversations 
     SET last_message = ?, 
         last_message_at = NOW(),
         ${unreadField} = ${unreadField} + 1
     WHERE conversation_id = ?`;
  await query(updateQuery, [message.substring(0, 255), conversationId]);

  // Lấy tin nhắn vừa tạo
  const newMessage = await query(
    `SELECT cm.*, 
            u1.name as sender_name, u1.avatar as sender_avatar,
            u2.name as receiver_name, u2.avatar as receiver_avatar
     FROM chat_messages cm
     LEFT JOIN users u1 ON cm.sender_id = u1.id
     LEFT JOIN users u2 ON cm.receiver_id = u2.id
     WHERE cm.id = ?`,
    [messageId]
  );

  return newMessage[0];
}

/**
 * Lấy danh sách tin nhắn trong một conversation
 */
export async function getMessages(conversationId, limit = 50, offset = 0) {
  // Validate conversationId
  if (!conversationId || typeof conversationId !== 'string' || conversationId.trim() === '') {
    throw new Error('conversationId không hợp lệ');
  }

  // Parse and validate limit
  let validLimit = 50;
  if (limit !== undefined && limit !== null) {
    const parsedLimit = parseInt(limit, 10);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      validLimit = parsedLimit;
    }
  }
  
  // Parse and validate offset
  let validOffset = 0;
  if (offset !== undefined && offset !== null) {
    const parsedOffset = parseInt(offset, 10);
    if (!isNaN(parsedOffset) && parsedOffset >= 0) {
      validOffset = parsedOffset;
    }
  }
  
  // CRITICAL: Convert to Number to ensure MySQL receives integers, not strings
  validLimit = Number(validLimit);
  validOffset = Number(validOffset);
  
  // Validate types before query
  if (typeof validLimit !== 'number' || isNaN(validLimit)) {
    throw new Error(`Invalid limit: ${limit} (parsed to ${validLimit})`);
  }
  if (typeof validOffset !== 'number' || isNaN(validOffset)) {
    throw new Error(`Invalid offset: ${offset} (parsed to ${validOffset})`);
  }
  
  try {
    console.log(`🔍 [getMessages] Query - conversationId: "${conversationId}", limit: ${validLimit} (${typeof validLimit}), offset: ${validOffset} (${typeof validOffset})`);
    
    // Tự động tạo bảng nếu chưa tồn tại (chỉ trong development)
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log("   🔄 Đang gọi ensureChatTables...");
        await ensureChatTables();
        console.log("   ✅ ensureChatTables hoàn thành");
      } catch (ensureError) {
        console.error("   ⚠️  Không thể tự động tạo bảng:", ensureError.message);
        console.error("   Error code:", ensureError.code);
        // Tiếp tục thử query, nếu lỗi sẽ được bắt ở catch bên dưới
      }
    }
    
    console.log("   📡 Đang thực thi query...");
    // MySQL2 không hỗ trợ prepared statement với LIMIT và OFFSET trong một số trường hợp
    // Phải dùng giá trị trực tiếp cho LIMIT/OFFSET (đã validate là số nguyên, an toàn khỏi SQL injection)
    const messages = await query(
      `SELECT cm.*, 
              COALESCE(u1.name, 'Người gửi') as sender_name, 
              u1.avatar as sender_avatar,
              COALESCE(u2.name, 'Người nhận') as receiver_name, 
              u2.avatar as receiver_avatar
       FROM chat_messages cm
       LEFT JOIN users u1 ON cm.sender_id = u1.id
       LEFT JOIN users u2 ON cm.receiver_id = u2.id
       WHERE cm.conversation_id = ?
       ORDER BY cm.created_at DESC
       LIMIT ${validLimit} OFFSET ${validOffset}`,
      [conversationId.trim()]
    );

    console.log(`   ✅ Query thành công, trả về ${messages?.length || 0} messages`);
    // Đảo ngược để hiển thị từ cũ đến mới
    return (messages || []).reverse();
  } catch (error) {
    console.error("❌ [getMessages] Error:", error);
    console.error("   conversationId:", conversationId);
    console.error("   limit:", limit, "validLimit:", validLimit, "type:", typeof validLimit);
    console.error("   offset:", offset, "validOffset:", validOffset, "type:", typeof validOffset);
    console.error("   Error code:", error.code);
    console.error("   SQL State:", error.sqlState);
    console.error("   SQL Message:", error.sqlMessage);
    console.error("   Stack:", error.stack);
    throw error;
  }
}

/**
 * Lấy danh sách conversations cho customer
 */
export async function getCustomerConversations(customerId) {
  try {
    const conversations = await query(
      `SELECT c.*, 
              COALESCE(u1.name, 'Khách hàng') as customer_name, 
              u1.avatar as customer_avatar,
              u2.name as employee_name, 
              u2.avatar as employee_avatar
       FROM conversations c
       LEFT JOIN users u1 ON c.customer_id = u1.id
       LEFT JOIN users u2 ON c.employee_id = u2.id
       WHERE c.customer_id = ?
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC, c.created_at DESC`,
      [customerId]
    );

    return conversations || [];
  } catch (error) {
    console.error("❌ Error in getCustomerConversations:", error);
    throw error;
  }
}

/**
 * Lấy danh sách conversations cho employee/admin (tất cả conversations)
 */
export async function getAllConversations(limit = 50, offset = 0) {
  // Đảm bảo limit và offset là số nguyên (Integer)
  // Controller đã parse rồi, nhưng vẫn kiểm tra lại để an toàn
  let validLimit = 50;
  if (typeof limit === 'number' && !isNaN(limit) && limit > 0) {
    validLimit = Math.floor(limit); // Đảm bảo là số nguyên
  } else if (limit !== undefined && limit !== null) {
    const parsed = parseInt(limit, 10);
    if (!isNaN(parsed) && parsed > 0) {
      validLimit = parsed;
    }
  }
  
  let validOffset = 0;
  if (typeof offset === 'number' && !isNaN(offset) && offset >= 0) {
    validOffset = Math.floor(offset); // Đảm bảo là số nguyên
  } else if (offset !== undefined && offset !== null) {
    const parsed = parseInt(offset, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      validOffset = parsed;
    }
  }
  
  // CRITICAL: Đảm bảo MySQL nhận được số nguyên, không phải chuỗi
  validLimit = Number(validLimit);
  validOffset = Number(validOffset);
  
  // Validate types trước khi query
  if (typeof validLimit !== 'number' || isNaN(validLimit)) {
    throw new Error(`Invalid limit: ${limit} (parsed to ${validLimit})`);
  }
  if (typeof validOffset !== 'number' || isNaN(validOffset)) {
    throw new Error(`Invalid offset: ${offset} (parsed to ${validOffset})`);
  }
  
  try {
    // Tự động tạo bảng nếu chưa tồn tại (chỉ trong development)
    console.log("🔍 [getAllConversations] Kiểm tra bảng...");
    if (process.env.NODE_ENV !== 'production') {
      try {
        console.log("   🔄 Đang gọi ensureChatTables...");
        await ensureChatTables();
        console.log("   ✅ ensureChatTables hoàn thành");
      } catch (ensureError) {
        console.error("   ⚠️  Không thể tự động tạo bảng:", ensureError.message);
        console.error("   Error code:", ensureError.code);
        console.error("   SQL State:", ensureError.sqlState);
        // Tiếp tục thử query, nếu lỗi sẽ được bắt ở catch bên dưới
      }
    }

    // DEBUG: Log trước khi query để đảm bảo values đúng
    console.log(`🔍 [getAllConversations] Query - limit: ${validLimit} (${typeof validLimit}), offset: ${validOffset} (${typeof validOffset})`);
    console.log(`🔍 [getAllConversations] Query params array: [${validLimit}, ${validOffset}]`);

    console.log("   📡 Đang thực thi query...");
    // MySQL2 không hỗ trợ prepared statement với LIMIT và OFFSET trong một số trường hợp
    // Phải dùng giá trị trực tiếp (đã validate là số nguyên, an toàn khỏi SQL injection)
    const conversations = await query(
      `SELECT c.*, 
              COALESCE(u1.name, 'Khách hàng') as customer_name, 
              u1.avatar as customer_avatar,
              u2.name as employee_name, 
              u2.avatar as employee_avatar
       FROM conversations c
       LEFT JOIN users u1 ON c.customer_id = u1.id
       LEFT JOIN users u2 ON c.employee_id = u2.id
       WHERE c.status = 'active'
       ORDER BY COALESCE(c.last_message_at, c.created_at) DESC, c.created_at DESC
       LIMIT ${validLimit} OFFSET ${validOffset}`,
      []
    );

    console.log(`   ✅ Query thành công, trả về ${conversations?.length || 0} conversations`);
    return conversations || [];
  } catch (error) {
    console.error("❌ [getAllConversations] Error:", error);
    console.error("   Error code:", error.code);
    console.error("   Error message:", error.message);
    console.error("   SQL State:", error.sqlState);
    console.error("   SQL Message:", error.sqlMessage);
    console.error("   Input - limit:", limit, "type:", typeof limit);
    console.error("   Input - offset:", offset, "type:", typeof offset);
    console.error("   Parsed - validLimit:", validLimit, "type:", typeof validLimit);
    console.error("   Parsed - validOffset:", validOffset, "type:", typeof validOffset);
    console.error("   Stack:", error.stack);
    throw error;
  }
}

/**
 * Đánh dấu tin nhắn đã đọc
 */
export async function markMessagesAsRead(conversationId, userId) {
  // Cập nhật is_read cho các tin nhắn chưa đọc mà user này là receiver
  await query(
    `UPDATE chat_messages 
     SET is_read = TRUE, read_at = NOW()
     WHERE conversation_id = ? 
       AND receiver_id = ? 
       AND is_read = FALSE`,
    [conversationId, userId]
  );

  // Cập nhật unread_count trong conversations
  const user = await query(`SELECT role FROM users WHERE id = ?`, [userId]);
  if (user.length > 0) {
    const role = user[0].role;
    const countField =
      role === "customer" ? "unread_count_customer" : "unread_count_employee";

    // Sử dụng template literal để build SQL query
    const updateQuery = `UPDATE conversations 
       SET ${countField} = 0
       WHERE conversation_id = ?`;
    
    await query(updateQuery, [conversationId]);
  }

  return { success: true };
}

/**
 * Đếm số tin nhắn chưa đọc
 */
export async function getUnreadCount(userId) {
  const user = await query(`SELECT role FROM users WHERE id = ?`, [userId]);
  if (user.length === 0) {
    return { unread_count: 0 };
  }

  const role = user[0].role;

  if (role === "customer") {
    const result = await query(
      `SELECT SUM(unread_count_customer) as unread_count
       FROM conversations
       WHERE customer_id = ? AND status = 'active'`,
      [userId]
    );
    return {
      unread_count: result[0].unread_count || 0,
    };
  } else {
    // employee hoặc admin
    const result = await query(
      `SELECT SUM(unread_count_employee) as unread_count
       FROM conversations
       WHERE status = 'active'`,
      []
    );
    return {
      unread_count: result[0].unread_count || 0,
    };
  }
}

/**
 * Lấy conversation theo ID
 */
export async function getConversationById(conversationId) {
  // Validate conversationId
  if (!conversationId || typeof conversationId !== 'string' || conversationId.trim() === '') {
    console.error("❌ Invalid conversationId:", conversationId);
    return null;
  }

  try {
    const conversations = await query(
      `SELECT c.*, 
              COALESCE(u1.name, 'Khách hàng') as customer_name, 
              u1.avatar as customer_avatar,
              u2.name as employee_name, 
              u2.avatar as employee_avatar
       FROM conversations c
       LEFT JOIN users u1 ON c.customer_id = u1.id
       LEFT JOIN users u2 ON c.employee_id = u2.id
       WHERE c.conversation_id = ?`,
      [conversationId.trim()]
    );

    return conversations && conversations.length > 0 ? conversations[0] : null;
  } catch (error) {
    console.error("❌ Error in getConversationById:", error);
    console.error("   conversationId:", conversationId);
    console.error("   Error code:", error.code);
    throw error;
  }
}

/**
 * Tìm conversation dựa trên customer_id và employee_id
 */
export async function findConversationByUsers(customerId, employeeId) {
  try {
    const conversations = await query(
      `SELECT * FROM conversations 
       WHERE customer_id = ? AND employee_id = ? AND status = 'active'
       ORDER BY created_at DESC LIMIT 1`,
      [customerId, employeeId]
    );

    return conversations && conversations.length > 0 ? conversations[0] : null;
  } catch (error) {
    console.error("❌ Error in findConversationByUsers:", error);
    throw error;
  }
}

/**
 * Xóa conversation (soft delete - chuyển status sang 'archived')
 */
export async function deleteConversation(conversationId, userId, userRole) {
  try {
    // Validate conversationId
    if (!conversationId || typeof conversationId !== 'string' || conversationId.trim() === '') {
      throw new Error('conversationId không hợp lệ');
    }

    // Kiểm tra conversation có tồn tại không
    const conversation = await getConversationById(conversationId);
    if (!conversation) {
      throw new Error('Không tìm thấy cuộc trò chuyện');
    }

    // Kiểm tra quyền: chỉ employee/admin mới được xóa
    if (userRole !== 'employee' && userRole !== 'admin') {
      throw new Error('Bạn không có quyền xóa cuộc trò chuyện này');
    }

    // Soft delete: chuyển status sang 'archived' thay vì xóa hoàn toàn
    // Điều này giúp giữ lại lịch sử chat
    await query(
      `UPDATE conversations 
       SET status = 'archived', updated_at = NOW()
       WHERE conversation_id = ?`,
      [conversationId.trim()]
    );

    console.log(`✅ Đã xóa (archive) conversation: ${conversationId}`);
    return { success: true, conversation_id: conversationId };
  } catch (error) {
    console.error("❌ Error in deleteConversation:", error);
    throw error;
  }
}

