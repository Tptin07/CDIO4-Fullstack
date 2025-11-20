// Script để migrate product_images và products table để hỗ trợ base64 images
import { query } from '../config/database.js';
import dotenv from 'dotenv';

dotenv.config();

async function migrateProductImages() {
  try {
    console.log('🔄 Đang cập nhật columns để hỗ trợ base64 images...\n');
    
    const dbName = process.env.DB_NAME || 'pharmacity_db';
    
    // Kiểm tra và cập nhật product_images.image_url
    console.log('1. Kiểm tra product_images.image_url...');
    const productImagesColumn = await query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'product_images' 
      AND COLUMN_NAME = 'image_url'
    `, [dbName]);

    if (productImagesColumn.length > 0) {
      const currentType = productImagesColumn[0].COLUMN_TYPE.toLowerCase();
      console.log(`   Column hiện tại: ${currentType}`);
      
      if (!currentType.includes('text')) {
        console.log('   ⬆️  Đang cập nhật từ VARCHAR sang TEXT...');
        await query(`
          ALTER TABLE product_images 
          MODIFY COLUMN image_url TEXT NOT NULL
        `);
        console.log('   ✅ Đã cập nhật product_images.image_url thành TEXT');
      } else {
        console.log('   ✅ product_images.image_url đã là TEXT');
      }
    } else {
      console.log('   ⚠️  Không tìm thấy column product_images.image_url');
    }
    
    // Kiểm tra và cập nhật products.image
    console.log('\n2. Kiểm tra products.image...');
    const productsImageColumn = await query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'image'
    `, [dbName]);

    if (productsImageColumn.length > 0) {
      const currentType = productsImageColumn[0].COLUMN_TYPE.toLowerCase();
      console.log(`   Column hiện tại: ${currentType}`);
      
      if (!currentType.includes('text')) {
        console.log('   ⬆️  Đang cập nhật từ VARCHAR sang TEXT...');
        await query(`
          ALTER TABLE products 
          MODIFY COLUMN image TEXT DEFAULT NULL
        `);
        console.log('   ✅ Đã cập nhật products.image thành TEXT');
      } else {
        console.log('   ✅ products.image đã là TEXT');
      }
    }
    
    // Kiểm tra và cập nhật products.cover_image
    console.log('\n3. Kiểm tra products.cover_image...');
    const productsCoverColumn = await query(`
      SELECT COLUMN_TYPE 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? 
      AND TABLE_NAME = 'products' 
      AND COLUMN_NAME = 'cover_image'
    `, [dbName]);

    if (productsCoverColumn.length > 0) {
      const currentType = productsCoverColumn[0].COLUMN_TYPE.toLowerCase();
      console.log(`   Column hiện tại: ${currentType}`);
      
      if (!currentType.includes('text')) {
        console.log('   ⬆️  Đang cập nhật từ VARCHAR sang TEXT...');
        await query(`
          ALTER TABLE products 
          MODIFY COLUMN cover_image TEXT DEFAULT NULL
        `);
        console.log('   ✅ Đã cập nhật products.cover_image thành TEXT');
      } else {
        console.log('   ✅ products.cover_image đã là TEXT');
      }
    }
    
    console.log('\n✨ Migration hoàn tất!');
    console.log('   Bây giờ có thể lưu được base64 string của ảnh vào database.');
  } catch (error) {
    console.error('❌ Lỗi khi migration:', error.message);
    process.exit(1);
  }
}

// Chạy migration
migrateProductImages()
  .then(() => {
    console.log('\n✅ Hoàn tất!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

