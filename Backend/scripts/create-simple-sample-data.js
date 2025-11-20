import { query } from '../config/database.js';

/**
 * Script đơn giản để tạo dữ liệu mẫu cho biểu đồ thống kê
 * Tạo ít dữ liệu nhưng đảm bảo có đủ để test
 */

async function createSimpleSampleData() {
  try {
    console.log('🚀 Bắt đầu tạo dữ liệu mẫu đơn giản...\n');

    // 1. Kiểm tra dữ liệu hiện có
    const users = await query('SELECT id FROM users WHERE role = ? LIMIT 1', ['customer']);
    const products = await query('SELECT id, name, price, image FROM products WHERE status = ? LIMIT 5', ['active']);
    const addresses = await query('SELECT id, user_id FROM addresses LIMIT 1');

    if (users.length === 0) {
      console.log('❌ Không có user nào. Vui lòng tạo user trước.');
      return;
    }

    if (products.length === 0) {
      console.log('❌ Không có sản phẩm nào. Vui lòng tạo sản phẩm trước.');
      return;
    }

    if (addresses.length === 0) {
      console.log('❌ Không có address nào. Vui lòng tạo address trước.');
      return;
    }

    const userId = users[0].id;
    const addressId = addresses[0].id;

    console.log(`✅ Đã tìm thấy user ID: ${userId}, address ID: ${addressId}`);
    console.log(`✅ Đã tìm thấy ${products.length} sản phẩm\n`);

    // 2. Tạo đơn hàng cho 8 tuần gần nhất
    console.log('📦 Tạo đơn hàng cho 8 tuần gần nhất...');
    const now = new Date();
    let weekOrderCount = 0;

    for (let week = 0; week < 8; week++) {
      const weekDate = new Date(now);
      weekDate.setDate(weekDate.getDate() - (week * 7));
      weekDate.setDate(weekDate.getDate() - 3); // Giữa tuần
      weekDate.setHours(10, 0, 0, 0);

      // Mỗi tuần tạo 3 đơn hàng
      for (let i = 0; i < 3; i++) {
        const orderDate = new Date(weekDate);
        orderDate.setDate(orderDate.getDate() + i);
        orderDate.setHours(10 + i, 0, 0, 0);

        const totalAmount = 200000 + (week * 50000) + (i * 20000); // Tăng dần
        const shippingFee = 30000;
        const discountAmount = 10000;
        const finalAmount = totalAmount + shippingFee - discountAmount;

        const orderCode = `ORD-W${week}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
          const result = await query(
            `INSERT INTO orders (
              order_code, user_id, address_id, total_amount, shipping_fee, 
              discount_amount, final_amount, payment_method, payment_status, 
              shipping_method, shipping_status, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              orderCode,
              userId,
              addressId,
              totalAmount,
              shippingFee,
              discountAmount,
              finalAmount,
              'COD',
              'paid',
              'Giao hàng nhanh',
              'delivered',
              'delivered',
              orderDate.toISOString().slice(0, 19).replace('T', ' '),
            ]
          );

          const orderId = result.insertId;

          // Tạo order_items (1-2 sản phẩm mỗi đơn)
          const numItems = Math.min(2, products.length);
          for (let j = 0; j < numItems; j++) {
            const product = products[j % products.length];
            const quantity = j + 1;
            const price = parseFloat(product.price);
            const subtotal = price * quantity;

            // Xử lý image
            let productImage = product.image || '/img/placeholder.jpg';
            if (productImage && (productImage.startsWith('data:') || productImage.length > 500)) {
              productImage = '/img/placeholder.jpg';
            }

            await query(
              `INSERT INTO order_items (
                order_id, product_id, product_name, product_image, price, quantity, subtotal
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                orderId,
                product.id,
                product.name,
                productImage,
                price,
                quantity,
                subtotal,
              ]
            );

            // Cập nhật sold_count
            await query('UPDATE products SET sold_count = sold_count + ? WHERE id = ?', [quantity, product.id]);
          }

          // Tạo timeline
          await query(
            `INSERT INTO order_timeline (order_id, status, label, description) 
             VALUES (?, ?, ?, ?)`,
            [orderId, 'delivered', 'Đã giao hàng', `Đơn hàng ${orderCode} đã được giao thành công`]
          );

          weekOrderCount++;
        } catch (error) {
          if (!error.message.includes('Duplicate entry')) {
            console.error(`   ⚠️  Lỗi: ${error.message}`);
          }
        }
      }
    }

    console.log(`✅ Đã tạo ${weekOrderCount} đơn hàng cho 8 tuần\n`);

    // 3. Tạo đơn hàng cho 12 tháng gần nhất
    console.log('📦 Tạo đơn hàng cho 12 tháng gần nhất...');
    let monthOrderCount = 0;

    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 15);
      monthDate.setHours(14, 0, 0, 0);

      // Mỗi tháng tạo 5 đơn hàng
      for (let i = 0; i < 5; i++) {
        const orderDate = new Date(monthDate);
        orderDate.setDate(monthDate.getDate() + (i * 5));
        orderDate.setHours(10 + i, 0, 0, 0);

        const totalAmount = 300000 + (month * 30000) + (i * 15000);
        const shippingFee = 30000;
        const discountAmount = 15000;
        const finalAmount = totalAmount + shippingFee - discountAmount;

        const orderCode = `ORD-M${month}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
          const result = await query(
            `INSERT INTO orders (
              order_code, user_id, address_id, total_amount, shipping_fee, 
              discount_amount, final_amount, payment_method, payment_status, 
              shipping_method, shipping_status, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              orderCode,
              userId,
              addressId,
              totalAmount,
              shippingFee,
              discountAmount,
              finalAmount,
              'COD',
              'paid',
              'Giao hàng nhanh',
              'delivered',
              'delivered',
              orderDate.toISOString().slice(0, 19).replace('T', ' '),
            ]
          );

          const orderId = result.insertId;

          // Tạo order_items
          const numItems = Math.min(2, products.length);
          for (let j = 0; j < numItems; j++) {
            const product = products[j % products.length];
            const quantity = j + 1;
            const price = parseFloat(product.price);
            const subtotal = price * quantity;

            let productImage = product.image || '/img/placeholder.jpg';
            if (productImage && (productImage.startsWith('data:') || productImage.length > 500)) {
              productImage = '/img/placeholder.jpg';
            }

            await query(
              `INSERT INTO order_items (
                order_id, product_id, product_name, product_image, price, quantity, subtotal
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                orderId,
                product.id,
                product.name,
                productImage,
                price,
                quantity,
                subtotal,
              ]
            );

            await query('UPDATE products SET sold_count = sold_count + ? WHERE id = ?', [quantity, product.id]);
          }

          await query(
            `INSERT INTO order_timeline (order_id, status, label, description) 
             VALUES (?, ?, ?, ?)`,
            [orderId, 'delivered', 'Đã giao hàng', `Đơn hàng ${orderCode} đã được giao thành công`]
          );

          monthOrderCount++;
        } catch (error) {
          if (!error.message.includes('Duplicate entry')) {
            console.error(`   ⚠️  Lỗi: ${error.message}`);
          }
        }
      }
    }

    console.log(`✅ Đã tạo ${monthOrderCount} đơn hàng cho 12 tháng\n`);

    // 4. Tạo đơn hàng cho 5 năm gần nhất
    console.log('📦 Tạo đơn hàng cho 5 năm gần nhất...');
    let yearOrderCount = 0;

    for (let year = 0; year < 5; year++) {
      const yearDate = new Date(now.getFullYear() - year, 6, 15); // Tháng 7
      yearDate.setHours(12, 0, 0, 0);

      // Mỗi năm tạo 10 đơn hàng
      for (let i = 0; i < 10; i++) {
        const orderDate = new Date(yearDate);
        orderDate.setMonth(yearDate.getMonth() + (i % 12));
        orderDate.setDate(15);
        orderDate.setHours(10 + (i % 12), 0, 0, 0);

        const totalAmount = 500000 + (year * 100000) + (i * 20000);
        const shippingFee = 30000;
        const discountAmount = 20000;
        const finalAmount = totalAmount + shippingFee - discountAmount;

        const orderCode = `ORD-Y${year}-${i}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        try {
          const result = await query(
            `INSERT INTO orders (
              order_code, user_id, address_id, total_amount, shipping_fee, 
              discount_amount, final_amount, payment_method, payment_status, 
              shipping_method, shipping_status, status, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              orderCode,
              userId,
              addressId,
              totalAmount,
              shippingFee,
              discountAmount,
              finalAmount,
              'COD',
              'paid',
              'Giao hàng nhanh',
              'delivered',
              'delivered',
              orderDate.toISOString().slice(0, 19).replace('T', ' '),
            ]
          );

          const orderId = result.insertId;

          // Tạo order_items
          const numItems = Math.min(2, products.length);
          for (let j = 0; j < numItems; j++) {
            const product = products[j % products.length];
            const quantity = j + 1;
            const price = parseFloat(product.price);
            const subtotal = price * quantity;

            let productImage = product.image || '/img/placeholder.jpg';
            if (productImage && (productImage.startsWith('data:') || productImage.length > 500)) {
              productImage = '/img/placeholder.jpg';
            }

            await query(
              `INSERT INTO order_items (
                order_id, product_id, product_name, product_image, price, quantity, subtotal
              ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
              [
                orderId,
                product.id,
                product.name,
                productImage,
                price,
                quantity,
                subtotal,
              ]
            );

            await query('UPDATE products SET sold_count = sold_count + ? WHERE id = ?', [quantity, product.id]);
          }

          await query(
            `INSERT INTO order_timeline (order_id, status, label, description) 
             VALUES (?, ?, ?, ?)`,
            [orderId, 'delivered', 'Đã giao hàng', `Đơn hàng ${orderCode} đã được giao thành công`]
          );

          yearOrderCount++;
        } catch (error) {
          if (!error.message.includes('Duplicate entry')) {
            console.error(`   ⚠️  Lỗi: ${error.message}`);
          }
        }
      }
    }

    console.log(`✅ Đã tạo ${yearOrderCount} đơn hàng cho 5 năm\n`);

    // 5. Cập nhật view_count cho sản phẩm
    console.log('👁️  Cập nhật view_count cho sản phẩm...');
    for (let i = 0; i < products.length; i++) {
      const viewCount = 500 + (i * 300) + Math.floor(Math.random() * 200);
      await query('UPDATE products SET view_count = ? WHERE id = ?', [viewCount, products[i].id]);
    }
    console.log(`✅ Đã cập nhật view_count cho ${products.length} sản phẩm\n`);

    // 6. Tạo cart items
    console.log('🛒 Tạo cart items...');
    await query('DELETE FROM cart'); // Xóa cart cũ

    let cartCount = 0;
    for (let i = 0; i < Math.min(3, products.length); i++) {
      try {
        await query(
          'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [userId, products[i].id, i + 1]
        );
        cartCount++;
      } catch (error) {
        // Ignore duplicate
      }
    }
    console.log(`✅ Đã tạo ${cartCount} cart items\n`);

    // 7. Tóm tắt
    console.log('📊 Tóm tắt dữ liệu:');
    const totalOrders = await query('SELECT COUNT(*) as count FROM orders WHERE status IN (?, ?, ?)', ['delivered', 'shipping', 'confirmed']);
    const totalRevenue = await query(
      `SELECT COALESCE(SUM(final_amount), 0) as total 
       FROM orders 
       WHERE status IN ('delivered', 'shipping', 'confirmed')`
    );
    const totalViews = await query('SELECT SUM(view_count) as total FROM products');
    const totalCartItems = await query('SELECT COUNT(*) as count FROM cart');

    console.log(`   ✅ Tổng đơn hàng: ${totalOrders[0].count}`);
    console.log(`   ✅ Tổng doanh thu: ${parseFloat(totalRevenue[0].total).toLocaleString('vi-VN')}đ`);
    console.log(`   ✅ Tổng lượt xem: ${parseInt(totalViews[0].total || 0).toLocaleString('vi-VN')}`);
    console.log(`   ✅ Tổng cart items: ${totalCartItems[0].count}`);
    console.log(`\n✅ Hoàn thành! Bây giờ bạn có thể test biểu đồ thống kê.\n`);

  } catch (error) {
    console.error('❌ Lỗi:', error);
    throw error;
  }
}

createSimpleSampleData()
  .then(() => {
    console.log('✅ Script hoàn thành');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script thất bại:', error);
    process.exit(1);
  });

