import { query, testConnection } from "../config/database.js";

async function checkProducts() {
  try {
    await testConnection();
    
    const categories = await query('SELECT id, name FROM categories ORDER BY id');
    console.log('\n📂 Categories:');
    categories.forEach((c) => {
      console.log(`   ${c.id}. ${c.name}`);
    });

    const products = await query('SELECT id, name, category_id, price, stock_quantity FROM products ORDER BY id');
    console.log(`\n📦 Tổng số products: ${products.length}\n`);
    products.forEach((p) => {
      const cat = categories.find(c => c.id === p.category_id);
      console.log(`${p.id}. ${p.name} - ${cat?.name || 'N/A'} - ${parseFloat(p.price).toLocaleString('vi-VN')}đ - SL: ${p.stock_quantity}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Lỗi:", error.message);
    process.exit(1);
  }
}

checkProducts();

