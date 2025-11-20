import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAndFixUserColumns() {
  try {
    console.log('🔍 Kiểm tra các cột trong bảng users...\n');
    
    const dbName = process.env.DB_NAME || 'pharmacity_db';
    
    // Kiểm tra tất cả các cột trong bảng users
    const columns = await query(`
      SELECT 
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'users'
      ORDER BY ORDINAL_POSITION
    `, [dbName]);

    console.log('📊 Các cột hiện có trong bảng users:');
    const existingColumns = columns.map(col => col.COLUMN_NAME);
    columns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.COLUMN_TYPE}, nullable: ${col.IS_NULLABLE})`);
    });

    // Kiểm tra các cột cần thiết
    const requiredColumns = {
      'phone': { type: 'VARCHAR(20)', nullable: 'YES', after: 'password' },
      'avatar': { type: 'LONGTEXT', nullable: 'YES', after: 'phone' },
      'gender': { type: "ENUM('male', 'female', 'other')", nullable: 'YES', after: 'phone' },
      'date_of_birth': { type: 'DATE', nullable: 'YES', after: 'gender' }
    };

    console.log('\n🔧 Kiểm tra và thêm các cột cần thiết...\n');

    for (const [columnName, columnDef] of Object.entries(requiredColumns)) {
      const exists = existingColumns.includes(columnName);
      
      if (!exists) {
        console.log(`   ⚠️  Cột ${columnName} chưa tồn tại, đang thêm...`);
        try {
          await query(`
            ALTER TABLE users 
            ADD COLUMN ${columnName} ${columnDef.type} DEFAULT NULL ${columnDef.after ? `AFTER ${columnDef.after}` : ''}
          `);
          console.log(`   ✅ Đã thêm cột ${columnName}`);
        } catch (error) {
          console.error(`   ❌ Lỗi khi thêm cột ${columnName}:`, error.message);
        }
      } else {
        console.log(`   ✅ Cột ${columnName} đã tồn tại`);
      }
    }

    // Kiểm tra kiểu dữ liệu của avatar
    const avatarColumn = columns.find(col => col.COLUMN_NAME === 'avatar');
    if (avatarColumn) {
      const columnType = avatarColumn.COLUMN_TYPE.toLowerCase();
      if (!columnType.includes('text')) {
        console.log('\n⚠️  Cột avatar không phải TEXT/LONGTEXT, đang chuyển đổi...');
        try {
          await query(`ALTER TABLE users MODIFY COLUMN avatar LONGTEXT DEFAULT NULL`);
          console.log('✅ Đã chuyển đổi cột avatar sang LONGTEXT');
        } catch (error) {
          console.error('❌ Lỗi khi chuyển đổi cột avatar:', error.message);
        }
      } else {
        console.log('\n✅ Cột avatar đã là LONGTEXT');
      }
    }

    // Kiểm tra dữ liệu mẫu
    console.log('\n📋 Kiểm tra dữ liệu mẫu...');
    const sampleUsers = await query(`
      SELECT 
        id, 
        name, 
        email, 
        phone,
        LENGTH(avatar) as avatar_length,
        gender,
        date_of_birth
      FROM users 
      LIMIT 5
    `);
    
    if (sampleUsers.length > 0) {
      console.log('\n📊 Một số users trong database:');
      sampleUsers.forEach(user => {
        console.log(`   User ${user.id} (${user.email}):`);
        console.log(`      - Phone: ${user.phone || 'NULL'}`);
        console.log(`      - Avatar length: ${user.avatar_length || 0}`);
        console.log(`      - Gender: ${user.gender || 'NULL'}`);
        console.log(`      - Date of birth: ${user.date_of_birth || 'NULL'}`);
      });
    }

    console.log('\n✨ Kiểm tra và sửa chữa hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    process.exit(1);
  }
}

checkAndFixUserColumns()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

