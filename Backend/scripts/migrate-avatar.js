import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateAvatarColumn() {
  try {
    console.log('🔄 Đang cập nhật column avatar...');
    
    // Kiểm tra column hiện tại
    const columns = await query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'avatar'
    `, [process.env.DB_NAME || 'pharmacity_db']);

    if (columns.length === 0) {
      console.log('❌ Không tìm thấy column avatar');
      return;
    }

    const currentType = columns[0].COLUMN_TYPE.toLowerCase();
    console.log(`   Column hiện tại: ${currentType}`);

    if (currentType.includes('longtext')) {
      console.log('✅ Column avatar đã là LONGTEXT, không cần migration');
      return;
    }

    // Thực hiện migration
    await query(`
      ALTER TABLE users 
      MODIFY COLUMN avatar LONGTEXT DEFAULT NULL
    `);

    console.log('✅ Đã cập nhật column avatar thành LONGTEXT');
    console.log('   Bây giờ có thể lưu được base64 string của ảnh');
  } catch (error) {
    console.error('❌ Lỗi khi migration:', error.message);
    process.exit(1);
  }
}

// Chạy migration
migrateAvatarColumn()
  .then(() => {
    console.log('✨ Migration hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

