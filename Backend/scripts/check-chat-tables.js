// Script để kiểm tra và tạo bảng conversations và chat_messages nếu chưa có
import { query, testConnection } from "../config/database.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkAndCreateChatTables() {
  try {
    console.log("🔄 Đang kiểm tra kết nối database...");
    const connected = await testConnection();
    if (!connected) {
      console.error("❌ Không thể kết nối database. Vui lòng kiểm tra lại.");
      process.exit(1);
    }

    console.log("🚀 Đang kiểm tra và tạo bảng chat...\n");

    // Tạo bảng chat_messages
    console.log("📝 Đang tạo bảng chat_messages...");
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS chat_messages (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          conversation_id VARCHAR(100) NOT NULL,
          sender_id BIGINT NOT NULL,
          sender_role ENUM('customer', 'admin', 'employee') NOT NULL,
          receiver_id BIGINT DEFAULT NULL,
          receiver_role ENUM('customer', 'admin', 'employee') DEFAULT NULL,
          message TEXT NOT NULL,
          message_type ENUM('text', 'image', 'file') DEFAULT 'text',
          is_read BOOLEAN DEFAULT FALSE,
          read_at TIMESTAMP NULL DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_conversation (conversation_id),
          INDEX idx_sender (sender_id),
          INDEX idx_receiver (receiver_id),
          INDEX idx_created (created_at),
          INDEX idx_read (is_read),
          FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ Đã tạo bảng chat_messages");
    } catch (error) {
      if (error.code === "ER_TABLE_EXISTS_ERROR") {
        console.log("ℹ️  Bảng chat_messages đã tồn tại");
      } else {
        console.error("❌ Lỗi khi tạo bảng chat_messages:", error.message);
        throw error;
      }
    }

    // Tạo bảng conversations
    console.log("📝 Đang tạo bảng conversations...");
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS conversations (
          id BIGINT PRIMARY KEY AUTO_INCREMENT,
          conversation_id VARCHAR(100) UNIQUE NOT NULL,
          customer_id BIGINT NOT NULL,
          employee_id BIGINT DEFAULT NULL,
          last_message TEXT DEFAULT NULL,
          last_message_at TIMESTAMP NULL DEFAULT NULL,
          unread_count_customer INT DEFAULT 0,
          unread_count_employee INT DEFAULT 0,
          status ENUM('active', 'closed', 'archived') DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          INDEX idx_customer (customer_id),
          INDEX idx_employee (employee_id),
          INDEX idx_status (status),
          INDEX idx_last_message (last_message_at),
          FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
          FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE SET NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
      `);
      console.log("✅ Đã tạo bảng conversations");
    } catch (error) {
      if (error.code === "ER_TABLE_EXISTS_ERROR") {
        console.log("ℹ️  Bảng conversations đã tồn tại");
      } else {
        console.error("❌ Lỗi khi tạo bảng conversations:", error.message);
        throw error;
      }
    }

    // Kiểm tra xem bảng đã tồn tại chưa
    console.log("\n🔍 Đang kiểm tra bảng...");
    const conversations = await query(
      "SHOW TABLES LIKE 'conversations'"
    );
    const chatMessages = await query(
      "SHOW TABLES LIKE 'chat_messages'"
    );

    if (conversations.length > 0) {
      console.log("✅ Bảng 'conversations' đã tồn tại");
      const count = await query("SELECT COUNT(*) as count FROM conversations");
      console.log(`   Số lượng conversations: ${count[0].count}`);
    } else {
      console.log("❌ Bảng 'conversations' chưa tồn tại");
    }

    if (chatMessages.length > 0) {
      console.log("✅ Bảng 'chat_messages' đã tồn tại");
      const count = await query("SELECT COUNT(*) as count FROM chat_messages");
      console.log(`   Số lượng messages: ${count[0].count}`);
    } else {
      console.log("❌ Bảng 'chat_messages' chưa tồn tại");
    }

    console.log("\n✅ Hoàn tất!");
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

checkAndCreateChatTables();

