// Script để tạo VIEW cho bảng reviews
import { query, testConnection } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function createReviewsView() {
  try {
    console.log('🔄 Đang tạo VIEW cho bảng reviews...\n');
    
    // Kiểm tra kết nối
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Không thể kết nối database');
      process.exit(1);
    }

    // Tạo VIEW v_product_reviews
    console.log('📊 Đang tạo VIEW v_product_reviews...');
    await query(`
      CREATE OR REPLACE VIEW v_product_reviews AS
      SELECT 
          r.id,
          r.product_id,
          r.user_id,
          r.rating,
          r.title,
          r.comment AS content,
          r.created_at,
          r.updated_at,
          u.name AS user_name,
          u.avatar AS user_avatar,
          u.email AS user_email,
          p.name AS product_name,
          p.slug AS product_slug
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      INNER JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);
    console.log('✅ Đã tạo VIEW v_product_reviews\n');

    // Tạo VIEW v_product_rating_stats
    console.log('📊 Đang tạo VIEW v_product_rating_stats...');
    await query(`
      CREATE OR REPLACE VIEW v_product_rating_stats AS
      SELECT 
          product_id,
          COUNT(*) AS total_reviews,
          AVG(rating) AS avg_rating,
          SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS rating_5,
          SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS rating_4,
          SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS rating_3,
          SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS rating_2,
          SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS rating_1
      FROM reviews
      GROUP BY product_id
    `);
    console.log('✅ Đã tạo VIEW v_product_rating_stats\n');

    // Kiểm tra VIEW đã được tạo
    console.log('🔍 Kiểm tra VIEW đã được tạo...');
    const views = await query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.VIEWS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME IN ('v_product_reviews', 'v_product_rating_stats')
    `, [process.env.DB_NAME || 'pharmacity_db']);
    
    console.log(`✅ Đã tạo ${views.length} VIEW:`);
    views.forEach(view => {
      console.log(`   - ${view.TABLE_NAME}`);
    });

    // Test query VIEW
    console.log('\n🧪 Test query VIEW v_product_reviews...');
    const testResults = await query('SELECT COUNT(*) as count FROM v_product_reviews');
    const count = Array.isArray(testResults) ? testResults[0]?.count : testResults?.count;
    console.log(`✅ VIEW hoạt động tốt! Có ${count} bình luận đã được approved.\n`);

    console.log('✨ Hoàn tất tạo VIEW!');
    console.log('\n📝 Bạn có thể sử dụng VIEW như sau:');
    console.log('   SELECT * FROM v_product_reviews WHERE product_id = 1;');
    console.log('   SELECT * FROM v_product_rating_stats WHERE product_id = 1;');
    
  } catch (error) {
    console.error('❌ Lỗi khi tạo VIEW:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  }
}

// Chạy script
createReviewsView()
  .then(() => {
    console.log('\n✅ Script hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

