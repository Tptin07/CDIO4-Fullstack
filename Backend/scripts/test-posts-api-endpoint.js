// Test script để kiểm tra API endpoint posts
import * as postController from "../controllers/postController.js";

// Mock req và res objects
function createMockReq(query = {}, params = {}) {
  return {
    query,
    params,
  };
}

function createMockRes() {
  const res = {
    statusCode: 200,
    data: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.data = data;
      console.log("Response:", JSON.stringify(data, null, 2));
      return this;
    },
  };
  return res;
}

async function testAPI() {
  try {
    console.log("🔍 Testing Posts API Endpoints...\n");

    // Test 1: getPosts
    console.log("Test 1: GET /api/posts");
    const req1 = createMockReq({
      q: "",
      cat: "Tất cả",
      tag: "",
      sort: "newest",
      page: 1,
      limit: 9,
    });
    const res1 = createMockRes();

    try {
      await postController.getPosts(req1, res1);
      if (res1.data && res1.data.success) {
        console.log(`✅ getPosts: Success - ${res1.data.data.posts.length} posts`);
        console.log(`   Total: ${res1.data.data.pagination.total}`);
      } else {
        console.log("❌ getPosts: Failed -", res1.data);
      }
    } catch (error) {
      console.error("❌ getPosts Error:", error.message);
      console.error(error.stack);
    }

    // Test 2: getPopularPosts
    console.log("\nTest 2: GET /api/posts/popular");
    const req2 = createMockReq({ limit: 6 });
    const res2 = createMockRes();

    try {
      await postController.getPopularPosts(req2, res2);
      if (res2.data && res2.data.success) {
        console.log(`✅ getPopularPosts: Success - ${res2.data.data.length} posts`);
      } else {
        console.log("❌ getPopularPosts: Failed -", res2.data);
      }
    } catch (error) {
      console.error("❌ getPopularPosts Error:", error.message);
      console.error(error.stack);
    }

    // Test 3: getPostById
    console.log("\nTest 3: GET /api/posts/1");
    const req3 = createMockReq({}, { id: "1" });
    const res3 = createMockRes();

    try {
      await postController.getPostById(req3, res3);
      if (res3.data && res3.data.success) {
        console.log(`✅ getPostById: Success - Post: ${res3.data.data.title}`);
      } else {
        console.log("❌ getPostById: Failed -", res3.data);
      }
    } catch (error) {
      console.error("❌ getPostById Error:", error.message);
      console.error(error.stack);
    }

    console.log("\n✅ All API tests completed!");
  } catch (error) {
    console.error("❌ Error:", error.message);
    console.error(error.stack);
    process.exit(1);
  }
  process.exit(0);
}

testAPI();

