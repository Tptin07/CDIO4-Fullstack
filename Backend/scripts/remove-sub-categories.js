import { query } from '../config/database.js';
import { testConnection } from '../config/database.js';

/**
 * Script để xóa tất cả danh mục con, chỉ giữ lại danh mục cha
 */

async function removeSubCategories() {
  try {
    console.log('🚀 Bắt đầu xóa danh mục con...\n');

    // Kiểm tra kết nối database
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Không thể kết nối database');
      return;
    }

    // Đếm số danh mục con trước khi xóa
    const subCategoriesBefore = await query(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id IS NOT NULL'
    );
    console.log(`📊 Số danh mục con hiện có: ${subCategoriesBefore[0].count}\n`);

    if (subCategoriesBefore[0].count === 0) {
      console.log('✅ Không có danh mục con nào để xóa.\n');
      return;
    }

    // Xóa tất cả danh mục con
    console.log('🗑️  Đang xóa danh mục con...');
    const result = await query('DELETE FROM categories WHERE parent_id IS NOT NULL');
    console.log(`✅ Đã xóa ${result.affectedRows} danh mục con\n`);

    // Kiểm tra lại
    const subCategoriesAfter = await query(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id IS NOT NULL'
    );
    const parentCategories = await query(
      'SELECT COUNT(*) as count FROM categories WHERE parent_id IS NULL'
    );

    console.log('📊 Kết quả:');
    console.log(`   ✅ Danh mục cha: ${parentCategories[0].count}`);
    console.log(`   ✅ Danh mục con: ${subCategoriesAfter[0].count}`);
    console.log(`\n✅ Hoàn thành! Chỉ còn lại danh mục cha.\n`);

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
}

removeSubCategories()
  .then(() => {
    console.log('✅ Script hoàn thành');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script thất bại:', error);
    process.exit(1);
  });

