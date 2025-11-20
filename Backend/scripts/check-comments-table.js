// Script để kiểm tra xem bảng product_comments có tồn tại không
import { query, testConnection } from '../config/database.js';

async function checkCommentsTable() {
  try {
    console.log('🔍 Kiểm tra bảng product_comments...\n');
    
    // Kiểm tra kết nối database
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Không thể kết nối database');
      process.exit(1);
    }

    // Kiểm tra bảng có tồn tại không
    try {
      const tables = await query(
        `SELECT TABLE_NAME 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'product_comments'`
      );

      const tablesArray = Array.isArray(tables) ? tables : [tables];
      if (tablesArray.length === 0) {
        console.log('❌ Bảng product_comments CHƯA TỒN TẠI!');
        console.log('\n💡 Giải pháp:');
        console.log('   1. Chạy file migrate_comments_table.sql');
        console.log('   2. Hoặc import lại file schema.sql');
        process.exit(1);
      }

      console.log('✅ Bảng product_comments đã tồn tại');

      // Kiểm tra số lượng comments
      const countResults = await query(
        `SELECT COUNT(*) as total FROM product_comments`
      );
      const countResult = Array.isArray(countResults) ? countResults[0] : countResults;
      console.log(`📊 Tổng số comments: ${countResult?.total || 0}`);

      // Kiểm tra comments approved
      const approvedResults = await query(
        `SELECT COUNT(*) as total 
         FROM product_comments 
         WHERE status = 'approved' AND parent_id IS NULL`
      );
      const approvedCount = Array.isArray(approvedResults) ? approvedResults[0] : approvedResults;
      console.log(`✅ Comments approved (parent): ${approvedCount?.total || 0}`);

      // Kiểm tra comments theo product
      const [productComments] = await query(
        `SELECT product_id, COUNT(*) as count 
         FROM product_comments 
         WHERE status = 'approved' AND parent_id IS NULL
         GROUP BY product_id
         LIMIT 5`
      );
      
      if (productComments.length > 0) {
        console.log('\n📦 Comments theo sản phẩm:');
        productComments.forEach(pc => {
          console.log(`   Product ${pc.product_id}: ${pc.count} comments`);
        });
      }

      console.log('\n✅ Kiểm tra hoàn tất!');
      process.exit(0);
    } catch (error) {
      if (error.code === 'ER_NO_SUCH_TABLE') {
        console.log('❌ Bảng product_comments CHƯA TỒN TẠI!');
        console.log('\n💡 Giải pháp:');
        console.log('   1. Chạy file migrate_comments_table.sql');
        console.log('   2. Hoặc import lại file schema.sql');
        process.exit(1);
      }
      throw error;
    }
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error('Error code:', error.code);
    process.exit(1);
  }
}

checkCommentsTable();

