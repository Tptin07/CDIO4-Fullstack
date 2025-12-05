// Test script để kiểm tra trực tiếp query posts
import { query, testConnection } from "../config/database.js";

async function testDirectQuery() {
  try {
    console.log("🔍 Testing direct posts query...\n");

    const connected = await testConnection();
    if (!connected) {
      console.error("❌ Không thể kết nối database");
      process.exit(1);
    }

    // Test query đơn giản nhất
    console.log("Test 1: Query đơn giản - lấy tất cả posts published");
    const simpleQuery = `
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
      ORDER BY COALESCE(published_at, created_at) DESC
      LIMIT 9 OFFSET 0
    `;

    try {
      const posts = await query(simpleQuery, []);
      console.log(`✅ Found ${posts.length} posts`);

      if (posts.length > 0) {
        const post = posts[0];
        console.log("\n📝 Sample post structure:");
        console.log("- id:", post.id, typeof post.id);
        console.log("- title:", post.title);
        console.log("- category:", post.category);
        console.log("- tags:", post.tags, typeof post.tags);
        console.log("- tags is array?", Array.isArray(post.tags));

        // Test parse tags
        if (post.tags) {
          try {
            let tagsParsed;
            if (typeof post.tags === "string") {
              tagsParsed = JSON.parse(post.tags);
            } else if (Array.isArray(post.tags)) {
              tagsParsed = post.tags;
            } else {
              tagsParsed = Object.values(post.tags);
            }
            console.log("- tags parsed:", tagsParsed);
          } catch (e) {
            console.error("- Error parsing tags:", e.message);
          }
        }
      }
    } catch (error) {
      console.error("❌ Error in simple query:", error.message);
      console.error("Stack:", error.stack);
    }

    // Test với filter category
    console.log("\n\nTest 2: Query với filter category");
    const categoryQuery = `
      SELECT 
        id,
        title,
        category
      FROM posts
      WHERE status = 'published'
      AND category = ?
      LIMIT 5
    `;

    try {
      const posts = await query(categoryQuery, ["Dinh dưỡng"]);
      console.log(`✅ Found ${posts.length} posts with category "Dinh dưỡng"`);
    } catch (error) {
      console.error("❌ Error in category query:", error.message);
    }

    // Test với JSON_SEARCH
    console.log("\n\nTest 3: Query với JSON_SEARCH");
    const tagQuery = `
      SELECT 
        id,
        title,
        tags
      FROM posts
      WHERE status = 'published'
      AND JSON_SEARCH(tags, 'one', ?) IS NOT NULL
      LIMIT 5
    `;

    try {
      const posts = await query(tagQuery, ["vitamin"]);
      console.log(`✅ Found ${posts.length} posts with tag "vitamin"`);
    } catch (error) {
      console.error("❌ Error in tag query:", error.message);
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

testDirectQuery();

``;
