import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function testAvatarUpload() {
  try {
    console.log('🧪 Test upload avatar vào database...\n');
    
    // Tạo một base64 string mẫu nhỏ (1x1 pixel red PNG)
    const testAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    
    console.log('📸 Test avatar length:', testAvatar.length, 'bytes');
    
    // Tìm user đầu tiên để test
    const users = await query('SELECT id, name, email FROM users WHERE id = 1');
    
    if (users.length === 0) {
      console.log('❌ Không tìm thấy user ID 1, thử tìm user đầu tiên...');
      const allUsers = await query('SELECT id, name, email FROM users ORDER BY id LIMIT 1');
      if (allUsers.length === 0) {
        console.log('❌ Không có user nào để test');
        return;
      }
      users.push(allUsers[0]);
    }
    
    const testUser = users[0];
    // Chuyển đổi ID sang number
    const userId = typeof testUser.id === 'bigint' ? Number(testUser.id) : parseInt(testUser.id);
    
    if (!userId || isNaN(userId)) {
      console.log('❌ User ID không hợp lệ:', testUser.id, typeof testUser.id);
      console.log('   Raw user:', testUser);
      return;
    }
    
    console.log(`\n👤 Testing với user: ${testUser.name || 'N/A'} (ID: ${userId})`);
    
    // Lưu avatar
    console.log('\n💾 Đang lưu avatar...');
    const updateResult = await query(
      'UPDATE users SET avatar = ? WHERE id = ?',
      [testAvatar, userId]
    );
    
    console.log('✅ Update query executed');
    console.log('   Affected rows:', updateResult.affectedRows);
    
    // Kiểm tra lại
    const updatedUser = await query(
      'SELECT id, name, LENGTH(avatar) as avatar_length, LEFT(avatar, 50) as avatar_preview FROM users WHERE id = ?',
      [userId]
    );
    
    if (updatedUser.length > 0) {
      const user = updatedUser[0];
      console.log('\n📊 Kết quả:');
      console.log('   User ID:', user.id);
      console.log('   Avatar length:', user.avatar_length || 0, 'bytes');
      console.log('   Avatar preview:', user.avatar_preview || 'NULL');
      
      if (user.avatar_length > 0) {
        console.log('\n✅ Avatar đã được lưu thành công vào database!');
      } else {
        console.log('\n❌ Avatar không được lưu (length = 0)');
      }
    }
    
  } catch (error) {
    console.error('❌ Lỗi khi test:', error.message);
    console.error('   Error code:', error.code);
    if (error.sqlMessage) {
      console.error('   SQL Message:', error.sqlMessage);
    }
    process.exit(1);
  }
}

testAvatarUpload()
  .then(() => {
    console.log('\n✨ Test hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

