// Test script để kiểm tra API products
import { query } from "../config/database.js";

async function testProducts() {
  try {
    console.log("🔍 Testing products query...");
    
    // Test 1: Kiểm tra có sản phẩm nào không
    const test1 = await query("SELECT COUNT(*) as count FROM products WHERE status = 'active'");
    console.log("✅ Total active products:", test1[0]?.count || 0);
    
    // Test 2: Lấy một vài sản phẩm
    const test2 = await query(`
      SELECT 
        p.id,
        p.name,
        p.price,
        p.status,
        c.name AS category_name
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
      LIMIT 5
    `);
    console.log("✅ Sample products:", test2);
    
    // Test 3: Kiểm tra categories
    const test3 = await query(`
      SELECT DISTINCT c.name
      FROM categories c
      INNER JOIN products p ON c.id = p.category_id
      WHERE p.status = 'active'
    `);
    console.log("✅ Categories:", test3.map(c => c.name));
    
    // Test 4: Kiểm tra brands
    const test4 = await query(`
      SELECT DISTINCT brand
      FROM products
      WHERE status = 'active' AND brand IS NOT NULL AND brand != ''
      LIMIT 10
    `);
    console.log("✅ Brands:", test4.map(b => b.brand));
    
    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
  }
  process.exit(0);
}

testProducts();

