import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAvatarColumn() {
  try {
    console.log('🔍 Kiểm tra column avatar...');
    
    // Kiểm tra column type
    const columns = await query(`
      SELECT 
        COLUMN_NAME,
        COLUMN_TYPE,
        CHARACTER_MAXIMUM_LENGTH,
        IS_NULLABLE
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'avatar'
    `, [process.env.DB_NAME || 'pharmacity_db']);

    if (columns.length === 0) {
      console.log('❌ Không tìm thấy column avatar');
      return;
    }

    const column = columns[0];
    console.log('\n📊 Thông tin column avatar:');
    console.log('   Type:', column.COLUMN_TYPE);
    console.log('   Max Length:', column.CHARACTER_MAXIMUM_LENGTH || 'N/A (TEXT/LONGTEXT)');
    console.log('   Nullable:', column.IS_NULLABLE);

    const columnType = column.COLUMN_TYPE.toLowerCase();
    
    if (columnType.includes('longtext')) {
      console.log('\n✅ Column avatar đã là LONGTEXT - Có thể lưu được base64 string dài');
    } else if (columnType.includes('text')) {
      console.log('\n⚠️  Column avatar là TEXT - Có thể lưu được nhưng LONGTEXT tốt hơn');
    } else if (columnType.includes('varchar')) {
      const maxLength = column.CHARACTER_MAXIMUM_LENGTH;
      console.log(`\n❌ Column avatar là VARCHAR(${maxLength}) - KHÔNG ĐỦ để lưu base64 string!`);
      console.log('   Vui lòng chạy migration: npm run migrate-avatar');
    }

    // Kiểm tra một user mẫu để xem avatar có được lưu không
    console.log('\n🔍 Kiểm tra dữ liệu mẫu...');
    const users = await query('SELECT id, name, email, LENGTH(avatar) as avatar_length FROM users LIMIT 5');
    
    if (users.length > 0) {
      console.log('\n📋 Một số users trong database:');
      users.forEach(user => {
        console.log(`   User ${user.id} (${user.email}): avatar length = ${user.avatar_length || 0}`);
      });
    }

  } catch (error) {
    console.error('❌ Lỗi khi kiểm tra:', error.message);
    process.exit(1);
  }
}

checkAvatarColumn()
  .then(() => {
    console.log('\n✨ Kiểm tra hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

