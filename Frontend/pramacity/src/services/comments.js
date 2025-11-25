// src/services/comments.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token'; // Phải khớp với auth.js

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm token vào header nếu có
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Lấy danh sách bình luận của sản phẩm
 */
export async function getCommentsByProduct(productId, page = 1, limit = 10, status = 'approved') {
  try {
    // Validate productId - đảm bảo là số hợp lệ
    const productIdNum = Number(productId);
    if (!productId || isNaN(productIdNum) || productIdNum <= 0) {
      console.error('❌ Invalid productId:', productId);
      return {
        comments: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    }

    // Validate và normalize các tham số
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));

    console.log('📥 Fetching comments for product:', productIdNum, { page: pageNum, limit: limitNum });
    
    // Đảm bảo URL được build đúng cách với Axios params
    // Không gửi status vì backend mặc định là "approved"
    const response = await api.get(`/comments/product/${productIdNum}`, {
      params: { 
        page: pageNum, 
        limit: limitNum
      }
    });
    
    console.log('📦 Comments API response:', response.data);
    
    if (response.data.success) {
      const result = {
        comments: response.data.data || [],
        pagination: response.data.pagination || {}
      };
      console.log('✅ Comments loaded:', result.comments.length, 'comments');
      return result;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy danh sách bình luận');
    }
  } catch (error) {
    console.error('❌ Error fetching comments:', error);
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request params:', error.config?.params);
    }
    // Trả về data rỗng thay vì throw để tránh crash component
    return {
      comments: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  }
}

/**
 * Lấy một bình luận theo ID
 */
export async function getCommentById(commentId) {
  try {
    const response = await api.get(`/comments/${commentId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Không tìm thấy bình luận');
    }
  } catch (error) {
    console.error('❌ Error fetching comment:', error);
    throw error;
  }
}

/**
 * Thêm bình luận mới
 */
export async function addComment(productId, content, rating = 5, title = null) {
  try {
    const response = await api.post('/comments', {
      product_id: productId,
      content: content,
      rating: rating,
      title: title
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi thêm bình luận');
    }
  } catch (error) {
    console.error('❌ Error adding comment:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi khi thêm bình luận');
    }
    throw error;
  }
}

/**
 * Cập nhật bình luận
 */
export async function updateComment(commentId, content) {
  try {
    const response = await api.put(`/comments/${commentId}`, {
      content: content
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi cập nhật bình luận');
    }
  } catch (error) {
    console.error('❌ Error updating comment:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi khi cập nhật bình luận');
    }
    throw error;
  }
}

/**
 * Xóa bình luận
 */
export async function deleteComment(commentId) {
  try {
    const response = await api.delete(`/comments/${commentId}`);
    
    if (response.data.success) {
      return true;
    } else {
      throw new Error(response.data.message || 'Lỗi khi xóa bình luận');
    }
  } catch (error) {
    console.error('❌ Error deleting comment:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi khi xóa bình luận');
    }
    throw error;
  }
}

/**
 * Đếm số lượng bình luận của sản phẩm
 */
export async function getCommentCount(productId, status = 'approved') {
  try {
    // Validate productId - đảm bảo là số hợp lệ
    const productIdNum = Number(productId);
    if (!productId || isNaN(productIdNum) || productIdNum <= 0) {
      console.error('❌ Invalid productId for count:', productId);
      return 0;
    }

    // Không gửi status vì backend mặc định là "approved"
    const response = await api.get(`/comments/product/${productIdNum}/count`);
    
    if (response.data.success && response.data.data) {
      // response.data.data có thể là { count: number } hoặc number
      return typeof response.data.data === 'number' 
        ? response.data.data 
        : (response.data.data.count || 0);
    } else {
      return 0;
    }
  } catch (error) {
    console.error('❌ Error fetching comment count:', error);
    if (error.response) {
      console.error('Response error:', error.response.status, error.response.data);
      console.error('Request URL:', error.config?.url);
      console.error('Request params:', error.config?.params);
    }
    return 0;
  }
}

/**
 * Thêm reply của admin cho review
 */
export async function addReviewReply(reviewId, content) {
  try {
    const response = await api.post(`/comments/${reviewId}/replies`, {
      content: content
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi thêm trả lời');
    }
  } catch (error) {
    console.error('❌ Error adding review reply:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi khi thêm trả lời');
    }
    throw error;
  }
}

/**
 * Cập nhật reply của admin
 */
export async function updateReviewReply(replyId, content) {
  try {
    const response = await api.put(`/comments/replies/${replyId}`, {
      content: content
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi cập nhật trả lời');
    }
  } catch (error) {
    console.error('❌ Error updating review reply:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi khi cập nhật trả lời');
    }
    throw error;
  }
}

/**
 * Xóa reply của admin
 */
export async function deleteReviewReply(replyId) {
  try {
    const response = await api.delete(`/comments/replies/${replyId}`);
    
    if (response.data.success) {
      return true;
    } else {
      throw new Error(response.data.message || 'Lỗi khi xóa trả lời');
    }
  } catch (error) {
    console.error('❌ Error deleting review reply:', error);
    if (error.response) {
      throw new Error(error.response.data.message || 'Lỗi khi xóa trả lời');
    }
    throw error;
  }
}

