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
  console.log("📡 [chatApi] getConversations - Bắt đầu");
  console.log("   URL:", '/chat/conversations');
  console.log("   Params:", { limit, offset });
  
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("   Token:", token ? "Có" : "Không có");
    
    const response = await api.get('/chat/conversations', {
      params: { limit, offset }
    });
    
    console.log("   ✅ Response status:", response.status);
    console.log("   ✅ Response data:", response.data);
    console.log("   ✅ Response success:", response.data.success);
    console.log("   ✅ Response data.data:", response.data.data);
    
    if (response.data.success) {
      const result = response.data.data || [];
      console.log("   ✅ Trả về", result.length, "conversations");
      return result;
    } else {
      console.error("   ❌ API trả về success=false:", response.data.message);
      throw new Error(response.data.message || 'Lỗi khi lấy danh sách cuộc trò chuyện');
    }
  } catch (error) {
    console.error('❌ [chatApi] Error fetching conversations:', error);
    console.error("   Error code:", error.code);
    console.error("   Error message:", error.message);
    console.error("   Error response:", error.response?.data);
    console.error("   Error status:", error.response?.status);
    console.error("   Error config:", error.config?.url, error.config?.method);
    
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
  console.log("📡 [chatApi] getMessages - Bắt đầu");
  console.log("   conversationId:", conversationId);
  console.log("   URL:", `/chat/messages/${conversationId}`);
  console.log("   Params:", { limit, offset });
  
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("   Token:", token ? "Có" : "Không có");
    
    const response = await api.get(`/chat/messages/${conversationId}`, {
      params: { limit, offset }
    });
    
    console.log("   ✅ Response status:", response.status);
    console.log("   ✅ Response data:", response.data);
    console.log("   ✅ Response success:", response.data.success);
    console.log("   ✅ Response data.data:", response.data.data);
    
    if (response.data.success) {
      const result = response.data.data || [];
      console.log("   ✅ Trả về", result.length, "messages");
      return result;
    } else {
      console.error("   ❌ API trả về success=false:", response.data.message);
      throw new Error(response.data.message || 'Lỗi khi lấy tin nhắn');
    }
  } catch (error) {
    console.error('❌ [chatApi] Error fetching messages:', error);
    console.error("   Error code:", error.code);
    console.error("   Error message:", error.message);
    console.error("   Error response:", error.response?.data);
    console.error("   Error status:", error.response?.status);
    console.error("   Error config:", error.config?.url, error.config?.method);
    
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
  console.log("📡 [chatApi] sendMessage - Bắt đầu");
  console.log("   URL:", '/chat/send');
  console.log("   Body:", { message, conversation_id, receiver_id, message_type });
  
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("   Token:", token ? "Có" : "Không có");
    
    const response = await api.post('/chat/send', {
      message,
      conversation_id,
      receiver_id,
      message_type
    });
    
    console.log("   ✅ Response status:", response.status);
    console.log("   ✅ Response data:", response.data);
    console.log("   ✅ Response success:", response.data.success);
    console.log("   ✅ Response data.data:", response.data.data);
    
    if (response.data.success) {
      console.log("   ✅ Trả về message thành công");
      return response.data.data;
    } else {
      console.error("   ❌ API trả về success=false:", response.data.message);
      throw new Error(response.data.message || 'Lỗi khi gửi tin nhắn');
    }
  } catch (error) {
    console.error('❌ [chatApi] Error sending message:', error);
    console.error("   Error code:", error.code);
    console.error("   Error message:", error.message);
    console.error("   Error response:", error.response?.data);
    console.error("   Error status:", error.response?.status);
    console.error("   Error config:", error.config?.url, error.config?.method);
    
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

/**
 * Xóa conversation (chỉ dành cho employee/admin)
 */
export async function deleteConversation(conversationId) {
  console.log("📡 [chatApi] deleteConversation - Bắt đầu");
  console.log("   conversationId:", conversationId);
  console.log("   URL:", `/chat/conversation/${conversationId}`);
  
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("   Token:", token ? "Có" : "Không có");
    
    const response = await api.delete(`/chat/conversation/${conversationId}`);
    
    console.log("   ✅ Response status:", response.status);
    console.log("   ✅ Response data:", response.data);
    console.log("   ✅ Response success:", response.data.success);
    
    if (response.data.success) {
      console.log("   ✅ Xóa conversation thành công");
      return response.data.data;
    } else {
      console.error("   ❌ API trả về success=false:", response.data.message);
      throw new Error(response.data.message || 'Lỗi khi xóa cuộc trò chuyện');
    }
  } catch (error) {
    console.error('❌ [chatApi] Error deleting conversation:', error);
    console.error("   Error code:", error.code);
    console.error("   Error message:", error.message);
    console.error("   Error response:", error.response?.data);
    console.error("   Error status:", error.response?.status);
    console.error("   Error config:", error.config?.url, error.config?.method);
    
    if (error.response) {
      throw error;
    }
    throw new Error('Có lỗi xảy ra khi xóa cuộc trò chuyện');
  }
}

/**
 * Lấy hoặc tạo conversation cho customer
 */
export async function getOrCreateCustomerConversation() {
  console.log("📡 [chatApi] getOrCreateCustomerConversation - Bắt đầu");
  console.log("   URL:", '/chat/customer/conversation');
  
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    console.log("   Token:", token ? "Có" : "Không có");
    
    const response = await api.get('/chat/customer/conversation');
    
    console.log("   ✅ Response status:", response.status);
    console.log("   ✅ Response data:", response.data);
    console.log("   ✅ Response success:", response.data.success);
    console.log("   ✅ Response data.data:", response.data.data);
    
    if (response.data.success) {
      console.log("   ✅ Trả về conversation thành công");
      return response.data.data;
    } else {
      console.error("   ❌ API trả về success=false:", response.data.message);
      throw new Error(response.data.message || 'Lỗi khi lấy hoặc tạo cuộc trò chuyện');
    }
  } catch (error) {
    console.error('❌ [chatApi] Error fetching/creating customer conversation:', error);
    console.error("   Error code:", error.code);
    console.error("   Error message:", error.message);
    console.error("   Error response:", error.response?.data);
    console.error("   Error status:", error.response?.status);
    console.error("   Error config:", error.config?.url, error.config?.method);
    
    // Nếu là lỗi network, giữ nguyên error để frontend có thể xử lý
    if (error.code === "ERR_NETWORK" || error.message?.includes("CONNECTION_REFUSED")) {
      throw error;
    }
    if (error.response) {
      throw error;
    }
    throw new Error('Có lỗi xảy ra khi lấy hoặc tạo cuộc trò chuyện');
  }
}

