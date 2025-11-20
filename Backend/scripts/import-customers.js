import { query, testConnection } from "../config/database.js";

async function importCustomers() {
  try {
    console.log("🔄 Đang kiểm tra kết nối database...");
    await testConnection();

    console.log("👥 Đang kiểm tra customers hiện có...");
    const existingUsers = await query(
      'SELECT id, name, email FROM users WHERE role = ?',
      ['customer']
    );
    console.log(`   Đã có ${existingUsers.length} customers\n`);

    // Danh sách customers mới cần import
    const newCustomers = [
      { name: 'Hoàng Thị Mai', email: 'hoangthimai@gmail.com', phone: '0956789012' },
      { name: 'Trương Minh Tuấn', email: 'truongminhtuan@gmail.com', phone: '0967890123' },
      { name: 'Võ Thị Hương', email: 'vothihuong@gmail.com', phone: '0978901234' },
      { name: 'Đỗ Văn Đức', email: 'dovanduc@gmail.com', phone: '0989012345' },
      { name: 'Bùi Thị Lan', email: 'buithilan@gmail.com', phone: '0990123456' },
      { name: 'Phan Văn Hùng', email: 'phanvanhung@gmail.com', phone: '0901237890' },
      { name: 'Ngô Thị Hoa', email: 'ngothihoa@gmail.com', phone: '0912348901' },
      { name: 'Lý Văn Nam', email: 'lyvannam@gmail.com', phone: '0923459012' },
      { name: 'Đặng Thị Linh', email: 'dangthilinh@gmail.com', phone: '0934560123' },
      { name: 'Dương Minh Khoa', email: 'duongminhkhoa@gmail.com', phone: '0945671234' },
      { name: 'Nguyễn Thị Ngọc', email: 'nguyenthingoc@gmail.com', phone: '0956782345' },
      { name: 'Trần Văn Phong', email: 'tranvanphong@gmail.com', phone: '0967893456' },
      { name: 'Lê Thị Thanh', email: 'lethithanh@gmail.com', phone: '0978904567' },
      { name: 'Phạm Minh Quang', email: 'phamminhquang@gmail.com', phone: '0989015678' },
      { name: 'Hoàng Thị Hạnh', email: 'hoangthihanh@gmail.com', phone: '0990126789' },
      { name: 'Vũ Văn Sơn', email: 'vuvanson@gmail.com', phone: '0901238910' },
      { name: 'Đinh Thị Nga', email: 'dinhthinga@gmail.com', phone: '0912349021' },
    ];

    // Password hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi (password: password)
    const passwordHash = '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

    console.log("📝 Đang import customers mới...\n");
    let successCount = 0;
    let skipCount = 0;
    const insertedUserIds = [];

    for (const customer of newCustomers) {
      try {
        // Kiểm tra email đã tồn tại chưa
        const existing = await query('SELECT id FROM users WHERE email = ?', [customer.email]);
        if (existing.length > 0) {
          console.log(`   ⚠️  Đã tồn tại: ${customer.name} (${customer.email})`);
          skipCount++;
          continue;
        }

        // Insert user
        const result = await query(
          'INSERT INTO users (name, email, password, phone, role, status) VALUES (?, ?, ?, ?, ?, ?)',
          [customer.name, customer.email, passwordHash, customer.phone, 'customer', 'active']
        );

        insertedUserIds.push(result.insertId);
        console.log(`   ✅ Đã thêm: ${customer.name} (ID: ${result.insertId})`);
        successCount++;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`   ⚠️  Đã tồn tại: ${customer.name} (${customer.email})`);
          skipCount++;
        } else {
          console.error(`   ❌ Lỗi khi thêm ${customer.name}: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Kết quả:`);
    console.log(`   ✅ Đã thêm: ${successCount} customers`);
    console.log(`   ⚠️  Đã bỏ qua: ${skipCount} customers (đã tồn tại)`);

    // Import addresses cho các customers mới
    if (insertedUserIds.length > 0) {
      console.log("\n📍 Đang import addresses cho customers mới...\n");

      const addresses = [
        { userId: insertedUserIds[0] || null, name: 'Hoàng Thị Mai', phone: '0956789012', province: 'Hà Nội', district: 'Quận Cầu Giấy', ward: 'Phường Dịch Vọng', street: '789 Đường Hoàng Quốc Việt', postal: '100000' },
        { userId: insertedUserIds[1] || null, name: 'Trương Minh Tuấn', phone: '0967890123', province: 'Hồ Chí Minh', district: 'Quận Bình Thạnh', ward: 'Phường 25', street: '456 Đường Xô Viết Nghệ Tĩnh', postal: '700000' },
        { userId: insertedUserIds[2] || null, name: 'Võ Thị Hương', phone: '0978901234', province: 'Đà Nẵng', district: 'Quận Thanh Khê', ward: 'Phường Thanh Khê Tây', street: '321 Đường Lê Độ', postal: '550000' },
        { userId: insertedUserIds[3] || null, name: 'Đỗ Văn Đức', phone: '0989012345', province: 'Hà Nội', district: 'Quận Đống Đa', ward: 'Phường Láng Thượng', street: '654 Đường Láng', postal: '100000' },
        { userId: insertedUserIds[4] || null, name: 'Bùi Thị Lan', phone: '0990123456', province: 'Hồ Chí Minh', district: 'Quận Tân Bình', ward: 'Phường 15', street: '987 Đường Cộng Hòa', postal: '700000' },
        { userId: insertedUserIds[5] || null, name: 'Phan Văn Hùng', phone: '0901237890', province: 'Hải Phòng', district: 'Quận Hải An', ward: 'Phường Đằng Hải', street: '159 Đường Trần Phú', postal: '180000' },
        { userId: insertedUserIds[6] || null, name: 'Ngô Thị Hoa', phone: '0912348901', province: 'Hồ Chí Minh', district: 'Quận Phú Nhuận', ward: 'Phường 10', street: '753 Đường Phan Đình Phùng', postal: '700000' },
        { userId: insertedUserIds[7] || null, name: 'Lý Văn Nam', phone: '0923459012', province: 'Cần Thơ', district: 'Quận Ninh Kiều', ward: 'Phường An Hòa', street: '246 Đường 3 Tháng 2', postal: '940000' },
        { userId: insertedUserIds[8] || null, name: 'Đặng Thị Linh', phone: '0934560123', province: 'Hà Nội', district: 'Quận Hai Bà Trưng', ward: 'Phường Bạch Đằng', street: '852 Đường Bạch Đằng', postal: '100000' },
        { userId: insertedUserIds[9] || null, name: 'Dương Minh Khoa', phone: '0945671234', province: 'Hồ Chí Minh', district: 'Quận 2', ward: 'Phường An Phú', street: '741 Đường Nguyễn Thị Định', postal: '700000' },
        { userId: insertedUserIds[10] || null, name: 'Nguyễn Thị Ngọc', phone: '0956782345', province: 'Đà Nẵng', district: 'Quận Sơn Trà', ward: 'Phường Mân Thái', street: '369 Đường Hoàng Sa', postal: '550000' },
        { userId: insertedUserIds[11] || null, name: 'Trần Văn Phong', phone: '0967893456', province: 'Hà Nội', district: 'Quận Ba Đình', ward: 'Phường Điện Biên', street: '258 Đường Điện Biên Phủ', postal: '100000' },
        { userId: insertedUserIds[12] || null, name: 'Lê Thị Thanh', phone: '0978904567', province: 'Hồ Chí Minh', district: 'Quận 10', ward: 'Phường 15', street: '147 Đường Lý Thường Kiệt', postal: '700000' },
        { userId: insertedUserIds[13] || null, name: 'Phạm Minh Quang', phone: '0989015678', province: 'Hải Phòng', district: 'Quận Lê Chân', ward: 'Phường An Biên', street: '963 Đường Lạch Tray', postal: '180000' },
        { userId: insertedUserIds[14] || null, name: 'Hoàng Thị Hạnh', phone: '0990126789', province: 'Hà Nội', district: 'Quận Tây Hồ', ward: 'Phường Xuân La', street: '741 Đường Xuân La', postal: '100000' },
        { userId: insertedUserIds[15] || null, name: 'Vũ Văn Sơn', phone: '0901238910', province: 'Hồ Chí Minh', district: 'Quận Gò Vấp', ward: 'Phường 16', street: '852 Đường Quang Trung', postal: '700000' },
        { userId: insertedUserIds[16] || null, name: 'Đinh Thị Nga', phone: '0912349021', province: 'Đà Nẵng', district: 'Quận Ngũ Hành Sơn', ward: 'Phường Mỹ An', street: '159 Đường Võ Nguyên Giáp', postal: '550000' },
      ];

      let addressCount = 0;
      for (let i = 0; i < addresses.length && i < insertedUserIds.length; i++) {
        const addr = addresses[i];
        if (!addr.userId) continue;

        try {
          await query(
            'INSERT INTO addresses (user_id, full_name, phone, province, district, ward, street_address, postal_code, is_default) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [addr.userId, addr.name, addr.phone, addr.province, addr.district, addr.ward, addr.street, addr.postal, true]
          );
          console.log(`   ✅ Đã thêm address cho: ${addr.name}`);
          addressCount++;
        } catch (error) {
          console.error(`   ❌ Lỗi khi thêm address cho ${addr.name}: ${error.message}`);
        }
      }

      console.log(`\n   ✅ Đã thêm ${addressCount} addresses\n`);
    }

    // Kiểm tra tổng số customers
    const allUsers = await query('SELECT COUNT(*) as count FROM users WHERE role = ?', ['customer']);
    console.log(`📊 Tổng số customers trong database: ${allUsers[0].count}\n`);

    console.log("✅ Hoàn thành!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    console.error(error);
    process.exit(1);
  }
}

importCustomers();

