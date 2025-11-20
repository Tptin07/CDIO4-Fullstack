import { query } from '../config/database.js';
import { testConnection } from '../config/database.js';

/**
 * Script để thêm dữ liệu mẫu cho bảng categories
 * Chỉ thêm danh mục cha (không có danh mục con)
 */

async function insertSampleCategories() {
  try {
    console.log('🚀 Bắt đầu thêm dữ liệu mẫu cho danh mục...\n');

    // Kiểm tra kết nối database
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Không thể kết nối database');
      return;
    }

    // Kiểm tra xem đã có dữ liệu chưa
    const existingCategories = await query('SELECT COUNT(*) as count FROM categories');
    console.log(`📊 Số danh mục hiện có: ${existingCategories[0].count}\n`);

    // Danh sách danh mục cha (parent categories)
    const parentCategories = [
      {
        name: 'Thuốc kê đơn',
        slug: 'thuoc-ke-don',
        description: 'Các loại thuốc cần có đơn kê của bác sĩ',
        sort_order: 1
      },
      {
        name: 'Thuốc không kê đơn',
        slug: 'thuoc-khong-ke-don',
        description: 'Thuốc không cần đơn kê, có thể mua trực tiếp',
        sort_order: 2
      },
      {
        name: 'Thực phẩm chức năng',
        slug: 'thuc-pham-chuc-nang',
        description: 'Thực phẩm bổ sung dinh dưỡng và hỗ trợ sức khỏe',
        sort_order: 3
      },
      {
        name: 'Chăm sóc da',
        slug: 'cham-soc-da',
        description: 'Sản phẩm chăm sóc da mặt và cơ thể',
        sort_order: 4
      },
      {
        name: 'Khẩu trang',
        slug: 'khau-trang',
        description: 'Khẩu trang y tế và khẩu trang vải bảo vệ sức khỏe',
        sort_order: 5
      },
      {
        name: 'Thiết bị y tế',
        slug: 'thiet-bi-y-te',
        description: 'Thiết bị đo lường và chăm sóc sức khỏe tại nhà',
        sort_order: 6
      },
      {
        name: 'Vitamin & Khoáng chất',
        slug: 'vitamin-khoang-chat',
        description: 'Các loại vitamin và khoáng chất bổ sung dinh dưỡng',
        sort_order: 7
      },
      {
        name: 'Chăm sóc trẻ em',
        slug: 'cham-soc-tre-em',
        description: 'Sản phẩm chăm sóc sức khỏe dành cho trẻ em',
        sort_order: 8
      },
      {
        name: 'Chăm sóc người cao tuổi',
        slug: 'cham-soc-nguoi-cao-tuoi',
        description: 'Sản phẩm hỗ trợ sức khỏe cho người cao tuổi',
        sort_order: 9
      },
      {
        name: 'Dụng cụ y tế',
        slug: 'dung-cu-y-te',
        description: 'Các dụng cụ y tế cần thiết cho gia đình',
        sort_order: 10
      }
    ];

    // Thêm danh mục cha
    console.log('📁 Thêm danh mục cha...');
    let parentCount = 0;

    for (const category of parentCategories) {
      try {
        // Kiểm tra xem danh mục đã tồn tại chưa
        const existing = await query('SELECT id FROM categories WHERE slug = ?', [category.slug]);
        
        if (existing.length > 0) {
          console.log(`   ⏭️  Đã tồn tại: ${category.name}`);
        } else {
          await query(
            `INSERT INTO categories (name, slug, description, parent_id, status, sort_order) 
             VALUES (?, ?, ?, NULL, 'active', ?)`,
            [category.name, category.slug, category.description, category.sort_order]
          );
          parentCount++;
          console.log(`   ✅ Đã thêm: ${category.name}`);
        }
      } catch (error) {
        if (!error.message.includes('Duplicate entry')) {
          console.error(`   ❌ Lỗi khi thêm ${category.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Đã thêm ${parentCount} danh mục cha mới\n`);

    // Tóm tắt
    const totalCategories = await query('SELECT COUNT(*) as count FROM categories');
    const activeCategories = await query("SELECT COUNT(*) as count FROM categories WHERE status = 'active'");
    const parentCategoriesCount = await query('SELECT COUNT(*) as count FROM categories WHERE parent_id IS NULL');

    console.log('📊 Tóm tắt:');
    console.log(`   ✅ Tổng số danh mục: ${totalCategories[0].count}`);
    console.log(`   ✅ Danh mục đang hoạt động: ${activeCategories[0].count}`);
    console.log(`   ✅ Danh mục cha: ${parentCategoriesCount[0].count}`);
    console.log(`\n✅ Hoàn thành thêm dữ liệu mẫu cho danh mục cha!\n`);

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
}

insertSampleCategories()
  .then(() => {
    console.log('✅ Script hoàn thành');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script thất bại:', error);
    process.exit(1);
  });

