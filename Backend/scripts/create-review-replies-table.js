// Script để tạo bảng review_replies
import { query, testConnection } from "../config/database.js";

async function createReviewRepliesTable() {
  try {
    console.log("🔌 Đang kiểm tra kết nối database...");
    const connected = await testConnection();
    if (!connected) {
      console.error("❌ Không thể kết nối database!");
      process.exit(1);
    }

    console.log("📝 Đang tạo bảng review_replies...");
    await query(`
      CREATE TABLE IF NOT EXISTS review_replies (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        review_id BIGINT NOT NULL,
        admin_id BIGINT NOT NULL,
        content TEXT NOT NULL,
        status ENUM('active', 'deleted') DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (review_id) REFERENCES reviews(id) ON DELETE CASCADE,
        FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_review (review_id),
        INDEX idx_admin (admin_id),
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log("✅ Đã tạo bảng review_replies thành công!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi tạo bảng:", error);
    process.exit(1);
  }
}

createReviewRepliesTable();

