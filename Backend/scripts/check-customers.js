import { query, testConnection } from "../config/database.js";

async function checkCustomers() {
  try {
    await testConnection();
    const users = await query(
      'SELECT id, name, email, phone FROM users WHERE role = ? ORDER BY id',
      ['customer']
    );
    console.log(`\n📊 Tổng số customers: ${users.length}\n`);
    users.forEach((u) => {
      console.log(`${u.id}. ${u.name} - ${u.email} - ${u.phone}`);
    });
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
}

checkCustomers();

