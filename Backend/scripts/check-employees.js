// Script để kiểm tra xem có nhân viên nào trong database
import { query, testConnection } from "../config/database.js";

async function checkEmployees() {
  try {
    console.log("🔄 Đang kiểm tra kết nối database...");
    const connected = await testConnection();
    if (!connected) {
      console.error("❌ Không thể kết nối database.");
      process.exit(1);
    }

    console.log("🔍 Đang kiểm tra nhân viên...\n");

    const employees = await query(
      `SELECT id, name, email, role, status FROM users 
       WHERE role IN ('employee', 'admin') AND status = 'active' 
       ORDER BY id ASC`
    );

    if (employees.length === 0) {
      console.log("❌ Không tìm thấy nhân viên nào!");
      console.log("\n💡 Để tạo nhân viên, bạn có thể:");
      console.log("   1. Đăng ký tài khoản mới với role='employee'");
      console.log("   2. Hoặc cập nhật user hiện có:");
      console.log("      UPDATE users SET role='employee', status='active' WHERE id=YOUR_USER_ID;");
    } else {
      console.log(`✅ Tìm thấy ${employees.length} nhân viên:\n`);
      employees.forEach((emp, index) => {
        console.log(`   ${index + 1}. ID: ${emp.id}, Tên: ${emp.name}, Email: ${emp.email}, Role: ${emp.role}`);
      });
    }

    console.log("\n✅ Hoàn tất!");
  } catch (error) {
    console.error("❌ Lỗi:", error);
    process.exit(1);
  }
}

checkEmployees();

