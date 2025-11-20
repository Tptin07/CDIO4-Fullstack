import fetch from 'node-fetch';

/**
 * Test API endpoint để kiểm tra response
 */

async function testAPI() {
  try {
    const baseURL = 'http://localhost:3000/api';
    
    // Test với period = month
    console.log('🧪 Testing API: /admin/stats/detailed?period=month&type=all\n');
    
    const response = await fetch(`${baseURL}/admin/stats/detailed?period=month&type=all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Cần token nếu có
      }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('❌ API Error:', response.status, text);
      return;
    }

    const data = await response.json();
    console.log('✅ API Response:', JSON.stringify(data, null, 2));
    
    if (data.success && data.data) {
      console.log('\n📊 Revenue data:', data.data.revenue?.length || 0, 'items');
      console.log('📦 Top selling:', data.data.topSellingProducts?.length || 0, 'items');
      console.log('👁️  Most viewed:', data.data.mostViewedProducts?.length || 0, 'items');
      console.log('🛒 Favorites:', data.data.favoriteProducts?.length || 0, 'items');
      console.log('📂 Category views:', data.data.categoryViews?.length || 0, 'items');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAPI();

