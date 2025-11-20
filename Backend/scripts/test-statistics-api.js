import { query } from '../config/database.js';

async function testStatistics() {
  try {
    console.log('🧪 Testing Statistics API...\n');

    // Test revenue query for month
    console.log('📊 Testing revenue query (month)...');
    const revenueMonth = await query(
      `SELECT 
        period,
        COALESCE(SUM(final_amount), 0) as revenue,
        COUNT(*) as orderCount
      FROM (
        SELECT 
          DATE_FORMAT(created_at, ?) as period,
          final_amount
        FROM orders 
        WHERE status IN ('delivered', 'shipping', 'confirmed')
          AND created_at >= DATE_SUB(CURDATE(), INTERVAL ? MONTH)
      ) as period_orders
      GROUP BY period
      ORDER BY period ASC`,
      ['%Y-%m', 12]
    );
    console.log('✅ Revenue data (month):', revenueMonth);
    console.log(`   Found ${revenueMonth.length} periods\n`);

    // Test top selling products
    console.log('📦 Testing top selling products...');
    const topSelling = await query(
      `SELECT 
        p.id,
        p.name,
        p.image,
        SUM(oi.quantity) as totalSold,
        SUM(oi.subtotal) as totalRevenue
      FROM products p
      INNER JOIN order_items oi ON p.id = oi.product_id
      INNER JOIN orders o ON oi.order_id = o.id
      WHERE o.status IN ('delivered', 'shipping', 'confirmed')
      GROUP BY p.id, p.name, p.image
      ORDER BY totalSold DESC
      LIMIT 5`
    );
    console.log('✅ Top selling products:', topSelling);
    console.log(`   Found ${topSelling.length} products\n`);

    // Test most viewed products
    console.log('👁️  Testing most viewed products...');
    const mostViewed = await query(
      `SELECT 
        id,
        name,
        image,
        view_count as viewCount,
        sold_count as soldCount,
        rating
      FROM products
      WHERE status = 'active'
      ORDER BY view_count DESC
      LIMIT 5`
    );
    console.log('✅ Most viewed products:', mostViewed);
    console.log(`   Found ${mostViewed.length} products\n`);

    // Test favorite products (cart)
    console.log('🛒 Testing favorite products (cart)...');
    const favorites = await query(
      `SELECT 
        p.id,
        p.name,
        p.image,
        COUNT(c.id) as cartCount,
        p.sold_count as soldCount,
        p.rating
      FROM products p
      LEFT JOIN cart c ON p.id = c.product_id
      WHERE p.status = 'active'
      GROUP BY p.id, p.name, p.image, p.sold_count, p.rating
      ORDER BY cartCount DESC, p.sold_count DESC
      LIMIT 5`
    );
    console.log('✅ Favorite products:', favorites);
    console.log(`   Found ${favorites.length} products\n`);

    // Test category views
    console.log('📂 Testing category views...');
    const categoryViews = await query(
      `SELECT 
        c.id,
        c.name,
        SUM(p.view_count) as totalViews,
        COUNT(p.id) as productCount
      FROM categories c
      LEFT JOIN products p ON c.id = p.category_id
      WHERE c.status = 'active'
      GROUP BY c.id, c.name
      ORDER BY totalViews DESC
      LIMIT 5`
    );
    console.log('✅ Category views:', categoryViews);
    console.log(`   Found ${categoryViews.length} categories\n`);

    console.log('✅ All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
  process.exit(0);
}

testStatistics();

