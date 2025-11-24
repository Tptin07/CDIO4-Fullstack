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
 * Calculate search score for better ranking
 * Higher score = better match
 */
function calculateSearchScore(product, query, normalizedQuery) {
  let score = 0;
  const normalizedName = normalizeText(product.name || "");
  const normalizedBrand = normalizeText(product.brand || "");
  const normalizedCat = normalizeText(product.cat || "");
  const normalizedDesc = normalizeText(product.desc || "");

  // Exact match in name (highest priority)
  if (normalizedName === normalizedQuery) {
    score += 1000;
  } else if (normalizedName.startsWith(normalizedQuery)) {
    score += 500;
  } else if (normalizedName.includes(normalizedQuery)) {
    score += 200;
  }

  // Match at word boundary in name
  const nameWords = normalizedName.split(/\s+/);
  const queryWords = normalizedQuery.split(/\s+/);
  queryWords.forEach((qWord) => {
    nameWords.forEach((nWord) => {
      if (nWord === qWord) score += 100;
      else if (nWord.startsWith(qWord)) score += 50;
      else if (nWord.includes(qWord)) score += 20;
    });
  });

  // Brand match
  if (normalizedBrand.includes(normalizedQuery)) {
    score += 150;
  }

  // Category match
  if (normalizedCat.includes(normalizedQuery)) {
    score += 100;
  }

  // Description match (lower priority)
  if (normalizedDesc.includes(normalizedQuery)) {
    score += 30;
  }

  // Boost score for products with images
  if (product.img || product.cover) {
    score += 10;
  }

  return score;
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
 * Search products in a given array (from API)
 * Returns sorted by relevance score
 */
export function searchProductsInArray(products, query, limit = 50) {
  if (!query || query.trim().length === 0 || !Array.isArray(products)) {
    return [];
  }

  try {
    const searchQuery = query.trim();
    const normalizedQuery = normalizeText(searchQuery);

    // Map products with scores
    const productsWithScores = products
      .map((product) => {
        if (!product) return null;
        
        // Check if product matches
        const matches =
          (product.name && matchesQuery(product.name, searchQuery)) ||
          (product.id && matchesQuery(String(product.id), searchQuery)) ||
          (product.brand && matchesQuery(product.brand, searchQuery)) ||
          (product.cat && matchesQuery(product.cat, searchQuery)) ||
          (product.desc && matchesQuery(product.desc, searchQuery));

        if (!matches) return null;

        // Calculate score
        const score = calculateSearchScore(product, searchQuery, normalizedQuery);
        return { product, score };
      })
      .filter((item) => item !== null)
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, limit)
      .map((item) => item.product);

    return productsWithScores;
  } catch (error) {
    console.error("Error in searchProductsInArray:", error);
    return [];
  }
}

/**
 * Search products by name, code (id), brand, category, or description
 * Returns sorted by relevance score (uses localStorage - for backward compatibility)
 */
export function searchProducts(query, limit = 50) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const products = getAllProducts();
    return searchProductsInArray(products, query, limit);
  } catch (error) {
    console.error("Error in searchProducts:", error);
    return [];
  }
}

/**
 * Get search suggestions from a given products array (from API)
 * Returns product names, categories, and brands that match
 * Hiển thị ngay từ ký tự đầu tiên
 */
export function getSearchSuggestionsFromArray(products, query, limit = 10) {
  if (!query || query.trim().length === 0 || !Array.isArray(products)) {
    return [];
  }

  try {
    const searchQuery = query.trim().toLowerCase();
    const normalizedQuery = normalizeText(searchQuery);
    const suggestionsWithScore = [];

    products.forEach((product) => {
      if (!product) return;

      let score = 0;
      let suggestionText = null;
      let suggestionType = null;

      // Check product name - highest priority
      if (product.name) {
        const normalizedName = normalizeText(product.name);
        const nameWords = normalizedName.split(/\s+/);
        
        // Exact match
        if (normalizedName === normalizedQuery) {
          score = 1000;
          suggestionText = product.name;
          suggestionType = 'product';
        }
        // Starts with query
        else if (normalizedName.startsWith(normalizedQuery)) {
          score = 800;
          suggestionText = product.name;
          suggestionType = 'product';
        }
        // First word starts with query
        else if (nameWords.length > 0 && nameWords[0].startsWith(normalizedQuery)) {
          score = 600;
          suggestionText = product.name;
          suggestionType = 'product';
        }
        // Contains query
        else if (normalizedName.includes(normalizedQuery)) {
          score = 400;
          suggestionText = product.name;
          suggestionType = 'product';
        }
      }

      // Check category - medium priority
      if (product.cat) {
        const normalizedCat = normalizeText(product.cat);
        let catScore = 0;
        
        if (normalizedCat === normalizedQuery) {
          catScore = 500;
        } else if (normalizedCat.startsWith(normalizedQuery)) {
          catScore = 400;
        } else if (normalizedCat.includes(normalizedQuery)) {
          catScore = 200;
        }

        if (catScore > score) {
          score = catScore;
          suggestionText = `Danh mục ${product.cat}`;
          suggestionType = 'category';
        }
      }

      // Check brand - lower priority
      if (product.brand) {
        const normalizedBrand = normalizeText(product.brand);
        let brandScore = 0;
        
        if (normalizedBrand === normalizedQuery) {
          brandScore = 300;
        } else if (normalizedBrand.startsWith(normalizedQuery)) {
          brandScore = 250;
        } else if (normalizedBrand.includes(normalizedQuery)) {
          brandScore = 100;
        }

        if (brandScore > score) {
          score = brandScore;
          suggestionText = product.brand;
          suggestionType = 'brand';
        }
      }

      // Add to suggestions if has match
      if (suggestionText && score > 0) {
        suggestionsWithScore.push({
          text: suggestionText,
          score,
          type: suggestionType
        });
      }
    });

    // Sort by score and remove duplicates
    const uniqueSuggestions = new Map();
    suggestionsWithScore
      .sort((a, b) => b.score - a.score)
      .forEach((item) => {
        if (!uniqueSuggestions.has(item.text)) {
          uniqueSuggestions.set(item.text, item);
        }
      });

    return Array.from(uniqueSuggestions.values())
      .slice(0, limit)
      .map((item) => item.text);
  } catch (error) {
    console.error("Error in getSearchSuggestionsFromArray:", error);
    return [];
  }
}

/**
 * Get search suggestions based on query (uses localStorage - for backward compatibility)
 * Returns product names, categories, and brands that match
 * Hiển thị ngay từ ký tự đầu tiên
 */
export function getSearchSuggestions(query, limit = 10) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  try {
    const products = getAllProducts();
    return getSearchSuggestionsFromArray(products, query, limit);
  } catch (error) {
    console.error("Error in getSearchSuggestions:", error);
    return [];
  }
}

/**
 * Search posts/articles by title, category, tags, excerpt, or content
 * Note: This is a synchronous wrapper, but getAllPosts is async
 * For now, return empty array and handle async search in component
 */
export function searchPosts(query) {
  if (!query || query.trim().length === 0) {
    return [];
  }

  // getAllPosts is async, so we can't use it synchronously here
  // Return empty array for now - async search should be handled in component
  // This prevents the crash but searchPosts won't work until we refactor
  console.warn('searchPosts: getAllPosts is async, returning empty array. Use async search in component instead.');
  return [];
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

