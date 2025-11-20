// Script Node.js để thêm mã giảm giá TINDEPTRAI vào database
import { query } from "../config/database.js";
import dotenv from "dotenv";

dotenv.config();

async function insertTindeptraiCoupon() {
  try {
    console.log("🔄 Đang thêm mã giảm giá TINDEPTRAI...");

    // Kiểm tra xem mã đã tồn tại chưa
    const [existing] = await query(
      `SELECT id, code FROM coupons WHERE code = ?`,
      ["TINDEPTRAI"]
    );

    if (existing) {
      console.log("⚠️  Mã giảm giá TINDEPTRAI đã tồn tại!");
      console.log(`   ID: ${existing.id}, Code: ${existing.code}`);
      return;
    }

    // Insert mã giảm giá mới
    await query(
      `INSERT INTO coupons (
        code, 
        name, 
        description, 
        discount_type, 
        discount_value, 
        min_purchase, 
        max_discount, 
        usage_limit, 
        used_count, 
        valid_from, 
        valid_until, 
        status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        "TINDEPTRAI",
        "Mã giảm giá TINDEPTRAI",
        "Mã giảm giá đặc biệt TINDEPTRAI - Giảm 15% cho đơn hàng từ 100k",
        "percentage",
        15.0,
        100000.0,
        100000.0,
        100,
        0,
        "2024-01-01 00:00:00",
        "2024-12-31 23:59:59",
        "active",
      ]
    );

    console.log("✅ Đã thêm mã giảm giá TINDEPTRAI thành công!");

    // Kiểm tra kết quả
    const [result] = await query(
      `SELECT * FROM coupons WHERE code = ?`,
      ["TINDEPTRAI"]
    );

    console.log("\n📋 Thông tin mã giảm giá:");
    console.log(`   ID: ${result.id}`);
    console.log(`   Code: ${result.code}`);
    console.log(`   Name: ${result.name}`);
    console.log(`   Discount: ${result.discount_value}%`);
    console.log(`   Min Purchase: ${new Intl.NumberFormat("vi-VN").format(result.min_purchase)}₫`);
    console.log(`   Usage Limit: ${result.usage_limit}`);
    console.log(`   Valid From: ${result.valid_from}`);
    console.log(`   Valid Until: ${result.valid_until}`);
    console.log(`   Status: ${result.status}`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi khi thêm mã giảm giá:", error.message);
    if (error.code === "ER_DUP_ENTRY") {
      console.error("⚠️  Mã giảm giá TINDEPTRAI đã tồn tại trong database!");
    }
    process.exit(1);
  }
}

insertTindeptraiCoupon();

