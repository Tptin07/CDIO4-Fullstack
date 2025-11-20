import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateGenderBirthday() {
  try {
    console.log('🔄 Đang thêm cột gender và date_of_birth vào bảng users...');
    
    // Kiểm tra column gender đã tồn tại chưa
    const genderColumn = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'gender'
    `, [process.env.DB_NAME || 'pharmacity_db']);

    // Kiểm tra column date_of_birth đã tồn tại chưa
    const birthdayColumn = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users' 
      AND COLUMN_NAME = 'date_of_birth'
    `, [process.env.DB_NAME || 'pharmacity_db']);

    // Thêm column gender nếu chưa có
    if (genderColumn.length === 0) {
      console.log('   Đang thêm cột gender...');
      await query(`
        ALTER TABLE users 
        ADD COLUMN gender ENUM('male', 'female', 'other') DEFAULT NULL AFTER phone
      `);
      console.log('✅ Đã thêm cột gender');
    } else {
      console.log('⚠️  Cột gender đã tồn tại, bỏ qua');
    }

    // Thêm column date_of_birth nếu chưa có
    if (birthdayColumn.length === 0) {
      console.log('   Đang thêm cột date_of_birth...');
      await query(`
        ALTER TABLE users 
        ADD COLUMN date_of_birth DATE DEFAULT NULL AFTER gender
      `);
      console.log('✅ Đã thêm cột date_of_birth');
    } else {
      console.log('⚠️  Cột date_of_birth đã tồn tại, bỏ qua');
    }

    console.log('✨ Migration hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi khi migration:', error.message);
    process.exit(1);
  }
}

// Chạy migration
migrateGenderBirthday()
  .then(() => {
    console.log('✅ Tất cả migration đã hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

