import { query } from "../config/database.js";

/**
 * Lấy danh sách bài viết với filter, sort, pagination
 */
export async function getPosts(filters = {}) {
  const {
    search = "",
    category = null,
    tag = null,
    sort = "newest", // newest, oldest, popular
    page = 1,
    limit = 10,
    status = "published", // Chỉ lấy bài đã published
  } = filters;

  let sql = `
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
    WHERE status = ?
  `;

  const params = [status];

  // Filter by category (có thể là array hoặc string)
  if (category && category !== "Tất cả") {
    if (Array.isArray(category)) {
      // Filter theo nhiều categories
      const placeholders = category.map(() => "?").join(",");
      sql += ` AND category IN (${placeholders})`;
      params.push(...category);
    } else {
      sql += ` AND category = ?`;
      params.push(category);
    }
  }

  // Filter by tag
  if (tag) {
    // Sử dụng JSON_SEARCH an toàn hơn JSON_CONTAINS
    sql += ` AND JSON_SEARCH(tags, 'one', ?) IS NOT NULL`;
    params.push(tag);
  }

  // Filter by search (title, excerpt, content, tags)
  if (search) {
    const searchPattern = `%${search}%`;
    sql += ` AND (
      title LIKE ? OR 
      excerpt LIKE ? OR 
      content LIKE ? OR
      (tags IS NOT NULL AND JSON_SEARCH(tags, 'one', ?) IS NOT NULL)
    )`;
    params.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  // Sort
  switch (sort) {
    case "newest":
      sql += ` ORDER BY COALESCE(published_at, created_at) DESC, created_at DESC`;
      break;
    case "oldest":
      sql += ` ORDER BY COALESCE(published_at, created_at) ASC, created_at ASC`;
      break;
    case "popular":
      sql += ` ORDER BY view_count DESC`;
      break;
    default:
      sql += ` ORDER BY COALESCE(published_at, created_at) DESC, created_at DESC`;
  }

  // Pagination - MySQL không chấp nhận LIMIT/OFFSET như parameters, phải dùng số trực tiếp
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 10;
  const offsetNum = (pageNum - 1) * limitNum;
  sql += ` LIMIT ${limitNum} OFFSET ${offsetNum}`;
  // Không push vào params vì đã dùng string interpolation

  // Get total count first (same filters)
  let countSql = `
    SELECT COUNT(*) as total
    FROM posts
    WHERE status = ?
  `;
  const countParams = [status];

  if (category && category !== "Tất cả") {
    if (Array.isArray(category)) {
      const placeholders = category.map(() => "?").join(",");
      countSql += ` AND category IN (${placeholders})`;
      countParams.push(...category);
    } else {
      countSql += ` AND category = ?`;
      countParams.push(category);
    }
  }

  if (tag) {
    countSql += ` AND JSON_SEARCH(tags, 'one', ?) IS NOT NULL`;
    countParams.push(tag);
  }

  if (search) {
    const searchPattern = `%${search}%`;
    countSql += ` AND (
      title LIKE ? OR 
      excerpt LIKE ? OR 
      content LIKE ? OR
      (tags IS NOT NULL AND JSON_SEARCH(tags, 'one', ?) IS NOT NULL)
    )`;
    countParams.push(searchPattern, searchPattern, searchPattern, searchPattern);
  }

  try {
    // Execute both queries
    const [posts, countResults] = await Promise.all([
      query(sql, params),
      query(countSql, countParams)
    ]);

    const countResult = Array.isArray(countResults) ? countResults[0] : countResults;
    const total = countResult?.total || 0;

    return {
      posts: posts || [],
      total: total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / parseInt(limit)),
    };
  } catch (error) {
    console.error("❌ Error in getPosts:", error);
    console.error("SQL:", sql.substring(0, 300));
    console.error("Params:", params);
    throw error;
  }
}

/**
 * Lấy bài viết theo ID
 */
export async function getPostById(id) {
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
    WHERE id = ? AND status = 'published'
  `;

  const results = await query(sql, [id]);
  return results.length > 0 ? results[0] : null;
}

/**
 * Lấy bài viết theo slug
 */
export async function getPostBySlug(slug) {
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
    WHERE slug = ? AND status = 'published'
  `;

  const results = await query(sql, [slug]);
  return results.length > 0 ? results[0] : null;
}

/**
 * Lấy bài viết liên quan
 */
export async function getRelatedPosts(postId, category, tags, limit = 6) {
  let sql = `
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
    WHERE id != ? AND status = 'published'
  `;

  const params = [postId];
  const conditions = [];

  // Ưu tiên cùng category
  if (category) {
    conditions.push(`category = ?`);
    params.push(category);
  }

  // Hoặc có tag chung
  if (tags && Array.isArray(tags) && tags.length > 0) {
    const tagConditions = tags.map(() => `JSON_SEARCH(tags, 'one', ?) IS NOT NULL`);
    conditions.push(`(${tagConditions.join(" OR ")})`);
    tags.forEach((tag) => params.push(tag));
  }

  if (conditions.length > 0) {
    sql += ` AND (${conditions.join(" OR ")})`;
  }

  const limitNum = parseInt(limit) || 6;
  sql += ` ORDER BY view_count DESC, COALESCE(published_at, created_at) DESC LIMIT ${limitNum}`;
  // Không push limit vào params vì đã dùng string interpolation

  return await query(sql, params);
}

/**
 * Tăng view count
 */
export async function incrementViewCount(id) {
  const sql = `UPDATE posts SET view_count = view_count + 1 WHERE id = ?`;
  await query(sql, [id]);
}

/**
 * Lấy bài viết nổi bật (theo view count)
 */
export async function getPopularPosts(limit = 6) {
  const limitNum = parseInt(limit) || 6;
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
    LIMIT ${limitNum}
  `;

  return await query(sql, []);
}

