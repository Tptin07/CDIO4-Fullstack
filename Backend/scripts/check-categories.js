import { query } from '../config/database.js';

async function checkCategories() {
  try {
    const categories = await query(
      `SELECT id, name, slug, parent_id, status, sort_order 
       FROM categories 
       ORDER BY parent_id IS NULL DESC, sort_order ASC, id ASC`
    );

    console.log('\n📊 DANH SÁCH DANH MỤC TRONG DATABASE:\n');
    
    const parentCategories = categories.filter(c => !c.parent_id);
    const subCategories = categories.filter(c => c.parent_id);

    console.log('📁 DANH MỤC CHA (' + parentCategories.length + '):');
    parentCategories.forEach(cat => {
      console.log(`   ${cat.id}. ${cat.name} (${cat.slug}) [${cat.status}]`);
    });

    console.log('\n📂 DANH MỤC CON (' + subCategories.length + '):');
    subCategories.forEach(cat => {
      const parent = categories.find(p => p.id === cat.parent_id);
      console.log(`   ${cat.id}. ${cat.name} (${cat.slug}) -> ${parent ? parent.name : 'N/A'} [${cat.status}]`);
    });

    console.log(`\n✅ Tổng cộng: ${categories.length} danh mục`);
    console.log(`   - Danh mục cha: ${parentCategories.length}`);
    console.log(`   - Danh mục con: ${subCategories.length}\n`);

  } catch (error) {
    console.error('❌ Lỗi:', error);
  }
  process.exit(0);
}

checkCategories();

