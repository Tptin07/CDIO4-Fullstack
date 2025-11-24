// src/services/search.js
import { getAllProducts } from "./products";
import { getAllPosts } from "./posts";

/**
 * Normalize text for searching (remove diacritics, lowercase)
 */
function normalizeText(text) {
  if (!text) return "";
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove diacritics
    .trim();
}

/**
 * Check if text contains search query (supports multiple keywords)
 * Returns true if text contains all keywords (AND logic)
 */
function matchesQuery(text, query) {
  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  
  // Tách từ khóa thành các từ riêng lẻ
  const keywords = normalizedQuery.split(/\s+/).filter(k => k.length > 0);
  
  if (keywords.length === 0) {
    return false;
  }
  
  // Chỉ hiển thị kết quả chứa tất cả các từ khóa (AND logic)
  // Đảm bảo sản phẩm/bài viết có chứa từ liên quan đến tất cả các từ khóa
  return keywords.every(keyword => normalizedText.includes(keyword));
}

/**
 * Search products by name, code (id), brand, category, or description
 */
export function searchProducts(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const products = getAllProducts();
  const searchQuery = query.trim();

  return products.filter((product) => {
    // Search in name
    if (matchesQuery(product.name, searchQuery)) return true;

    // Search in product ID/code
    if (matchesQuery(String(product.id), searchQuery)) return true;

    // Search in brand
    if (product.brand && matchesQuery(product.brand, searchQuery)) return true;

    // Search in category
    if (product.cat && matchesQuery(product.cat, searchQuery)) return true;

    // Search in description
    if (product.desc && matchesQuery(product.desc, searchQuery)) return true;

    return false;
  });
}

/**
 * Search posts/articles by title, category, tags, excerpt, or content
 */
export function searchPosts(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  const posts = getAllPosts();
  const searchQuery = query.trim();

  return posts.filter((post) => {
    // Search in title
    if (matchesQuery(post.title, searchQuery)) return true;

    // Search in category
    if (post.cat && matchesQuery(post.cat, searchQuery)) return true;

    // Search in tags
    if (post.tags && Array.isArray(post.tags)) {
      const tagMatch = post.tags.some((tag) =>
        matchesQuery(tag, searchQuery)
      );
      if (tagMatch) return true;
    }

    // Search in excerpt
    if (post.excerpt && matchesQuery(post.excerpt, searchQuery)) return true;

    // Search in content (limited to first 500 chars for performance)
    if (post.content) {
      const contentPreview = post.content.substring(0, 500);
      if (matchesQuery(contentPreview, searchQuery)) return true;
    }

    return false;
  });
}

/**
 * Combined search - returns both products and posts
 */
export function searchAll(query) {
  const products = searchProducts(query);
  const posts = searchPosts(query);

  return {
    products,
    posts,
    total: products.length + posts.length,
  };
}

