import { query } from '../config/database.js';

/**
 * Script để insert dữ liệu mẫu cho thống kê
 * Chạy: node Backend/scripts/insert-sample-statistics-data.js
 */

async function insertSampleData() {
  try {
    console.log('🚀 Bắt đầu insert dữ liệu mẫu cho thống kê...\n');

    // 1. Lấy danh sách users và products hiện có
    const users = await query('SELECT id FROM users WHERE role = ?', ['customer']);
    const products = await query('SELECT id FROM products WHERE status = ?', ['active']);
    const addresses = await query('SELECT id, user_id FROM addresses');

    if (users.length === 0 || products.length === 0 || addresses.length === 0) {
      console.log('❌ Cần có ít nhất 1 user, 1 product và 1 address trong database');
      console.log('   Vui lòng chạy schema.sql trước để tạo dữ liệu cơ bản');
      return;
    }

    console.log(`✅ Tìm thấy ${users.length} users, ${products.length} products, ${addresses.length} addresses\n`);

    // 2. Tạo các đơn hàng với ngày tháng khác nhau
    console.log('📦 Đang tạo đơn hàng mẫu...');
    
    const orders = [];
    const now = new Date();
    
    // Tạo đơn hàng cho 8 tuần gần nhất (cho biểu đồ tuần)
    for (let week = 0; week < 8; week++) {
      const weekDate = new Date(now);
      weekDate.setDate(weekDate.getDate() - (week * 7));
      
      // Mỗi tuần tạo 2-5 đơn hàng
      const ordersPerWeek = Math.floor(Math.random() * 4) + 2;
      for (let i = 0; i < ordersPerWeek; i++) {
        const orderDate = new Date(weekDate);
        orderDate.setDate(orderDate.getDate() - Math.floor(Math.random() * 7));
        orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        const user = users[Math.floor(Math.random() * users.length)];
        const address = addresses.find(a => a.user_id === user.id) || addresses[0];
        const statuses = ['delivered', 'shipping', 'confirmed'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const totalAmount = Math.floor(Math.random() * 500000) + 100000; // 100k - 600k
        const shippingFee = 30000;
        const discountAmount = Math.floor(Math.random() * 50000);
        const finalAmount = totalAmount + shippingFee - discountAmount;
        
        // Tạo order_code unique với timestamp và random
        const orderCode = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}${Math.floor(Math.random() * 10000)}`;
        
        orders.push({
          orderCode,
          userId: user.id,
          addressId: address.id,
          totalAmount,
          shippingFee,
          discountAmount,
          finalAmount,
          status,
          paymentStatus: status === 'delivered' ? 'paid' : 'pending',
          shippingStatus: status,
          paymentMethod: ['COD', 'bank_transfer', 'credit_card'][Math.floor(Math.random() * 3)],
          shippingMethod: 'Giao hàng nhanh',
          createdAt: orderDate.toISOString().slice(0, 19).replace('T', ' '),
        });
      }
    }
    
    // Tạo đơn hàng cho 12 tháng gần nhất (cho biểu đồ tháng)
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - month, 1);
      
      // Mỗi tháng tạo 5-15 đơn hàng
      const ordersPerMonth = Math.floor(Math.random() * 11) + 5;
      for (let i = 0; i < ordersPerMonth; i++) {
        const dayInMonth = Math.floor(Math.random() * 28) + 1;
        const orderDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), dayInMonth);
        orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        const user = users[Math.floor(Math.random() * users.length)];
        const address = addresses.find(a => a.user_id === user.id) || addresses[0];
        const statuses = ['delivered', 'shipping', 'confirmed'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const totalAmount = Math.floor(Math.random() * 800000) + 150000; // 150k - 950k
        const shippingFee = 30000;
        const discountAmount = Math.floor(Math.random() * 80000);
        const finalAmount = totalAmount + shippingFee - discountAmount;
        
        // Tạo order_code unique với timestamp và random
        const orderCode = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}${Math.floor(Math.random() * 10000)}`;
        
        orders.push({
          orderCode,
          userId: user.id,
          addressId: address.id,
          totalAmount,
          shippingFee,
          discountAmount,
          finalAmount,
          status,
          paymentStatus: status === 'delivered' ? 'paid' : 'pending',
          shippingStatus: status,
          paymentMethod: ['COD', 'bank_transfer', 'credit_card'][Math.floor(Math.random() * 3)],
          shippingMethod: 'Giao hàng nhanh',
          createdAt: orderDate.toISOString().slice(0, 19).replace('T', ' '),
        });
      }
    }
    
    // Tạo đơn hàng cho 5 năm gần nhất (cho biểu đồ năm)
    for (let year = 0; year < 5; year++) {
      const yearDate = new Date(now.getFullYear() - year, 0, 1);
      
      // Mỗi năm tạo 20-50 đơn hàng
      const ordersPerYear = Math.floor(Math.random() * 31) + 20;
      for (let i = 0; i < ordersPerYear; i++) {
        const dayInYear = Math.floor(Math.random() * 365);
        const orderDate = new Date(yearDate);
        orderDate.setDate(orderDate.getDate() + dayInYear);
        orderDate.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60));
        
        const user = users[Math.floor(Math.random() * users.length)];
        const address = addresses.find(a => a.user_id === user.id) || addresses[0];
        const statuses = ['delivered', 'shipping', 'confirmed'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        const totalAmount = Math.floor(Math.random() * 1000000) + 200000; // 200k - 1.2M
        const shippingFee = 30000;
        const discountAmount = Math.floor(Math.random() * 100000);
        const finalAmount = totalAmount + shippingFee - discountAmount;
        
        // Tạo order_code unique với timestamp và random
        const orderCode = `ORD${Date.now()}${Math.floor(Math.random() * 10000)}${Math.floor(Math.random() * 10000)}`;
        
        orders.push({
          orderCode,
          userId: user.id,
          addressId: address.id,
          totalAmount,
          shippingFee,
          discountAmount,
          finalAmount,
          status,
          paymentStatus: status === 'delivered' ? 'paid' : 'pending',
          shippingStatus: status,
          paymentMethod: ['COD', 'bank_transfer', 'credit_card'][Math.floor(Math.random() * 3)],
          shippingMethod: 'Giao hàng nhanh',
          createdAt: orderDate.toISOString().slice(0, 19).replace('T', ' '),
        });
      }
    }

    console.log(`   Tạo ${orders.length} đơn hàng mẫu`);

    // Insert orders
    let orderCount = 0;
    for (const order of orders) {
      try {
        const result = await query(
          `INSERT INTO orders (
            order_code, user_id, address_id, total_amount, shipping_fee, 
            discount_amount, final_amount, payment_method, payment_status, 
            shipping_method, shipping_status, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            order.orderCode,
            order.userId,
            order.addressId,
            order.totalAmount,
            order.shippingFee,
            order.discountAmount,
            order.finalAmount,
            order.paymentMethod,
            order.paymentStatus,
            order.shippingMethod,
            order.shippingStatus,
            order.status,
            order.createdAt,
          ]
        );

        const orderId = result.insertId;

        // Tạo order_items cho mỗi đơn hàng (1-3 sản phẩm)
        const numItems = Math.floor(Math.random() * 3) + 1;
        const selectedProducts = [];
        for (let i = 0; i < numItems; i++) {
          let product;
          do {
            product = products[Math.floor(Math.random() * products.length)];
          } while (selectedProducts.includes(product.id));
          selectedProducts.push(product.id);

          const productInfo = await query('SELECT name, image, price FROM products WHERE id = ?', [product.id]);
          if (productInfo.length === 0) continue;

          const quantity = Math.floor(Math.random() * 5) + 1;
          const price = parseFloat(productInfo[0].price);
          const subtotal = price * quantity;

          // Xử lý image: nếu là base64 thì dùng placeholder, nếu là URL thì giữ nguyên
          let productImage = productInfo[0].image || '/img/placeholder.jpg';
          if (productImage && productImage.startsWith('data:')) {
            productImage = '/img/placeholder.jpg';
          }
          // Giới hạn độ dài image URL
          if (productImage && productImage.length > 500) {
            productImage = '/img/placeholder.jpg';
          }

          await query(
            `INSERT INTO order_items (
              order_id, product_id, product_name, product_image, price, quantity, subtotal
            ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              orderId,
              product.id,
              productInfo[0].name,
              productImage,
              price,
              quantity,
              subtotal,
            ]
          );

          // Cập nhật sold_count cho sản phẩm
          await query('UPDATE products SET sold_count = sold_count + ? WHERE id = ?', [quantity, product.id]);
        }

        // Tạo timeline entry
        await query(
          `INSERT INTO order_timeline (order_id, status, label, description) 
           VALUES (?, ?, ?, ?)`,
          [
            orderId,
            order.status,
            order.status === 'delivered' ? 'Đã giao hàng' : 
            order.status === 'shipping' ? 'Đang giao hàng' : 
            order.status === 'confirmed' ? 'Đã xác nhận' : 'Chờ xử lý',
            `Đơn hàng ${order.orderCode} - ${order.status}`,
          ]
        );

        orderCount++;
      } catch (error) {
        console.error(`   ⚠️  Lỗi khi tạo đơn hàng ${order.orderCode}:`, error.message);
      }
    }

    console.log(`✅ Đã tạo ${orderCount} đơn hàng thành công\n`);

    // 3. Cập nhật view_count cho sản phẩm (để có dữ liệu cho biểu đồ views)
    console.log('👁️  Đang cập nhật view_count cho sản phẩm...');
    
    for (const product of products) {
      const viewCount = Math.floor(Math.random() * 5000) + 100; // 100 - 5100 views
      await query('UPDATE products SET view_count = ? WHERE id = ?', [viewCount, product.id]);
    }
    
    console.log(`✅ Đã cập nhật view_count cho ${products.length} sản phẩm\n`);

    // 4. Tạo cart items (để có dữ liệu cho favorite products)
    console.log('🛒 Đang tạo cart items (sản phẩm yêu thích)...');
    
    // Xóa cart cũ
    await query('DELETE FROM cart');
    
    let cartCount = 0;
    // Mỗi user thêm 1-3 sản phẩm vào cart
    for (const user of users) {
      const numCartItems = Math.floor(Math.random() * 3) + 1;
      const selectedProducts = [];
      
      for (let i = 0; i < numCartItems; i++) {
        let product;
        do {
          product = products[Math.floor(Math.random() * products.length)];
        } while (selectedProducts.includes(product.id));
        selectedProducts.push(product.id);

        const quantity = Math.floor(Math.random() * 3) + 1;
        
        try {
          await query(
            'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
            [user.id, product.id, quantity]
          );
          cartCount++;
        } catch (error) {
          // Ignore duplicate key errors
          if (!error.message.includes('Duplicate entry')) {
            console.error(`   ⚠️  Lỗi khi thêm vào cart:`, error.message);
          }
        }
      }
    }
    
    console.log(`✅ Đã tạo ${cartCount} cart items\n`);

    // 5. Tóm tắt
    console.log('📊 Tóm tắt dữ liệu đã tạo:');
    const totalOrders = await query('SELECT COUNT(*) as count FROM orders');
    const totalRevenue = await query(
      `SELECT COALESCE(SUM(final_amount), 0) as total 
       FROM orders 
       WHERE status IN ('delivered', 'shipping', 'confirmed')`
    );
    const totalViews = await query('SELECT SUM(view_count) as total FROM products');
    const totalCartItems = await query('SELECT COUNT(*) as count FROM cart');
    
    console.log(`   - Tổng đơn hàng: ${totalOrders[0].count}`);
    console.log(`   - Tổng doanh thu: ${parseFloat(totalRevenue[0].total).toLocaleString('vi-VN')}đ`);
    console.log(`   - Tổng lượt xem: ${parseInt(totalViews[0].total || 0).toLocaleString('vi-VN')}`);
    console.log(`   - Tổng cart items: ${totalCartItems[0].count}`);
    
    console.log('\n✅ Hoàn thành! Bây giờ bạn có thể test biểu đồ thống kê.');
    console.log('   Vui lòng vào Admin Dashboard > Báo cáo thống kê để xem kết quả.\n');

  } catch (error) {
    console.error('❌ Lỗi khi insert dữ liệu mẫu:', error);
    throw error;
  }
}

// Chạy script
insertSampleData()
  .then(() => {
    console.log('✅ Script hoàn thành');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script thất bại:', error);
    process.exit(1);
  });

