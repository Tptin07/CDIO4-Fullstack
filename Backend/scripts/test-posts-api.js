// Test script để kiểm tra API posts
import { query, testConnection } from "../config/database.js";

async function testPosts() {
  try {
    console.log("🔍 Testing posts API...\n");
    
    // Test 1: Kiểm tra kết nối database
    const connected = await testConnection();
    if (!connected) {
      console.error("❌ Không thể kết nối database");
      process.exit(1);
    }

    // Test 2: Kiểm tra bảng posts có tồn tại không
    try {
      const tables = await query(
        `SELECT TABLE_NAME 
         FROM information_schema.TABLES 
         WHERE TABLE_SCHEMA = DATABASE() 
         AND TABLE_NAME = 'posts'`
      );

      const tablesArray = Array.isArray(tables) ? tables : [tables];
      if (tablesArray.length === 0) {
        console.log("❌ Bảng posts CHƯA TỒN TẠI!");
        console.log("\n💡 Giải pháp:");
        console.log("   1. Chạy file schema.sql để tạo bảng");
        process.exit(1);
      }

      console.log("✅ Bảng posts đã tồn tại");
    } catch (error) {
      console.error("❌ Lỗi khi kiểm tra bảng:", error.message);
      process.exit(1);
    }

    // Test 3: Kiểm tra số lượng posts
    try {
      const countResults = await query(
        `SELECT COUNT(*) as total FROM posts`
      );
      const countResult = Array.isArray(countResults) ? countResults[0] : countResults;
      console.log(`📊 Tổng số posts: ${countResult?.total || 0}`);

      // Kiểm tra posts published
      const publishedResults = await query(
        `SELECT COUNT(*) as total 
         FROM posts 
         WHERE status = 'published'`
      );
      const publishedCount = Array.isArray(publishedResults) ? publishedResults[0] : publishedResults;
      console.log(`✅ Posts published: ${publishedCount?.total || 0}`);
    } catch (error) {
      console.error("❌ Lỗi khi đếm posts:", error.message);
    }

    // Test 4: Test query getPopularPosts
    try {
      console.log("\n🔍 Testing getPopularPosts query...");
      const sql = `
        SELECT 
          id,
          title,
          slug,
          excerpt,
          cover_image,
          category,
          author,
          read_minutes,
          view_count,
          published_at,
          created_at
        FROM posts
        WHERE status = 'published'
        ORDER BY view_count DESC, COALESCE(published_at, created_at) DESC
        LIMIT 6
      `;
      
      const posts = await query(sql);
      console.log(`✅ Found ${posts.length} popular posts`);
      
      if (posts.length > 0) {
        console.log("\n📝 Sample post:");
        console.log(JSON.stringify(posts[0], null, 2));
      } else {
        console.log("\n⚠️  Không có posts published trong database!");
        console.log("💡 Cần thêm dữ liệu posts với status = 'published'");
      }
    } catch (error) {
      console.error("❌ Lỗi khi test getPopularPosts:", error.message);
      console.error("Stack:", error.stack);
    }

    // Test 5: Test query getPosts
    try {
      console.log("\n🔍 Testing getPosts query...");
      const sql = `
        SELECT 
          id,
          title,
          slug,
          excerpt,
          content,
          cover_image,
          category,
          author,
          tags,
          read_minutes,
          view_count,
          status,
          published_at,
          created_at,
          updated_at
        FROM posts
        WHERE status = 'published'
        ORDER BY COALESCE(published_at, created_at) DESC, created_at DESC
        LIMIT 9 OFFSET 0
      `;
      
      const posts = await query(sql);
      console.log(`✅ Found ${posts.length} posts`);
      
      if (posts.length > 0) {
        // Test parse tags
        const post = posts[0];
        if (post.tags) {
          try {
            const tags = typeof post.tags === "string" ? JSON.parse(post.tags) : post.tags;
            console.log(`✅ Tags parsed successfully:`, tags);
          } catch (e) {
            console.error("❌ Error parsing tags:", e.message);
            console.log("Raw tags:", post.tags);
          }
        }
      }
    } catch (error) {
      console.error("❌ Lỗi khi test getPosts:", error.message);
      console.error("Stack:", error.stack);
    }

    console.log("\n✅ All tests completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
  process.exit(0);
}

testPosts();

