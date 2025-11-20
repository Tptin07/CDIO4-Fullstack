// Script để test API comments
import { query, testConnection } from '../config/database.js';

async function testComments() {
  try {
    console.log('🧪 Testing Comments API...\n');
    
    // Kiểm tra kết nối
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Không thể kết nối database');
      process.exit(1);
    }

    // Test với product_id = 1
    const productId = 1;
    console.log(`📦 Testing với product_id = ${productId}\n`);

    // Kiểm tra tổng số reviews
    const [countResult] = await query(
      `SELECT COUNT(*) as total 
       FROM reviews 
       WHERE product_id = ? AND status = 'approved'`,
      [productId]
    );
    console.log(`✅ Tổng số reviews approved: ${countResult.total}`);

    // Lấy danh sách reviews
    const reviews = await query(
      `SELECT 
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.title,
        r.comment AS content,
        r.status,
        r.created_at,
        u.name AS user_name,
        u.avatar AS user_avatar
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT 10`,
      [productId]
    );

    console.log(`\n📝 Danh sách reviews (${reviews.length} items):`);
    reviews.forEach((review, index) => {
      console.log(`\n${index + 1}. Review ID: ${review.id}`);
      console.log(`   User: ${review.user_name} (ID: ${review.user_id})`);
      console.log(`   Rating: ${review.rating} sao`);
      console.log(`   Title: ${review.title || '(không có)'}`);
      console.log(`   Content: ${review.content?.substring(0, 50)}...`);
      console.log(`   Status: ${review.status}`);
      console.log(`   Created: ${review.created_at}`);
    });

    // Test với product_id = 2
    console.log(`\n\n📦 Testing với product_id = 2\n`);
    const [countResult2] = await query(
      `SELECT COUNT(*) as total 
       FROM reviews 
       WHERE product_id = ? AND status = 'approved'`,
      [2]
    );
    console.log(`✅ Tổng số reviews approved: ${countResult2.total}`);

    const reviews2 = await query(
      `SELECT 
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.title,
        r.comment AS content,
        r.status,
        u.name AS user_name
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.status = 'approved'
      ORDER BY r.created_at DESC
      LIMIT 10`,
      [2]
    );

    console.log(`\n📝 Danh sách reviews (${reviews2.length} items):`);
    reviews2.forEach((review, index) => {
      console.log(`\n${index + 1}. Review ID: ${review.id}`);
      console.log(`   User: ${review.user_name} (ID: ${review.user_id})`);
      console.log(`   Rating: ${review.rating} sao`);
      console.log(`   Title: ${review.title || '(không có)'}`);
      console.log(`   Content: ${review.content?.substring(0, 50)}...`);
    });

    console.log('\n✅ Test hoàn tất!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

testComments();







