// Script để kiểm tra và cập nhật categories của posts
import { query, testConnection } from '../config/database.js';

async function checkAndFixCategories() {
  try {
    console.log('🔍 Kiểm tra categories của posts...\n');
    
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Không thể kết nối database');
      process.exit(1);
    }

    // Lấy tất cả categories hiện tại
    const categories = await query(
      `SELECT DISTINCT category FROM posts WHERE status = 'published'`
    );
    console.log('📋 Categories hiện tại trong DB:');
    categories.forEach(c => console.log(`   - ${c.category}`));

    // Frontend categories
    const frontendCats = ['Dinh dưỡng', 'Bệnh lý', 'Thuốc', 'Mẹo sống khỏe', 'Tin tức'];
    console.log('\n📋 Categories frontend cần:');
    frontendCats.forEach(c => console.log(`   - ${c}`));

    // Kiểm tra xem có posts nào không match không
    const allPosts = await query(
      `SELECT id, title, category FROM posts WHERE status = 'published'`
    );
    
    console.log('\n📝 Posts hiện tại:');
    allPosts.forEach(p => {
      const match = frontendCats.includes(p.category);
      console.log(`   ${match ? '✅' : '⚠️ '} [${p.id}] ${p.title} - Category: "${p.category}"`);
    });

    console.log('\n✅ Kiểm tra hoàn tất!');
    console.log('💡 Nếu có posts không match, cần cập nhật category trong database');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
  process.exit(0);
}

checkAndFixCategories();

