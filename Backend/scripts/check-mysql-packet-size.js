import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkPacketSize() {
  try {
    console.log('🔍 Kiểm tra max_allowed_packet của MySQL...\n');
    
    const result = await query(`SHOW VARIABLES LIKE 'max_allowed_packet'`);
    
    if (result.length > 0) {
      const value = parseInt(result[0].Value);
      const valueMB = (value / 1024 / 1024).toFixed(2);
      
      console.log(`📊 max_allowed_packet: ${valueMB} MB (${value} bytes)`);
      
      // Một ảnh 2MB khi convert sang base64 sẽ khoảng 2.6MB
      const requiredMB = 5; // Khuyến nghị tối thiểu 5MB
      const requiredBytes = requiredMB * 1024 * 1024;
      
      if (value < requiredBytes) {
        console.log(`\n⚠️  max_allowed_packet hiện tại (${valueMB} MB) có thể quá nhỏ để lưu ảnh base64!`);
        console.log(`   Khuyến nghị: Tối thiểu ${requiredMB} MB`);
        console.log(`\n💡 Cách tăng max_allowed_packet:`);
        console.log(`   1. Chạy trong MySQL:`);
        console.log(`      SET GLOBAL max_allowed_packet=${requiredBytes * 2}; -- ${requiredMB * 2} MB`);
        console.log(`\n   2. Hoặc thêm vào my.ini (Windows) hoặc my.cnf (Linux):`);
        console.log(`      [mysqld]`);
        console.log(`      max_allowed_packet=${requiredBytes * 2}`);
        console.log(`      (Sau đó restart MySQL)`);
      } else {
        console.log(`\n✅ max_allowed_packet đủ lớn để lưu ảnh base64!`);
      }
    }
  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra:', error.message);
    process.exit(1);
  }
}

checkPacketSize()
  .then(() => {
    console.log('\n✨ Kiểm tra hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

