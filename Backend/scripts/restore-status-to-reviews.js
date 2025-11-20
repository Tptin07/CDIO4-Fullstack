// Script để khôi phục lại cột status vào bảng reviews
import { query, testConnection } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function restoreStatusColumn() {
  try {
    console.log('🔄 Đang khôi phục cột status vào bảng reviews...\n');
    
    // Kiểm tra kết nối
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Không thể kết nối database');
      process.exit(1);
    }

    // Kiểm tra cột status đã tồn tại chưa
    console.log('🔍 Kiểm tra cột status...');
    const columns = await query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'reviews' 
      AND COLUMN_NAME = 'status'
    `, [process.env.DB_NAME || 'pharmacity_db']);

    if (columns.length > 0) {
      console.log('⚠️  Cột status đã tồn tại trong bảng reviews. Không cần khôi phục.');
      return;
    }

    console.log('✅ Cột status chưa tồn tại. Đang thêm lại...');

    // Thêm lại cột status
    await query(`
      ALTER TABLE reviews 
      ADD COLUMN status ENUM('pending', 'approved', 'rejected') DEFAULT 'approved' 
      AFTER comment
    `);

    console.log('✅ Đã thêm lại cột status vào bảng reviews\n');

    // Cập nhật tất cả bình luận hiện có thành 'approved'
    console.log('🔄 Đang cập nhật tất cả bình luận hiện có thành status = "approved"...');
    const updateResult = await query(`
      UPDATE reviews 
      SET status = 'approved' 
      WHERE status IS NULL OR status = ''
    `);
    console.log(`✅ Đã cập nhật ${updateResult.affectedRows || 0} bình luận\n`);

    // Cập nhật VIEW nếu có
    console.log('🔄 Đang cập nhật VIEW v_product_reviews...');
    try {
      await query(`
        CREATE OR REPLACE VIEW v_product_reviews AS
        SELECT 
            r.id,
            r.product_id,
            r.user_id,
            r.rating,
            r.title,
            r.comment AS content,
            r.status,
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
        WHERE r.status = 'approved'
        ORDER BY r.created_at DESC
      `);
      console.log('✅ Đã cập nhật VIEW v_product_reviews\n');
    } catch (viewError) {
      console.log('⚠️  Không thể cập nhật VIEW (có thể VIEW chưa tồn tại):', viewError.message);
    }

    // Cập nhật VIEW v_product_rating_stats
    console.log('🔄 Đang cập nhật VIEW v_product_rating_stats...');
    try {
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
        WHERE status = 'approved'
        GROUP BY product_id
      `);
      console.log('✅ Đã cập nhật VIEW v_product_rating_stats\n');
    } catch (viewError) {
      console.log('⚠️  Không thể cập nhật VIEW (có thể VIEW chưa tồn tại):', viewError.message);
    }

    // Kiểm tra lại
    console.log('🔍 Kiểm tra lại cấu trúc bảng reviews...');
    const newColumns = await query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_DEFAULT
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'reviews'
      ORDER BY ORDINAL_POSITION
    `, [process.env.DB_NAME || 'pharmacity_db']);

    console.log('\n📋 Cấu trúc bảng reviews sau khi khôi phục:');
    newColumns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.DATA_TYPE}) ${col.COLUMN_DEFAULT ? `DEFAULT '${col.COLUMN_DEFAULT}'` : ''}`);
    });

    console.log('\n✨ Hoàn tất khôi phục cột status!');
    console.log('\n⚠️  Lưu ý: Bạn cần cập nhật lại code để sử dụng cột status.');
    
  } catch (error) {
    console.error('❌ Lỗi khi khôi phục cột status:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    process.exit(1);
  }
}

// Chạy script
restoreStatusColumn()
  .then(() => {
    console.log('\n✅ Script hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

