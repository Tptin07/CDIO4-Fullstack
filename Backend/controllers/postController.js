import * as postModel from "../models/postModel.js";

/**
 * Helper function để map category từ database sang frontend format
 */
function mapCategory(category) {
  if (!category) return "Tin tức";

  const categoryMap = {
    "Sức khỏe": "Mẹo sống khỏe",
    "Làm đẹp": "Mẹo sống khỏe",
  };

  return categoryMap[category] || category;
}

/**
 * GET /api/posts
 * Lấy danh sách bài viết với filter, sort, pagination
 */
export async function getPosts(req, res) {
  try {
    const {
      q = "",
      cat = "Tất cả",
      tag = "",
      sort = "newest",
      page = 1,
      limit = 9,
    } = req.query;

    console.log("📝 getPosts request:", { q, cat, tag, sort, page, limit });

    // Map category từ frontend về database format nếu cần
    let dbCategory = cat !== "Tất cả" ? cat : null;
    if (dbCategory === "Mẹo sống khỏe") {
      // "Mẹo sống khỏe" trong frontend map từ nhiều categories trong DB
      dbCategory = ["Sức khỏe", "Làm đẹp", "Mẹo sống khỏe"];
    }

    const filters = {
      search: q,
      category: dbCategory,
      tag: tag || null,
      sort,
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 9,
    };

    const result = await postModel.getPosts(filters);
    console.log("✅ getPosts result:", {
      postCount: result.posts?.length || 0,
      total: result.total,
    });

    // Transform data to match frontend format
    const posts = (result.posts || []).map((p) => {
      // Parse tags - MySQL JSON trả về array hoặc object tùy version
      let tags = [];
      if (p.tags) {
        if (Array.isArray(p.tags)) {
          tags = p.tags;
        } else if (typeof p.tags === "string") {
          try {
            tags = JSON.parse(p.tags);
          } catch (e) {
            console.warn("Could not parse tags as JSON for post", p.id);
            tags = [];
          }
        } else if (typeof p.tags === "object" && p.tags !== null) {
          // Nếu là object, thử convert
          tags = Array.isArray(Object.values(p.tags))
            ? Object.values(p.tags)
            : [];
        }
      }

      // Đảm bảo tags là array
      if (!Array.isArray(tags)) {
        tags = [];
      }

      // Format date - use published_at if available, otherwise created_at
      const dateField = p.published_at || p.created_at;
      let date = new Date().toISOString().split("T")[0];
      if (dateField) {
        try {
          date = new Date(dateField).toISOString().split("T")[0];
        } catch (e) {
          console.warn("Could not parse date for post", p.id);
        }
      }

      return {
        id: String(p.id),
        title: p.title || "",
        slug: p.slug || "",
        cat: mapCategory(p.category),
        cover: p.cover_image || "/img/placeholder.jpg",
        excerpt: p.excerpt || "",
        date: date,
        readMin: Number(p.read_minutes) || 5,
        author: p.author || "Biên tập",
        views: Number(p.view_count) || 0,
        tags: tags,
        content: p.content || "",
      };
    });

    res.json({
      success: true,
      data: {
        posts,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    });
  } catch (error) {
    console.error("❌ Error in getPosts:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}

/**
 * GET /api/posts/:id
 * Lấy chi tiết bài viết theo ID
 */
export async function getPostById(req, res) {
  try {
    const { id } = req.params;

    console.log("📝 getPostById request:", { id });

    const post = await postModel.getPostById(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Tăng view count (async, không cần đợi)
    postModel.incrementViewCount(id).catch((err) => {
      console.error("Error incrementing view count:", err);
    });

    // Parse tags - MySQL JSON trả về array hoặc object tùy version
    let tags = [];
    if (post.tags) {
      if (Array.isArray(post.tags)) {
        tags = post.tags;
      } else if (typeof post.tags === "string") {
        try {
          tags = JSON.parse(post.tags);
        } catch (e) {
          console.warn("Could not parse tags as JSON for post", post.id);
          tags = [];
        }
      } else if (typeof post.tags === "object" && post.tags !== null) {
        tags = Array.isArray(Object.values(post.tags))
          ? Object.values(post.tags)
          : [];
      }
    }
    if (!Array.isArray(tags)) {
      tags = [];
    }

    // Format date
    const dateField = post.published_at || post.created_at;
    let date = new Date().toISOString().split("T")[0];
    if (dateField) {
      try {
        date = new Date(dateField).toISOString().split("T")[0];
      } catch (e) {
        console.warn("Could not parse date for post", post.id);
      }
    }

    const transformedPost = {
      id: String(post.id),
      title: post.title || "",
      slug: post.slug || "",
      cat: mapCategory(post.category),
      cover: post.cover_image || "/img/placeholder.jpg",
      excerpt: post.excerpt || "",
      date: date,
      readMin: Number(post.read_minutes) || 5,
      author: post.author || "Biên tập",
      views: Number(post.view_count) || 0,
      tags: tags,
      content: post.content || "",
    };

    res.json({
      success: true,
      data: transformedPost,
    });
  } catch (error) {
    console.error("❌ Error in getPostById:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy chi tiết bài viết",
      error: error.message,
    });
  }
}

/**
 * GET /api/posts/:id/related
 * Lấy bài viết liên quan
 */
export async function getRelatedPosts(req, res) {
  try {
    const { id } = req.params;
    const { limit = 8 } = req.query;

    console.log("📝 getRelatedPosts request:", { id, limit });

    // Lấy thông tin bài viết hiện tại
    const currentPost = await postModel.getPostById(id);

    if (!currentPost) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Parse tags - MySQL JSON trả về array hoặc object tùy version
    let tags = [];
    if (currentPost.tags) {
      if (Array.isArray(currentPost.tags)) {
        tags = currentPost.tags;
      } else if (typeof currentPost.tags === "string") {
        try {
          tags = JSON.parse(currentPost.tags);
        } catch (e) {
          console.warn("Could not parse tags as JSON for post", currentPost.id);
          tags = [];
        }
      } else if (
        typeof currentPost.tags === "object" &&
        currentPost.tags !== null
      ) {
        tags = Array.isArray(Object.values(currentPost.tags))
          ? Object.values(currentPost.tags)
          : [];
      }
    }
    if (!Array.isArray(tags)) {
      tags = [];
    }

    const related = await postModel.getRelatedPosts(
      id,
      currentPost.category,
      tags,
      parseInt(limit)
    );

    // Transform data
    const transformedRelated = (related || []).map((p) => {
      const dateField = p.published_at || p.created_at;
      let date = new Date().toISOString().split("T")[0];
      if (dateField) {
        try {
          date = new Date(dateField).toISOString().split("T")[0];
        } catch (e) {
          console.warn("Could not parse date for related post", p.id);
        }
      }

      return {
        id: String(p.id),
        title: p.title || "",
        slug: p.slug || "",
        cat: mapCategory(p.category),
        cover: p.cover_image || "/img/placeholder.jpg",
        excerpt: p.excerpt || "",
        date: date,
        readMin: Number(p.read_minutes) || 5,
        author: p.author || "Biên tập",
        views: Number(p.view_count) || 0,
      };
    });

    res.json({
      success: true,
      data: transformedRelated,
    });
  } catch (error) {
    console.error("❌ Error in getRelatedPosts:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bài viết liên quan",
      error: error.message,
    });
  }
}

/**
 * GET /api/posts/popular
 * Lấy bài viết nổi bật
 */
export async function getPopularPosts(req, res) {
  try {
    const { limit = 6 } = req.query;

    console.log("📝 getPopularPosts request:", { limit });

    const posts = await postModel.getPopularPosts(parseInt(limit));

    // Transform data
    const transformedPosts = (posts || []).map((p) => {
      const dateField = p.published_at || p.created_at;
      let date = new Date().toISOString().split("T")[0];
      if (dateField) {
        try {
          date = new Date(dateField).toISOString().split("T")[0];
        } catch (e) {
          console.warn("Could not parse date for popular post", p.id);
        }
      }

      return {
        id: String(p.id),
        title: p.title || "",
        slug: p.slug || "",
        cat: mapCategory(p.category),
        cover: p.cover_image || "/img/placeholder.jpg",
        excerpt: p.excerpt || "",
        date: date,
        readMin: Number(p.read_minutes) || 5,
        author: p.author || "Biên tập",
        views: Number(p.view_count) || 0,
      };
    });

    res.json({
      success: true,
      data: transformedPosts,
    });
  } catch (error) {
    console.error("❌ Error in getPopularPosts:", error);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy bài viết nổi bật",
      error: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
}
