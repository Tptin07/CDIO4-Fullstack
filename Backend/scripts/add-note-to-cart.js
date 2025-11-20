// Script để thêm cột note vào bảng cart
import { query } from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

async function addNoteToCart() {
  try {
    console.log("🔄 Đang kiểm tra cột note trong bảng cart...");

    // Kiểm tra xem cột đã tồn tại chưa
    const [columns] = await query(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? 
       AND TABLE_NAME = 'cart' 
       AND COLUMN_NAME = 'note'`,
      [process.env.DB_NAME || "pharmacity_db"]
    );

    if (columns && columns.length > 0) {
      console.log("✅ Cột 'note' đã tồn tại trong bảng cart!");
      return;
    }

    console.log("📝 Đang thêm cột 'note' vào bảng cart...");

    // Thêm cột note
    await query(
      `ALTER TABLE cart 
       ADD COLUMN note TEXT DEFAULT NULL 
       AFTER quantity`
    );

    console.log("✅ Đã thêm cột 'note' vào bảng cart thành công!");

    // Kiểm tra lại
    const result = await query(
      `DESCRIBE cart`
    );

    console.log("\n📋 Cấu trúc bảng cart sau khi cập nhật:");
    if (Array.isArray(result)) {
      result.forEach((col) => {
        console.log(`   - ${col.Field} (${col.Type})`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi thêm cột note:", error.message);
    if (error.code === "ER_DUP_FIELDNAME") {
      console.error("⚠️  Cột 'note' đã tồn tại!");
    }
    process.exit(1);
  }
}

addNoteToCart();

