import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

// Tạo connection pool để quản lý kết nối hiệu quả
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "12345678",
  database: process.env.DB_NAME || "pharmacity_db",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Hàm kiểm tra kết nối
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Kết nối database thành công!");
    console.log(`   Database: ${process.env.DB_NAME || "pharmacity_db"}`);
    console.log(
      `   Host: ${process.env.DB_HOST || "localhost"}:${
        process.env.DB_PORT || 3306
      }`
    );
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Lỗi kết nối database:", error.message);
    console.error("   Vui lòng kiểm tra:");
    console.error("   - MySQL server đang chạy");
    console.error("   - Thông tin kết nối trong file .env");
    console.error("   - Database đã được tạo chưa");
    return false;
  }
}

// Hàm thực thi query
export async function query(sql, params) {
  try {
    // Log query với thông tin về avatar nếu có
    if (params && params.some(p => p && typeof p === 'string' && p.startsWith('data:image'))) {
      const avatarIndex = params.findIndex(p => p && typeof p === 'string' && p.startsWith('data:image'));
      if (avatarIndex !== -1) {
        console.log(`📸 Query với avatar (length: ${params[avatarIndex].length})`);
      }
    }
    
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error("❌ Database query error:", error.message);
    console.error("   SQL:", sql.substring(0, 200));
    if (error.code) {
      console.error("   Error code:", error.code);
    }
    // Kiểm tra lỗi liên quan đến packet size
    if (error.code === 'ER_NET_PACKET_TOO_LARGE' || error.message.includes('max_allowed_packet')) {
      console.error("   ⚠️  Vấn đề: max_allowed_packet quá nhỏ!");
      console.error("   💡 Giải pháp: Tăng max_allowed_packet trong MySQL config");
      console.error("      SET GLOBAL max_allowed_packet=67108864; -- 64MB");
    }
    throw error;
  }
}

// Export pool để sử dụng trực tiếp nếu cần
export default pool;
