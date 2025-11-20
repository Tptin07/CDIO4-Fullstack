import { query, testConnection } from "../config/database.js";

async function importProducts() {
  try {
    console.log("🔄 Đang kiểm tra kết nối database...");
    await testConnection();

    console.log("📦 Đang kiểm tra products hiện có...");
    const existingProducts = await query('SELECT id, name, slug FROM products');
    console.log(`   Đã có ${existingProducts.length} products\n`);

    // Lấy categories
    const categories = await query('SELECT id, name FROM categories ORDER BY id');
    const categoryMap = {};
    categories.forEach(cat => {
      categoryMap[cat.name.toLowerCase()] = cat.id;
    });

    // Danh sách sản phẩm mới cần import
    const newProducts = [
      // Thuốc không kê đơn (category_id: 2)
      {
        name: 'Ibuprofen 400mg',
        slug: 'ibuprofen-400mg',
        description: 'Thuốc giảm đau, chống viêm hiệu quả cho các trường hợp đau đầu, đau răng, đau cơ',
        short_description: 'Thuốc giảm đau chống viêm',
        category_id: 2,
        brand: 'Abbott',
        sku: 'SKU011',
        price: 35000.00,
        old_price: 40000.00,
        sale_percent: 13,
        sale_label: 'Giảm 13%',
        stock_quantity: 450,
        rating: 4.6,
        sold_count: 890,
        view_count: 2400,
        is_featured: false,
        is_new: false,
        is_bestseller: true
      },
      {
        name: 'Panadol Extra',
        slug: 'panadol-extra',
        description: 'Thuốc giảm đau hạ sốt có thêm caffeine, giúp giảm đau đầu hiệu quả hơn',
        short_description: 'Giảm đau hạ sốt với caffeine',
        category_id: 2,
        brand: 'GSK',
        sku: 'SKU012',
        price: 45000.00,
        old_price: null,
        sale_percent: null,
        sale_label: null,
        stock_quantity: 600,
        rating: 4.7,
        sold_count: 2100,
        view_count: 5200,
        is_featured: true,
        is_new: false,
        is_bestseller: true
      },
      {
        name: 'Efferalgan 500mg',
        slug: 'efferalgan-500mg',
        description: 'Thuốc hạ sốt giảm đau dạng viên sủi, tan nhanh, dễ uống',
        short_description: 'Viên sủi hạ sốt giảm đau',
        category_id: 2,
        brand: 'Upsa',
        sku: 'SKU013',
        price: 28000.00,
        old_price: 32000.00,
        sale_percent: 13,
        sale_label: 'Giảm 13%',
        stock_quantity: 800,
        rating: 4.8,
        sold_count: 3500,
        view_count: 8900,
        is_featured: true,
        is_new: false,
        is_bestseller: true
      },
      {
        name: 'Bisolvon 8mg',
        slug: 'bisolvon-8mg',
        description: 'Thuốc long đờm, giảm ho hiệu quả, an toàn cho người lớn và trẻ em trên 12 tuổi',
        short_description: 'Thuốc long đờm giảm ho',
        category_id: 2,
        brand: 'Boehringer Ingelheim',
        sku: 'SKU014',
        price: 65000.00,
        old_price: null,
        sale_percent: null,
        sale_label: null,
        stock_quantity: 350,
        rating: 4.5,
        sold_count: 680,
        view_count: 1800,
        is_featured: false,
        is_new: false,
        is_bestseller: false
      },
      {
        name: 'Enterogermina',
        slug: 'enterogermina',
        description: 'Men vi sinh giúp cân bằng hệ vi sinh đường ruột, hỗ trợ tiêu hóa',
        short_description: 'Men vi sinh hỗ trợ tiêu hóa',
        category_id: 2,
        brand: 'Sanofi',
        sku: 'SKU015',
        price: 95000.00,
        old_price: 110000.00,
        sale_percent: 14,
        sale_label: 'Giảm 14%',
        stock_quantity: 500,
        rating: 4.9,
        sold_count: 3200,
        view_count: 7500,
        is_featured: true,
        is_new: false,
        is_bestseller: true
      },

      // Thực phẩm chức năng (category_id: 3)
      {
        name: 'Collagen Peptide',
        slug: 'collagen-peptide',
        description: 'Bổ sung collagen peptide giúp làm chậm quá trình lão hóa, cải thiện độ đàn hồi da',
        short_description: 'Collagen chống lão hóa da',
        category_id: 3,
        brand: 'Neocell',
        sku: 'SKU016',
        price: 380000.00,
        old_price: 450000.00,
        sale_percent: 16,
        sale_label: 'Giảm 16%',
        stock_quantity: 200,
        rating: 4.7,
        sold_count: 560,
        view_count: 1500,
        is_featured: true,
        is_new: true,
        is_bestseller: false
      },
      {
        name: 'Probiotic 10 tỷ CFU',
        slug: 'probiotic-10-ty-cfu',
        description: 'Men vi sinh cao cấp với 10 tỷ CFU, hỗ trợ hệ tiêu hóa và miễn dịch',
        short_description: 'Men vi sinh cao cấp 10 tỷ CFU',
        category_id: 3,
        brand: 'Culturelle',
        sku: 'SKU017',
        price: 420000.00,
        old_price: null,
        sale_percent: null,
        sale_label: null,
        stock_quantity: 180,
        rating: 4.8,
        sold_count: 420,
        view_count: 1100,
        is_featured: true,
        is_new: true,
        is_bestseller: false
      },
      {
        name: 'Glucosamine 1500mg',
        slug: 'glucosamine-1500mg',
        description: 'Bổ sung glucosamine hỗ trợ sức khỏe khớp, giảm đau khớp',
        short_description: 'Hỗ trợ sức khỏe khớp',
        category_id: 3,
        brand: 'Schiff',
        sku: 'SKU018',
        price: 350000.00,
        old_price: 400000.00,
        sale_percent: 13,
        sale_label: 'Giảm 13%',
        stock_quantity: 250,
        rating: 4.6,
        sold_count: 780,
        view_count: 2100,
        is_featured: false,
        is_new: false,
        is_bestseller: false
      },

      // Chăm sóc da (category_id: 4)
      {
        name: 'Kem dưỡng ẩm Cerave',
        slug: 'kem-duong-am-cerave',
        description: 'Kem dưỡng ẩm cho da khô, chứa ceramide và hyaluronic acid, phù hợp da nhạy cảm',
        short_description: 'Kem dưỡng ẩm cho da khô',
        category_id: 4,
        brand: 'Cerave',
        sku: 'SKU019',
        price: 380000.00,
        old_price: 450000.00,
        sale_percent: 16,
        sale_label: 'Giảm 16%',
        stock_quantity: 150,
        rating: 4.8,
        sold_count: 920,
        view_count: 2400,
        is_featured: true,
        is_new: true,
        is_bestseller: false
      },
      {
        name: 'Toner La Roche-Posay',
        slug: 'toner-la-roche-posay',
        description: 'Nước cân bằng da, se khít lỗ chân lông, làm sạch sâu',
        short_description: 'Nước cân bằng da',
        category_id: 4,
        brand: 'La Roche-Posay',
        sku: 'SKU020',
        price: 280000.00,
        old_price: 320000.00,
        sale_percent: 13,
        sale_label: 'Giảm 13%',
        stock_quantity: 200,
        rating: 4.7,
        sold_count: 650,
        view_count: 1800,
        is_featured: false,
        is_new: true,
        is_bestseller: false
      },
      {
        name: 'Kem chống nắng Anessa SPF50+',
        slug: 'kem-chong-nang-anessa-spf50',
        description: 'Kem chống nắng chống thấm nước, bền màu, phù hợp hoạt động ngoài trời',
        short_description: 'Kem chống nắng chống thấm nước',
        category_id: 4,
        brand: 'Anessa',
        sku: 'SKU021',
        price: 450000.00,
        old_price: 520000.00,
        sale_percent: 13,
        sale_label: 'Giảm 13%',
        stock_quantity: 120,
        rating: 4.9,
        sold_count: 850,
        view_count: 2200,
        is_featured: true,
        is_new: false,
        is_bestseller: true
      },
      {
        name: 'Sữa rửa mặt Cetaphil',
        slug: 'sua-rua-mat-cetaphil',
        description: 'Sữa rửa mặt dịu nhẹ cho da nhạy cảm, làm sạch sâu không gây khô da',
        short_description: 'Sữa rửa mặt cho da nhạy cảm',
        category_id: 4,
        brand: 'Cetaphil',
        sku: 'SKU022',
        price: 220000.00,
        old_price: null,
        sale_percent: null,
        sale_label: null,
        stock_quantity: 300,
        rating: 4.8,
        sold_count: 2100,
        view_count: 5600,
        is_featured: true,
        is_new: false,
        is_bestseller: true
      },

      // Khẩu trang (category_id: 5)
      {
        name: 'Khẩu trang N95',
        slug: 'khau-trang-n95',
        description: 'Khẩu trang N95 lọc bụi mịn PM2.5, vi khuẩn, virus hiệu quả cao',
        short_description: 'Khẩu trang N95 lọc bụi mịn',
        category_id: 5,
        brand: '3M',
        sku: 'SKU023',
        price: 120000.00,
        old_price: 150000.00,
        sale_percent: 20,
        sale_label: 'Giảm 20%',
        stock_quantity: 800,
        rating: 4.9,
        sold_count: 3500,
        view_count: 9200,
        is_featured: true,
        is_new: false,
        is_bestseller: true
      },
      {
        name: 'Khẩu trang vải kháng khuẩn',
        slug: 'khau-trang-vai-khang-khuan',
        description: 'Khẩu trang vải có thể tái sử dụng, kháng khuẩn, thân thiện môi trường',
        short_description: 'Khẩu trang vải tái sử dụng',
        category_id: 5,
        brand: 'Uniqlo',
        sku: 'SKU024',
        price: 85000.00,
        old_price: null,
        sale_percent: null,
        sale_label: null,
        stock_quantity: 600,
        rating: 4.6,
        sold_count: 1800,
        view_count: 4800,
        is_featured: false,
        is_new: true,
        is_bestseller: false
      },

      // Thiết bị y tế (category_id: 6)
      {
        name: 'Máy đo đường huyết',
        slug: 'may-do-duong-huyet',
        description: 'Máy đo đường huyết cá nhân, cho kết quả nhanh và chính xác',
        short_description: 'Máy đo đường huyết cá nhân',
        category_id: 6,
        brand: 'Accu-Chek',
        sku: 'SKU025',
        price: 650000.00,
        old_price: 750000.00,
        sale_percent: 13,
        sale_label: 'Giảm 13%',
        stock_quantity: 100,
        rating: 4.7,
        sold_count: 320,
        view_count: 950,
        is_featured: true,
        is_new: false,
        is_bestseller: false
      },
      {
        name: 'Nhiệt kế điện tử',
        slug: 'nhiet-ke-dien-tu',
        description: 'Nhiệt kế điện tử đo thân nhiệt nhanh, an toàn, dễ sử dụng',
        short_description: 'Nhiệt kế điện tử đo thân nhiệt',
        category_id: 6,
        brand: 'Omron',
        sku: 'SKU026',
        price: 280000.00,
        old_price: 320000.00,
        sale_percent: 13,
        sale_label: 'Giảm 13%',
        stock_quantity: 350,
        rating: 4.8,
        sold_count: 1500,
        view_count: 4200,
        is_featured: true,
        is_new: false,
        is_bestseller: true
      },
      {
        name: 'Máy xông mũi họng',
        slug: 'may-xong-mui-hong',
        description: 'Máy xông mũi họng điều trị viêm đường hô hấp, dễ sử dụng tại nhà',
        short_description: 'Máy xông mũi họng điều trị',
        category_id: 6,
        brand: 'Omron',
        sku: 'SKU027',
        price: 1200000.00,
        old_price: null,
        sale_percent: null,
        sale_label: null,
        stock_quantity: 60,
        rating: 4.9,
        sold_count: 180,
        view_count: 550,
        is_featured: true,
        is_new: false,
        is_bestseller: false
      },

      // Vitamin (category_id: 7)
      {
        name: 'Vitamin B Complex',
        slug: 'vitamin-b-complex',
        description: 'Bổ sung vitamin nhóm B hỗ trợ chuyển hóa năng lượng, tốt cho hệ thần kinh',
        short_description: 'Vitamin nhóm B hỗ trợ năng lượng',
        category_id: 7,
        brand: 'Nature Made',
        sku: 'SKU028',
        price: 180000.00,
        old_price: 220000.00,
        sale_percent: 18,
        sale_label: 'Giảm 18%',
        stock_quantity: 400,
        rating: 4.7,
        sold_count: 1200,
        view_count: 3200,
        is_featured: false,
        is_new: false,
        is_bestseller: false
      },
      {
        name: 'Vitamin E 400IU',
        slug: 'vitamin-e-400iu',
        description: 'Bổ sung vitamin E chống oxy hóa, tốt cho da và tim mạch',
        short_description: 'Vitamin E chống oxy hóa',
        category_id: 7,
        brand: 'Solgar',
        sku: 'SKU029',
        price: 240000.00,
        old_price: 280000.00,
        sale_percent: 14,
        sale_label: 'Giảm 14%',
        stock_quantity: 350,
        rating: 4.6,
        sold_count: 850,
        view_count: 2300,
        is_featured: false,
        is_new: false,
        is_bestseller: false
      },
      {
        name: 'Kẽm 50mg',
        slug: 'kem-50mg',
        description: 'Bổ sung kẽm tăng cường miễn dịch, hỗ trợ làn da khỏe mạnh',
        short_description: 'Kẽm tăng cường miễn dịch',
        category_id: 7,
        brand: 'Nature\'s Bounty',
        sku: 'SKU030',
        price: 160000.00,
        old_price: null,
        sale_percent: null,
        sale_label: null,
        stock_quantity: 380,
        rating: 4.8,
        sold_count: 1100,
        view_count: 2900,
        is_featured: false,
        is_new: true,
        is_bestseller: false
      },
      {
        name: 'Sắt + Acid Folic',
        slug: 'sat-acid-folic',
        description: 'Bổ sung sắt và acid folic cho phụ nữ mang thai và người thiếu máu',
        short_description: 'Sắt và acid folic cho bà bầu',
        category_id: 7,
        brand: 'Blackmores',
        sku: 'SKU031',
        price: 320000.00,
        old_price: 380000.00,
        sale_percent: 16,
        sale_label: 'Giảm 16%',
        stock_quantity: 280,
        rating: 4.9,
        sold_count: 2100,
        view_count: 5800,
        is_featured: true,
        is_new: false,
        is_bestseller: true
      },
      {
        name: 'Vitamin A 10000IU',
        slug: 'vitamin-a-10000iu',
        description: 'Bổ sung vitamin A tốt cho mắt, da và hệ miễn dịch',
        short_description: 'Vitamin A cho mắt và da',
        category_id: 7,
        brand: 'Solgar',
        sku: 'SKU032',
        price: 200000.00,
        old_price: 240000.00,
        sale_percent: 17,
        sale_label: 'Giảm 17%',
        stock_quantity: 320,
        rating: 4.7,
        sold_count: 920,
        view_count: 2500,
        is_featured: false,
        is_new: false,
        is_bestseller: false
      },

      // Chăm sóc trẻ em (category_id: 10)
      {
        name: 'Siro ho cho trẻ em',
        slug: 'siro-ho-cho-tre-em',
        description: 'Siro ho thảo dược an toàn cho trẻ em, giảm ho, long đờm hiệu quả',
        short_description: 'Siro ho thảo dược cho trẻ',
        category_id: 10,
        brand: 'Prospan',
        sku: 'SKU033',
        price: 95000.00,
        old_price: null,
        sale_percent: null,
        sale_label: null,
        stock_quantity: 450,
        rating: 4.8,
        sold_count: 2800,
        view_count: 7200,
        is_featured: true,
        is_new: false,
        is_bestseller: true
      },
      {
        name: 'Vitamin D3 cho trẻ em',
        slug: 'vitamin-d3-cho-tre-em',
        description: 'Bổ sung vitamin D3 dạng nhỏ giọt, dễ sử dụng cho trẻ sơ sinh và trẻ nhỏ',
        short_description: 'Vitamin D3 dạng nhỏ giọt',
        category_id: 10,
        brand: 'D-Vi-Sol',
        sku: 'SKU034',
        price: 180000.00,
        old_price: 210000.00,
        sale_percent: 14,
        sale_label: 'Giảm 14%',
        stock_quantity: 400,
        rating: 4.9,
        sold_count: 3500,
        view_count: 9100,
        is_featured: true,
        is_new: false,
        is_bestseller: true
      },

      // Chăm sóc người cao tuổi (category_id: 11)
      {
        name: 'Glucosamine + Chondroitin',
        slug: 'glucosamine-chondroitin',
        description: 'Bổ sung glucosamine và chondroitin hỗ trợ khớp, giảm đau khớp cho người cao tuổi',
        short_description: 'Hỗ trợ khớp cho người già',
        category_id: 11,
        brand: 'Schiff',
        sku: 'SKU035',
        price: 420000.00,
        old_price: 480000.00,
        sale_percent: 13,
        sale_label: 'Giảm 13%',
        stock_quantity: 200,
        rating: 4.7,
        sold_count: 650,
        view_count: 1800,
        is_featured: false,
        is_new: false,
        is_bestseller: false
      },
    ];

    console.log("📝 Đang import products mới...\n");
    let successCount = 0;
    let skipCount = 0;
    const insertedProductIds = [];

    for (const product of newProducts) {
      try {
        // Kiểm tra slug đã tồn tại chưa
        const existing = await query('SELECT id FROM products WHERE slug = ?', [product.slug]);
        if (existing.length > 0) {
          console.log(`   ⚠️  Đã tồn tại: ${product.name} (${product.slug})`);
          skipCount++;
          continue;
        }

        // Insert product
        const result = await query(
          `INSERT INTO products (
            name, slug, description, short_description, category_id, brand, sku,
            price, old_price, sale_percent, sale_label, stock_quantity, stock_status,
            rating, sold_count, view_count, status, is_featured, is_new, is_bestseller
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.name,
            product.slug,
            product.description,
            product.short_description,
            product.category_id,
            product.brand,
            product.sku,
            product.price,
            product.old_price,
            product.sale_percent,
            product.sale_label,
            product.stock_quantity,
            'in_stock',
            product.rating,
            product.sold_count,
            product.view_count,
            'active',
            product.is_featured ? 1 : 0,
            product.is_new ? 1 : 0,
            product.is_bestseller ? 1 : 0
          ]
        );

        insertedProductIds.push(result.insertId);
        const category = categories.find(c => c.id === product.category_id);
        console.log(`   ✅ Đã thêm: ${product.name} (ID: ${result.insertId}) - ${category?.name || 'N/A'}`);
        successCount++;
      } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
          console.log(`   ⚠️  Đã tồn tại: ${product.name} (${product.slug})`);
          skipCount++;
        } else {
          console.error(`   ❌ Lỗi khi thêm ${product.name}: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Kết quả:`);
    console.log(`   ✅ Đã thêm: ${successCount} products`);
    console.log(`   ⚠️  Đã bỏ qua: ${skipCount} products (đã tồn tại)`);

    // Kiểm tra tổng số products
    const allProducts = await query('SELECT COUNT(*) as count FROM products WHERE status = ?', ['active']);
    console.log(`\n📊 Tổng số products trong database: ${allProducts[0].count}\n`);

    console.log("✅ Hoàn thành!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    console.error(error);
    process.exit(1);
  }
}

importProducts();

