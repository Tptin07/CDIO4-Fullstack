import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function testUpdateProfile() {
  try {
    console.log('🧪 Testing profile update functionality...\n');
    
    // Lấy một user để test
    const users = await query('SELECT id, name, email, phone, LENGTH(avatar) as avatar_length FROM users LIMIT 1');
    
    if (users.length === 0) {
      console.log('❌ Không có user nào trong database');
      return;
    }
    
    const testUser = users[0];
    console.log('📋 User test:', {
      id: testUser.id,
      name: testUser.name,
      email: testUser.email,
      phone: testUser.phone,
      avatar_length: testUser.avatar_length || 0
    });
    
    // Test 1: Update phone
    console.log('\n🧪 Test 1: Update phone...');
    const newPhone = '0987654321';
    await query('UPDATE users SET phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [newPhone, testUser.id]);
    const afterPhone = await query('SELECT phone FROM users WHERE id = ?', [testUser.id]);
    console.log('   Phone sau khi update:', afterPhone[0].phone);
    if (afterPhone[0].phone === newPhone) {
      console.log('   ✅ Phone được cập nhật thành công');
    } else {
      console.log('   ❌ Phone KHÔNG được cập nhật');
    }
    
    // Test 2: Update phone thành null
    console.log('\n🧪 Test 2: Update phone thành null...');
    await query('UPDATE users SET phone = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [testUser.id]);
    const afterNull = await query('SELECT phone FROM users WHERE id = ?', [testUser.id]);
    console.log('   Phone sau khi set null:', afterNull[0].phone);
    if (afterNull[0].phone === null) {
      console.log('   ✅ Phone được set null thành công');
    } else {
      console.log('   ❌ Phone KHÔNG được set null');
    }
    
    // Test 3: Update avatar (test với base64 nhỏ)
    console.log('\n🧪 Test 3: Update avatar...');
    const testAvatar = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    await query('UPDATE users SET avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [testAvatar, testUser.id]);
    const afterAvatar = await query('SELECT LENGTH(avatar) as avatar_length FROM users WHERE id = ?', [testUser.id]);
    console.log('   Avatar length sau khi update:', afterAvatar[0].avatar_length);
    if (afterAvatar[0].avatar_length > 0) {
      console.log('   ✅ Avatar được cập nhật thành công');
    } else {
      console.log('   ❌ Avatar KHÔNG được cập nhật');
    }
    
    // Test 4: Update cả phone và avatar cùng lúc
    console.log('\n🧪 Test 4: Update cả phone và avatar cùng lúc...');
    const testPhone = '0123456789';
    await query('UPDATE users SET phone = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [testPhone, testAvatar, testUser.id]);
    const afterBoth = await query('SELECT phone, LENGTH(avatar) as avatar_length FROM users WHERE id = ?', [testUser.id]);
    console.log('   Phone:', afterBoth[0].phone);
    console.log('   Avatar length:', afterBoth[0].avatar_length);
    if (afterBoth[0].phone === testPhone && afterBoth[0].avatar_length > 0) {
      console.log('   ✅ Cả phone và avatar đều được cập nhật thành công');
    } else {
      console.log('   ❌ Có vấn đề khi cập nhật phone hoặc avatar');
    }
    
    // Khôi phục dữ liệu ban đầu
    console.log('\n🔄 Khôi phục dữ liệu ban đầu...');
    await query('UPDATE users SET phone = ?, avatar = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [testUser.phone, null, testUser.id]);
    console.log('   ✅ Đã khôi phục');
    
    console.log('\n✨ Test hoàn tất!');
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testUpdateProfile()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

