import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { query, testConnection } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function createChatTables() {
  try {
    console.log("🔄 Đang kiểm tra kết nối database...");
    const connected = await testConnection();
    if (!connected) {
      console.error("❌ Không thể kết nối database. Vui lòng kiểm tra lại.");
      process.exit(1);
    }

    console.log("📖 Đang đọc file migration...");
    const migrationPath = path.join(
      __dirname,
      "../database/migrate_chat_messages.sql"
    );
    const migrationSQL = fs.readFileSync(migrationPath, "utf8");

    console.log("🚀 Đang tạo bảng chat_messages và conversations...");

    // Chia SQL thành các câu lệnh riêng biệt
    const statements = migrationSQL
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"));

    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await query(statement);
          console.log("✅ Đã thực thi:", statement.substring(0, 50) + "...");
        } catch (error) {
          // Nếu bảng đã tồn tại, bỏ qua lỗi
          if (error.code === "ER_TABLE_EXISTS_ERROR") {
            console.log("⚠️  Bảng đã tồn tại, bỏ qua...");
          } else {
            throw error;
          }
        }
      }
    }

    console.log("\n✅ Hoàn thành! Đã tạo bảng chat_messages và conversations.");
    console.log("\n📋 Các bảng đã được tạo:");
    console.log("   - chat_messages: Lưu trữ tin nhắn");
    console.log("   - conversations: Quản lý cuộc trò chuyện");
  } catch (error) {
    console.error("❌ Lỗi khi tạo bảng:", error.message);
    console.error(error);
    process.exit(1);
  }
}

createChatTables();

