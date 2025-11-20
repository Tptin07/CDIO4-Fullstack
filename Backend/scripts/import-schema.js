import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import pool, { testConnection } from "../config/database.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importSchema() {
  try {
    console.log("🔄 Đang kiểm tra kết nối database...");
    const connected = await testConnection();
    if (!connected) {
      console.error("❌ Không thể kết nối database. Vui lòng kiểm tra lại.");
      process.exit(1);
    }

    console.log("📖 Đang đọc file schema.sql...");
    const schemaPath = path.join(__dirname, "../database/schema.sql");
    const schemaSQL = fs.readFileSync(schemaPath, "utf8");

    console.log("🚀 Đang import schema và dữ liệu mẫu...\n");

    // Lấy connection để có thể chạy multiple statements
    let connection;
    try {
      connection = await pool.getConnection();
      // Chia SQL thành các câu lệnh riêng biệt
      // Xử lý DELIMITER $$ và các stored procedures/functions
      let statements = schemaSQL
        .replace(/DELIMITER \$\$/g, "")
        .replace(/\$\$/g, ";")
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      let successCount = 0;
      let skipCount = 0;
      let errorCount = 0;

      for (let i = 0; i < statements.length; i++) {
        const statement = statements[i];
        if (!statement || statement.length < 10) continue;

        try {
          // Chạy từng statement
          await connection.query(statement);
          successCount++;

          // Log progress cho các câu lệnh quan trọng
          if (statement.startsWith("INSERT INTO")) {
            const tableMatch = statement.match(/INSERT INTO (\w+)/i);
            if (tableMatch) {
              const tableName = tableMatch[1];
              console.log(`   ✅ Đã import dữ liệu vào bảng: ${tableName}`);
            }
          } else if (statement.startsWith("CREATE TABLE")) {
            const tableMatch = statement.match(/CREATE TABLE (\w+)/i);
            if (tableMatch) {
              const tableName = tableMatch[1];
              console.log(`   ✅ Đã tạo bảng: ${tableName}`);
            }
          } else if (statement.match(/CREATE (PROCEDURE|FUNCTION)/i)) {
            const funcMatch = statement.match(/CREATE (PROCEDURE|FUNCTION) (\w+)/i);
            if (funcMatch) {
              const funcName = funcMatch[2];
              console.log(`   ✅ Đã tạo ${funcMatch[1].toLowerCase()}: ${funcName}`);
            }
          }
        } catch (error) {
          // Nếu bảng/function đã tồn tại, bỏ qua
          if (
            error.code === "ER_TABLE_EXISTS_ERROR" ||
            error.code === "ER_DUP_ENTRY" ||
            error.message.includes("already exists") ||
            error.code === "ER_SP_ALREADY_EXISTS"
          ) {
            skipCount++;
            // Chỉ log khi có nhiều skip
            if (skipCount % 10 === 0) {
              console.log(`   ⚠️  Đã bỏ qua ${skipCount} câu lệnh (đã tồn tại)`);
            }
          } else {
            errorCount++;
            // Chỉ log lỗi quan trọng
            if (!error.message.includes("Unknown database")) {
              console.error(`   ❌ Lỗi: ${error.message.substring(0, 100)}`);
              console.error(`      Câu lệnh: ${statement.substring(0, 100)}...`);
            }
          }
        }
      }

      console.log("\n📊 Kết quả import:");
      console.log(`   ✅ Thành công: ${successCount} câu lệnh`);
      if (skipCount > 0) {
        console.log(`   ⚠️  Đã bỏ qua: ${skipCount} câu lệnh (đã tồn tại)`);
      }
      if (errorCount > 0) {
        console.log(`   ❌ Lỗi: ${errorCount} câu lệnh`);
      }

      // Kiểm tra dữ liệu đã được import
      console.log("\n📋 Kiểm tra dữ liệu đã import:");
      
      const [users] = await connection.query("SELECT COUNT(*) as count FROM users WHERE role = 'customer'");
      console.log(`   👥 Customers: ${users[0].count}`);

      const [products] = await connection.query("SELECT COUNT(*) as count FROM products");
      console.log(`   📦 Products: ${products[0].count}`);

      const [categories] = await connection.query("SELECT COUNT(*) as count FROM categories");
      console.log(`   📂 Categories: ${categories[0].count}`);

      const [addresses] = await connection.query("SELECT COUNT(*) as count FROM addresses");
      console.log(`   📍 Addresses: ${addresses[0].count}`);

      const [orders] = await connection.query("SELECT COUNT(*) as count FROM orders");
      console.log(`   🛒 Orders: ${orders[0].count}`);

      const [services] = await connection.query("SELECT COUNT(*) as count FROM services");
      console.log(`   🔧 Services: ${services[0].count}`);

      console.log("\n✅ Hoàn thành import schema và dữ liệu mẫu!");
    } finally {
      if (connection) {
        connection.release();
      }
    }
  } catch (error) {
    console.error("❌ Lỗi khi import schema:", error.message);
    console.error(error);
    process.exit(1);
  }
}

importSchema()
  .then(() => {
    console.log("\n✅ Script hoàn thành");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Script thất bại:", error);
    process.exit(1);
  });

