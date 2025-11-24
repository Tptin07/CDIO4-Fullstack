// src/services/posts.js
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Lấy danh sách bài viết với filter, sort, pagination
 * Returns: { posts: [], pagination: { total, page, limit, totalPages } }
 */
export async function getAllPosts(filters = {}) {
  try {
    const {
      q = '',
      cat = 'Tất cả',
      tag = '',
      sort = 'newest',
      page = 1,
      limit = 9,
    } = filters;

    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (cat) params.append('cat', cat);
    if (tag) params.append('tag', tag);
    if (sort) params.append('sort', sort);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await api.get(`/posts?${params.toString()}`);
    
    if (response.data && response.data.success) {
      const data = response.data.data || {};
      return {
        posts: data.posts || [],
        pagination: data.pagination || {
          total: 0,
          page: 1,
          limit: 9,
          totalPages: 1
        }
      };
    }
    
    console.warn('API response không có success flag:', response.data);
    return { posts: [], pagination: { total: 0, page: 1, limit: 9, totalPages: 1 } };
  } catch (error) {
    console.error('Error fetching posts:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    // Return empty result on error to prevent crashes
    return { posts: [], pagination: { total: 0, page: 1, limit: 9, totalPages: 1 } };
  }
}

/**
 * Lấy bài viết theo ID
 */
export async function getPostById(id) {
  try {
    const response = await api.get(`/posts/${id}`);
    
    if (response.data.success) {
      return response.data.data || null;
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching post:', error);
    if (error.response?.status === 404) {
      return null;
    }
    return null;
  }
}

/**
 * Lấy bài viết liên quan
 */
export async function getRelatedPosts(post, n = 6) {
  try {
    if (!post || !post.id) {
      return [];
    }

    const response = await api.get(`/posts/${post.id}/related?limit=${n}`);
    
    if (response.data.success) {
      return response.data.data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

/**
 * Lấy bài viết nổi bật (cho sidebar)
 */
export async function getPopularPosts(limit = 6) {
  try {
    const response = await api.get(`/posts/popular?limit=${limit}`);
    
    if (response.data.success) {
      return response.data.data || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching popular posts:', error);
    return [];
  }
}

// Legacy functions for backward compatibility (if needed)
// These are kept for any code that might still use them
export function createPost(postData) {
  console.warn('createPost is not implemented via API. Use admin API instead.');
  throw new Error('createPost is not available in public API');
}

export function updatePost(id, updates) {
  console.warn('updatePost is not implemented via API. Use admin API instead.');
  throw new Error('updatePost is not available in public API');
}

export function deletePost(id) {
  console.warn('deletePost is not implemented via API. Use admin API instead.');
  throw new Error('deletePost is not available in public API');
}
