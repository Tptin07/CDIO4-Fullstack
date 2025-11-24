// src/services/chatApi.js
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
 * Lấy danh sách conversations (chỉ dành cho employee/admin)
 */
export async function getConversations(limit = 50, offset = 0) {
  try {
    const response = await api.get('/chat/conversations', {
      params: { limit, offset }
    });
    
    if (response.data.success) {
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy danh sách cuộc trò chuyện');
    }
  } catch (error) {
    console.error('❌ Error fetching conversations:', error);
    if (error.response) {
      throw error;
    }
    throw new Error('Có lỗi xảy ra khi lấy danh sách cuộc trò chuyện');
  }
}

/**
 * Lấy danh sách tin nhắn của một conversation
 */
export async function getMessages(conversationId, limit = 50, offset = 0) {
  try {
    const response = await api.get(`/chat/messages/${conversationId}`, {
      params: { limit, offset }
    });
    
    if (response.data.success) {
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy tin nhắn');
    }
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    if (error.response) {
      throw error;
    }
    throw new Error('Có lỗi xảy ra khi lấy tin nhắn');
  }
}

/**
 * Đánh dấu tin nhắn đã đọc
 */
export async function markAsRead(conversationId) {
  try {
    const response = await api.put(`/chat/messages/read/${conversationId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi đánh dấu đã đọc');
    }
  } catch (error) {
    console.error('❌ Error marking as read:', error);
    if (error.response) {
      throw error;
    }
    throw new Error('Có lỗi xảy ra khi đánh dấu đã đọc');
  }
}

/**
 * Gửi tin nhắn
 */
export async function sendMessage({ message, conversation_id, receiver_id, message_type = 'text' }) {
  try {
    const response = await api.post('/chat/send', {
      message,
      conversation_id,
      receiver_id,
      message_type
    });
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi gửi tin nhắn');
    }
  } catch (error) {
    console.error('❌ Error sending message:', error);
    if (error.response) {
      throw error;
    }
    throw new Error('Có lỗi xảy ra khi gửi tin nhắn');
  }
}

/**
 * Lấy thông tin một conversation
 */
export async function getConversation(conversationId) {
  try {
    const response = await api.get(`/chat/conversation/${conversationId}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy thông tin cuộc trò chuyện');
    }
  } catch (error) {
    console.error('❌ Error fetching conversation:', error);
    if (error.response) {
      throw error;
    }
    throw new Error('Có lỗi xảy ra khi lấy thông tin cuộc trò chuyện');
  }
}

/**
 * Lấy số lượng tin nhắn chưa đọc
 */
export async function getUnreadCount() {
  try {
    const response = await api.get('/chat/unread-count');
    
    if (response.data.success) {
      return response.data.data || { unread_count: 0 };
    } else {
      return { unread_count: 0 };
    }
  } catch (error) {
    console.error('❌ Error fetching unread count:', error);
    return { unread_count: 0 };
  }
}

