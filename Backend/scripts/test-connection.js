import { testConnection } from '../config/database.js';

// Script để test kết nối database
console.log('🔍 Đang kiểm tra kết nối database...\n');
console.log('Thông tin kết nối:');
console.log(`   Host: ${process.env.DB_HOST || 'localhost'}`);
console.log(`   Port: ${process.env.DB_PORT || 3306}`);
console.log(`   User: ${process.env.DB_USER || 'root'}`);
console.log(`   Database: ${process.env.DB_NAME || 'pharmacity_db'}\n`);

testConnection().then((connected) => {
  if (connected) {
    console.log('\n✅ Kết nối database thành công!');
    process.exit(0);
  } else {
    console.log('\n❌ Không thể kết nối database. Vui lòng kiểm tra:');
    console.log('   1. MySQL server đang chạy');
    console.log('   2. Thông tin kết nối trong file .env');
    console.log('   3. Database "pharmacity_db" đã được tạo chưa');
    process.exit(1);
  }
});

