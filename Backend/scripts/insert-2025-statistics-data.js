import { query } from '../config/database.js';

/**
 * Script để insert dữ liệu mẫu cho thống kê năm 2025
 * Chạy: node Backend/scripts/insert-2025-statistics-data.js
 */

async function insert2025Data() {
  try {
    console.log('🚀 Bắt đầu insert dữ liệu mẫu cho năm 2025...\n');

    // 1. Lấy danh sách users và products hiện có
    const users = await query('SELECT id FROM users WHERE role = ?', ['customer']);
    const products = await query('SELECT id, name, price, image FROM products WHERE status = ?', ['active']);
    const addresses = await query('SELECT id, user_id FROM addresses');

    if (users.length === 0 || products.length === 0 || addresses.length === 0) {
      console.log('❌ Cần có ít nhất 1 user, 1 product và 1 address trong database');
      console.log('   Vui lòng chạy schema.sql trước để tạo dữ liệu cơ bản');
      return;
    }

    console.log(`✅ Tìm thấy ${users.length} users, ${products.length} products, ${addresses.length} addresses\n`);

    // 2. Tạo các đơn hàng cho năm 2025
    console.log('📦 Đang tạo đơn hàng mẫu cho năm 2025...');
    
    const orders = [];
    const year2025 = 2025;
    
    // Tạo đơn hàng cho 12 tháng trong năm 2025
    for (let month = 0; month < 12; month++) {
      const monthDate = new Date(year2025, month, 1);
      const daysInMonth = new Date(year2025, month + 1, 0).getDate();
      
      // Mỗi tháng tạo 8-25 đơn hàng (phân bố đều trong tháng)
      const ordersPerMonth = Math.floor(Math.random() * 18) + 8;
      
      for (let i = 0; i < ordersPerMonth; i++) {
        const dayInMonth = Math.floor(Math.random() * daysInMonth) + 1;
        const orderDate = new Date(year2025, month, dayInMonth);
        orderDate.setHours(
          Math.floor(Math.random() * 24), 
          Math.floor(Math.random() * 60),
          Math.floor(Math.random() * 60)
        );
        
        const user = users[Math.floor(Math.random() * users.length)];
        const address = addresses.find(a => a.user_id === user.id) || addresses[0];
        
        // Phân bố trạng thái: 60% delivered, 20% shipping, 15% confirmed, 5% pending
        const rand = Math.random();
        let status;
        if (rand < 0.6) status = 'delivered';
        else if (rand < 0.8) status = 'shipping';
        else if (rand < 0.95) status = 'confirmed';
        else status = 'pending';
        
        const totalAmount = Math.floor(Math.random() * 1000000) + 150000; // 150k - 1.15M
        const shippingFee = totalAmount >= 200000 ? 0 : 30000;
        const discountAmount = Math.floor(Math.random() * 100000);
        const finalAmount = totalAmount + shippingFee - discountAmount;
        
        // Tạo order_code unique
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 100000);
        const orderCode = `ORD2025${String(month + 1).padStart(2, '0')}${String(dayInMonth).padStart(2, '0')}${random}`;
        
        orders.push({
          orderCode,
          userId: user.id,
          addressId: address.id,
          totalAmount,
          shippingFee,
          discountAmount,
          finalAmount,
          status,
          paymentStatus: status === 'delivered' ? 'paid' : (status === 'pending' ? 'pending' : 'paid'),
          shippingStatus: status === 'delivered' ? 'delivered' : (status === 'shipping' ? 'shipping' : 'pending'),
          paymentMethod: ['COD', 'bank_transfer', 'credit_card', 'e_wallet'][Math.floor(Math.random() * 4)],
          shippingMethod: 'Giao hàng nhanh',
          createdAt: orderDate.toISOString().slice(0, 19).replace('T', ' '),
        });
      }
    }
    
    // Tạo thêm đơn hàng cho các tuần trong năm 2025 (để có dữ liệu cho biểu đồ tuần)
    console.log('📅 Đang tạo đơn hàng theo tuần cho năm 2025...');
    
    // Tính số tuần trong năm 2025
    const startOfYear = new Date(year2025, 0, 1);
    const endOfYear = new Date(year2025, 11, 31);
    const weeksInYear = Math.ceil((endOfYear - startOfYear) / (7 * 24 * 60 * 60 * 1000));
    
    for (let week = 0; week < weeksInYear; week++) {
      const weekStart = new Date(startOfYear);
      weekStart.setDate(weekStart.getDate() + (week * 7));
      
      // Mỗi tuần tạo 2-6 đơn hàng
      const ordersPerWeek = Math.floor(Math.random() * 5) + 2;
      
      for (let i = 0; i < ordersPerWeek; i++) {
        const dayInWeek = Math.floor(Math.random() * 7);
        const orderDate = new Date(weekStart);
        orderDate.setDate(orderDate.getDate() + dayInWeek);
        orderDate.setHours(
          Math.floor(Math.random() * 24), 
          Math.floor(Math.random() * 60),
          Math.floor(Math.random() * 60)
        );
        
        // Đảm bảo không vượt quá năm 2025
        if (orderDate.getFullYear() > year2025) continue;
        
        const user = users[Math.floor(Math.random() * users.length)];
        const address = addresses.find(a => a.user_id === user.id) || addresses[0];
        
        const rand = Math.random();
        let status;
        if (rand < 0.6) status = 'delivered';
        else if (rand < 0.8) status = 'shipping';
        else if (rand < 0.95) status = 'confirmed';
        else status = 'pending';
        
        const totalAmount = Math.floor(Math.random() * 800000) + 100000; // 100k - 900k
        const shippingFee = totalAmount >= 200000 ? 0 : 30000;
        const discountAmount = Math.floor(Math.random() * 80000);
        const finalAmount = totalAmount + shippingFee - discountAmount;
        
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 100000);
        const month = orderDate.getMonth() + 1;
        const day = orderDate.getDate();
        const orderCode = `ORD2025${String(month).padStart(2, '0')}${String(day).padStart(2, '0')}W${random}`;
        
        orders.push({
          orderCode,
          userId: user.id,
          addressId: address.id,
          totalAmount,
          shippingFee,
          discountAmount,
          finalAmount,
          status,
          paymentStatus: status === 'delivered' ? 'paid' : (status === 'pending' ? 'pending' : 'paid'),
          shippingStatus: status === 'delivered' ? 'delivered' : (status === 'shipping' ? 'shipping' : 'pending'),
          paymentMethod: ['COD', 'bank_transfer', 'credit_card', 'e_wallet'][Math.floor(Math.random() * 4)],
          shippingMethod: 'Giao hàng nhanh',
          createdAt: orderDate.toISOString().slice(0, 19).replace('T', ' '),
        });
      }
    }

    console.log(`   Tạo ${orders.length} đơn hàng mẫu cho năm 2025`);

    // Insert orders
    let orderCount = 0;
    let skippedCount = 0;
    
    for (const order of orders) {
      try {
        // Kiểm tra order_code đã tồn tại chưa
        const existing = await query('SELECT id FROM orders WHERE order_code = ?', [order.orderCode]);
        if (existing.length > 0) {
          // Tạo order_code mới nếu trùng
          order.orderCode = `ORD2025${Date.now()}${Math.floor(Math.random() * 10000)}`;
        }
        
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

        // Tạo order_items cho mỗi đơn hàng (1-4 sản phẩm)
        const numItems = Math.floor(Math.random() * 4) + 1;
        const selectedProducts = [];
        
        for (let i = 0; i < numItems; i++) {
          let product;
          let attempts = 0;
          do {
            product = products[Math.floor(Math.random() * products.length)];
            attempts++;
            if (attempts > 10) break; // Tránh vòng lặp vô hạn
          } while (selectedProducts.includes(product.id));
          
          if (attempts > 10) continue;
          selectedProducts.push(product.id);

          const quantity = Math.floor(Math.random() * 5) + 1;
          const price = parseFloat(product.price);
          const subtotal = price * quantity;

          // Xử lý image
          let productImage = product.image || '/img/placeholder.jpg';
          if (productImage && productImage.startsWith('data:')) {
            productImage = '/img/placeholder.jpg';
          }
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
              product.name,
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
        const statusLabels = {
          'delivered': 'Đã giao hàng',
          'shipping': 'Đang giao hàng',
          'confirmed': 'Đã xác nhận',
          'pending': 'Chờ xử lý',
          'cancelled': 'Đã hủy',
        };
        
        await query(
          `INSERT INTO order_timeline (order_id, status, label, description, created_at) 
           VALUES (?, ?, ?, ?, ?)`,
          [
            orderId,
            order.status,
            statusLabels[order.status] || 'Chờ xử lý',
            `Đơn hàng ${order.orderCode} - ${statusLabels[order.status] || order.status}`,
            order.createdAt,
          ]
        );

        orderCount++;
      } catch (error) {
        if (error.message.includes('Duplicate entry')) {
          skippedCount++;
        } else {
          console.error(`   ⚠️  Lỗi khi tạo đơn hàng ${order.orderCode}:`, error.message);
        }
      }
    }

    console.log(`✅ Đã tạo ${orderCount} đơn hàng thành công`);
    if (skippedCount > 0) {
      console.log(`   ⚠️  Đã bỏ qua ${skippedCount} đơn hàng (trùng lặp)\n`);
    } else {
      console.log('');
    }

    // 3. Cập nhật view_count cho sản phẩm (để có dữ liệu cho biểu đồ views)
    console.log('👁️  Đang cập nhật view_count cho sản phẩm...');
    
    for (const product of products) {
      // Tạo view_count ngẫu nhiên từ 500-8000 views
      const viewCount = Math.floor(Math.random() * 7500) + 500;
      await query('UPDATE products SET view_count = COALESCE(view_count, 0) + ? WHERE id = ?', [viewCount, product.id]);
    }
    
    console.log(`✅ Đã cập nhật view_count cho ${products.length} sản phẩm\n`);

    // 4. Tạo cart items (để có dữ liệu cho favorite products)
    console.log('🛒 Đang tạo cart items (sản phẩm yêu thích)...');
    
    // Xóa cart cũ (tùy chọn - comment nếu muốn giữ lại)
    // await query('DELETE FROM cart');
    
    let cartCount = 0;
    // Mỗi user thêm 1-4 sản phẩm vào cart
    for (const user of users) {
      const numCartItems = Math.floor(Math.random() * 4) + 1;
      const selectedProducts = [];
      
      for (let i = 0; i < numCartItems; i++) {
        let product;
        let attempts = 0;
        do {
          product = products[Math.floor(Math.random() * products.length)];
          attempts++;
          if (attempts > 10) break;
        } while (selectedProducts.includes(product.id));
        
        if (attempts > 10) continue;
        selectedProducts.push(product.id);

        const quantity = Math.floor(Math.random() * 3) + 1;
        
        try {
          // Kiểm tra xem đã có trong cart chưa
          const existing = await query(
            'SELECT id FROM cart WHERE user_id = ? AND product_id = ?',
            [user.id, product.id]
          );
          
          if (existing.length === 0) {
            await query(
              'INSERT INTO cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
              [user.id, product.id, quantity]
            );
            cartCount++;
          } else {
            // Cập nhật quantity nếu đã có
            await query(
              'UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
              [quantity, user.id, product.id]
            );
          }
        } catch (error) {
          if (!error.message.includes('Duplicate entry')) {
            console.error(`   ⚠️  Lỗi khi thêm vào cart:`, error.message);
          }
        }
      }
    }
    
    console.log(`✅ Đã tạo/cập nhật ${cartCount} cart items\n`);

    // 5. Tóm tắt
    console.log('📊 Tóm tắt dữ liệu đã tạo cho năm 2025:');
    const totalOrders = await query(
      `SELECT COUNT(*) as count FROM orders WHERE YEAR(created_at) = 2025`
    );
    const totalRevenue = await query(
      `SELECT COALESCE(SUM(final_amount), 0) as total 
       FROM orders 
       WHERE YEAR(created_at) = 2025 
       AND status IN ('delivered', 'shipping', 'confirmed')`
    );
    const totalViews = await query('SELECT SUM(view_count) as total FROM products');
    const totalCartItems = await query('SELECT COUNT(*) as count FROM cart');
    
    // Thống kê theo tháng
    const monthlyStats = await query(
      `SELECT 
        MONTH(created_at) as month,
        COUNT(*) as order_count,
        COALESCE(SUM(final_amount), 0) as revenue
       FROM orders 
       WHERE YEAR(created_at) = 2025 
       AND status IN ('delivered', 'shipping', 'confirmed')
       GROUP BY MONTH(created_at)
       ORDER BY month`
    );
    
    console.log(`   - Tổng đơn hàng năm 2025: ${totalOrders[0].count}`);
    console.log(`   - Tổng doanh thu năm 2025: ${parseFloat(totalRevenue[0].total).toLocaleString('vi-VN')}đ`);
    console.log(`   - Tổng lượt xem sản phẩm: ${parseInt(totalViews[0].total || 0).toLocaleString('vi-VN')}`);
    console.log(`   - Tổng cart items: ${totalCartItems[0].count}`);
    console.log('\n   📈 Thống kê theo tháng:');
    monthlyStats.forEach(stat => {
      const monthNames = ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 
                          'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'];
      console.log(`      ${monthNames[stat.month - 1]}: ${stat.order_count} đơn - ${parseFloat(stat.revenue).toLocaleString('vi-VN')}đ`);
    });
    
    console.log('\n✅ Hoàn thành! Bây giờ bạn có thể test biểu đồ thống kê.');
    console.log('   Vui lòng vào Admin Dashboard > Báo cáo thống kê để xem kết quả.');
    console.log('   Chọn "Theo tháng" hoặc "Theo năm" để xem dữ liệu năm 2025.\n');

  } catch (error) {
    console.error('❌ Lỗi khi insert dữ liệu mẫu:', error);
    throw error;
  }
}

// Chạy script
insert2025Data()
  .then(() => {
    console.log('✅ Script hoàn thành');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script thất bại:', error);
    process.exit(1);
  });

