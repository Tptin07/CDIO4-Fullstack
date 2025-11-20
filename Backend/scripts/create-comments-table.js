// Script để tạo bảng product_comments
import { query, testConnection } from '../config/database.js';

async function createCommentsTable() {
  try {
    console.log('🔧 Tạo bảng product_comments...\n');
    
    // Kiểm tra kết nối database
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Không thể kết nối database');
      process.exit(1);
    }

    // Kiểm tra bảng đã tồn tại chưa
    const tables = await query(
      `SELECT TABLE_NAME 
       FROM information_schema.TABLES 
       WHERE TABLE_SCHEMA = DATABASE() 
       AND TABLE_NAME = 'product_comments'`
    );

    const tablesArray = Array.isArray(tables) ? tables : [tables];
    if (tablesArray.length > 0) {
      console.log('⚠️ Bảng product_comments đã tồn tại!');
      console.log('💡 Nếu muốn tạo lại, hãy xóa bảng cũ trước.');
      process.exit(0);
    }

    // Tạo bảng
    console.log('📝 Đang tạo bảng product_comments...');
    await query(`
      CREATE TABLE product_comments (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        product_id BIGINT NOT NULL,
        user_id BIGINT NOT NULL,
        parent_id BIGINT DEFAULT NULL,
        content TEXT NOT NULL,
        status ENUM('pending', 'approved', 'rejected', 'deleted') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (parent_id) REFERENCES product_comments(id) ON DELETE CASCADE,
        INDEX idx_product (product_id),
        INDEX idx_user (user_id),
        INDEX idx_parent (parent_id),
        INDEX idx_status (status),
        INDEX idx_created (created_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ Đã tạo bảng product_comments thành công!');

    // Insert dữ liệu mẫu
    console.log('\n📦 Đang insert dữ liệu mẫu...');
    await query(`
      INSERT INTO product_comments (product_id, user_id, content, parent_id, status) VALUES
      (1, 2, 'Sản phẩm này rất tốt, tôi đã dùng và thấy hiệu quả ngay. Giao hàng cũng nhanh nữa!', NULL, 'approved'),
      (1, 3, 'Đúng vậy, tôi cũng thấy sản phẩm này rất hiệu quả. Giá cả cũng hợp lý.', NULL, 'approved'),
      (1, 4, 'Cảm ơn bạn đã chia sẻ. Tôi sẽ thử mua sản phẩm này.', 1, 'approved'),
      (2, 2, 'Vitamin C này chất lượng tốt, uống đều đặn thấy sức đề kháng tăng rõ rệt.', NULL, 'approved'),
      (2, 3, 'Bạn uống như thế nào vậy? Một ngày bao nhiêu viên?', 4, 'approved'),
      (2, 2, 'Tôi uống 1 viên mỗi ngày sau bữa sáng. Bạn có thể tham khảo hướng dẫn trên bao bì nhé.', 5, 'approved'),
      (3, 4, 'Khẩu trang này vừa vặn, không gây khó chịu khi đeo lâu. Chất lượng tốt!', NULL, 'approved'),
      (4, 3, 'Kem chống nắng này thấm nhanh, không nhờn dính. Rất phù hợp cho da dầu như tôi.', NULL, 'approved'),
      (4, 5, 'Bạn dùng SPF bao nhiêu? Có bị bết dính không?', 8, 'approved'),
      (5, 5, 'Máy đo huyết áp này rất chính xác và dễ sử dụng. Phù hợp để theo dõi sức khỏe tại nhà.', NULL, 'approved')
    `);

    console.log('✅ Đã insert dữ liệu mẫu thành công!');

    // Kiểm tra lại
    const countResults = await query(`SELECT COUNT(*) as total FROM product_comments`);
    const countResult = Array.isArray(countResults) ? countResults[0] : countResults;
    console.log(`\n📊 Tổng số comments: ${countResult?.total || 0}`);

    console.log('\n✅ Hoàn tất! Bảng product_comments đã sẵn sàng sử dụng.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi:', error.message);
    console.error('Error code:', error.code);
    if (error.code === 'ER_NO_SUCH_TABLE' && error.message.includes('products')) {
      console.error('\n⚠️ Lỗi: Bảng products chưa tồn tại. Vui lòng tạo bảng products trước.');
    } else if (error.code === 'ER_NO_SUCH_TABLE' && error.message.includes('users')) {
      console.error('\n⚠️ Lỗi: Bảng users chưa tồn tại. Vui lòng tạo bảng users trước.');
    }
    process.exit(1);
  }
}

createCommentsTable();

