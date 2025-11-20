import { query } from "../config/database.js";

/**
 * Tạo hoặc lấy conversation_id giữa customer và employee
 */
export async function getOrCreateConversation(customerId, employeeId = null) {
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

  if (existing.length > 0) {
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

  return newConv[0];
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
  const messages = await query(
    `SELECT cm.*, 
            u1.name as sender_name, u1.avatar as sender_avatar,
            u2.name as receiver_name, u2.avatar as receiver_avatar
     FROM chat_messages cm
     LEFT JOIN users u1 ON cm.sender_id = u1.id
     LEFT JOIN users u2 ON cm.receiver_id = u2.id
     WHERE cm.conversation_id = ?
     ORDER BY cm.created_at DESC
     LIMIT ? OFFSET ?`,
    [conversationId, limit, offset]
  );

  // Đảo ngược để hiển thị từ cũ đến mới
  return messages.reverse();
}

/**
 * Lấy danh sách conversations cho customer
 */
export async function getCustomerConversations(customerId) {
  const conversations = await query(
    `SELECT c.*, 
            u1.name as customer_name, u1.avatar as customer_avatar,
            u2.name as employee_name, u2.avatar as employee_avatar
     FROM conversations c
     LEFT JOIN users u1 ON c.customer_id = u1.id
     LEFT JOIN users u2 ON c.employee_id = u2.id
     WHERE c.customer_id = ?
     ORDER BY c.last_message_at DESC, c.created_at DESC`,
    [customerId]
  );

  return conversations;
}

/**
 * Lấy danh sách conversations cho employee/admin (tất cả conversations)
 */
export async function getAllConversations(limit = 50, offset = 0) {
  const conversations = await query(
    `SELECT c.*, 
            u1.name as customer_name, u1.avatar as customer_avatar,
            u2.name as employee_name, u2.avatar as employee_avatar
     FROM conversations c
     LEFT JOIN users u1 ON c.customer_id = u1.id
     LEFT JOIN users u2 ON c.employee_id = u2.id
     WHERE c.status = 'active'
     ORDER BY c.last_message_at DESC, c.created_at DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );

  return conversations;
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
  const conversations = await query(
    `SELECT c.*, 
            u1.name as customer_name, u1.avatar as customer_avatar,
            u2.name as employee_name, u2.avatar as employee_avatar
     FROM conversations c
     LEFT JOIN users u1 ON c.customer_id = u1.id
     LEFT JOIN users u2 ON c.employee_id = u2.id
     WHERE c.conversation_id = ?`,
    [conversationId]
  );

  return conversations.length > 0 ? conversations[0] : null;
}

