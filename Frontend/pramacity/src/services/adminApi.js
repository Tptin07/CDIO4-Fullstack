// src/services/adminApi.js
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Log API base URL for debugging
console.log('🔧 API Base URL:', API_BASE);

// Helper function to get auth token
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Helper function to check if backend is reachable
async function checkBackendConnection() {
  try {
    const response = await fetch(`${API_BASE.replace('/api', '')}/api/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const url = `${API_BASE}${endpoint}`;
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };
  
  // Log request for debugging
  console.log('🔵 API Request:', {
    method: options.method || 'GET',
    url,
    hasToken: !!token,
    endpoint
  });
  
  try {
    // Check backend connection first (only for GET requests to avoid overhead)
    if ((!options.method || options.method === 'GET') && endpoint.includes('/admin/')) {
      const isBackendUp = await checkBackendConnection();
      if (!isBackendUp) {
        throw new Error('Backend server không phản hồi. Vui lòng kiểm tra:\n1. Backend có đang chạy tại http://localhost:3000 không?\n2. Database có được kết nối không?\n3. Kiểm tra terminal của backend để xem có lỗi gì không.');
      }
    }
    
    const response = await fetch(url, config);
    
    // Check if response is ok before trying to parse JSON
    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch (e) {
        // If response is not JSON, use status text
        const text = await response.text();
        if (text) errorMessage = text.substring(0, 200);
      }
      
      console.error('❌ API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        message: errorMessage,
        url
      });
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('✅ API Success:', { endpoint, hasData: !!data.data });
    return data;
  } catch (error) {
    // Handle network errors
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('❌ Network Error:', {
        message: 'Không thể kết nối đến server',
        url,
        endpoint,
        apiBase: API_BASE
      });
      throw new Error('Không thể kết nối đến server. Vui lòng kiểm tra backend có đang chạy không.');
    }
    
    console.error('❌ API Error:', {
      message: error.message,
      url,
      endpoint
    });
    throw error;
  }
}

// ===== DASHBOARD STATS =====
export async function getDashboardStats() {
  const response = await apiRequest('/admin/stats');
  return response.data;
}

export async function getDetailedStatistics(period = 'month', type = 'all') {
  const params = new URLSearchParams();
  if (period) params.append('period', period);
  if (type) params.append('type', type);
  const queryString = params.toString();
  const url = `/admin/stats/detailed${queryString ? `?${queryString}` : ''}`;
  console.log('📊 Calling API:', url);
  
  try {
    const response = await apiRequest(url);
    console.log('📊 API Raw Response:', response);
    console.log('📊 API Response structure:', {
      hasResponse: !!response,
      hasData: !!response?.data,
      success: response?.success,
      revenueLength: response?.data?.revenue?.length || 0,
      revenueExists: !!response?.data?.revenue,
      responseKeys: Object.keys(response || {}),
      dataKeys: response?.data ? Object.keys(response.data) : [],
    });
    
    // API trả về { success: true, data: {...} }
    // Hoặc có thể trả về trực tiếp { revenue: [...], ... }
    let result = {};
    
    if (response?.success && response?.data) {
      // Format: { success: true, data: { revenue: [...], ... } }
      result = response.data;
    } else if (response?.revenue !== undefined || response?.topSellingProducts !== undefined) {
      // Format: { revenue: [...], topSellingProducts: [...], ... }
      result = response;
    } else if (response?.data) {
      // Format: { data: { revenue: [...], ... } }
      result = response.data;
    } else {
      // Fallback
      result = response || {};
    }
    
    console.log('📊 Parsed result:', {
      revenue: result.revenue?.length || 0,
      topSellingProducts: result.topSellingProducts?.length || 0,
      mostViewedProducts: result.mostViewedProducts?.length || 0,
      favoriteProducts: result.favoriteProducts?.length || 0,
      categoryViews: result.categoryViews?.length || 0,
      totalViews: result.totalViews,
      resultKeys: Object.keys(result),
    });
    
    if (result.revenue && result.revenue.length > 0) {
      console.log('✅ Revenue data found:', result.revenue.length, 'items');
      console.log('📊 Sample revenue:', result.revenue.slice(0, 2));
    } else {
      console.warn('⚠️ No revenue in parsed result!');
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error in getDetailedStatistics:', error);
    throw error;
  }
}

// ===== USERS MANAGEMENT =====
export async function getAllUsers() {
  const response = await apiRequest('/admin/users');
  return response.data;
}

export async function getAllEmployees() {
  const response = await apiRequest('/admin/employees');
  return response.data;
}

export async function createUser(userData) {
  const response = await apiRequest('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
  return response.data;
}

export async function updateUser(userId, updates) {
  const response = await apiRequest(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
}

export async function toggleUserLock(userId) {
  const response = await apiRequest(`/admin/users/${userId}/lock`, {
    method: 'PATCH',
  });
  return response.data;
}

export async function deleteUser(userId) {
  const response = await apiRequest(`/admin/users/${userId}`, {
    method: 'DELETE',
  });
  return response;
}

// ===== ORDERS MANAGEMENT =====
export async function getAllOrders(status = 'all') {
  const params = status !== 'all' ? `?status=${status}` : '';
  console.log('📤 getAllOrders request:', { status, params, endpoint: `/admin/orders${params}` });
  const response = await apiRequest(`/admin/orders${params}`);
  console.log('📥 getAllOrders response:', { 
    success: response?.success, 
    hasData: !!response?.data, 
    dataType: Array.isArray(response?.data) ? 'array' : typeof response?.data,
    dataLength: Array.isArray(response?.data) ? response.data.length : 'N/A'
  });
  
  // Backend trả về { success: true, data: orders }
  // apiRequest trả về response.json() = { success: true, data: orders }
  // Cần trả về array orders, không phải object { success, data }
  if (response && response.success && Array.isArray(response.data)) {
    return response.data;
  }
  console.warn('⚠️ getAllOrders: Unexpected response format', response);
  return [];
}

export async function getOrderById(orderId) {
  const response = await apiRequest(`/admin/orders/${orderId}`);
  return response.data;
}

export async function updateOrderStatus(orderId, status, label, description) {
  const response = await apiRequest(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, label, description }),
  });
  return response;
}

export async function deleteOrder(orderId) {
  const response = await apiRequest(`/admin/orders/${orderId}`, {
    method: 'DELETE',
  });
  return response;
}

// ===== PRODUCTS MANAGEMENT =====
export async function getAllProductsAdmin(search = '', category = 'all', sort = 'newest') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (category !== 'all') params.append('category', category);
  if (sort) params.append('sort', sort);
  
  const queryString = params.toString();
  const url = `/admin/products${queryString ? `?${queryString}` : ''}`;
  const response = await apiRequest(url);
  return response.data;
}

export async function getProductByIdAdmin(productId) {
  const response = await apiRequest(`/admin/products/${productId}`);
  return response.data;
}

export async function createProduct(productData) {
  const response = await apiRequest('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData),
  });
  return response.data;
}

export async function updateProduct(productId, updates) {
  const response = await apiRequest(`/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
}

export async function deleteProduct(productId) {
  const response = await apiRequest(`/admin/products/${productId}`, {
    method: 'DELETE',
  });
  // Return message if available
  return response.data || response;
}

// ===== CATEGORIES MANAGEMENT =====
export async function getAllCategoriesAdmin() {
  const response = await apiRequest('/admin/categories');
  return response.data;
}

export async function getCategoryByIdAdmin(categoryId) {
  const response = await apiRequest(`/admin/categories/${categoryId}`);
  return response.data;
}

export async function getCategoryProducts(categoryId, search = '', sort = 'newest') {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (sort) params.append('sort', sort);
  const queryString = params.toString();
  const url = `/admin/categories/${categoryId}/products${queryString ? `?${queryString}` : ''}`;
  const response = await apiRequest(url);
  return response.data;
}

export async function createCategory(categoryData) {
  const response = await apiRequest('/admin/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
  return response.data;
}

export async function updateCategory(categoryId, updates) {
  const response = await apiRequest(`/admin/categories/${categoryId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
}

export async function deleteCategory(categoryId) {
  const response = await apiRequest(`/admin/categories/${categoryId}`, {
    method: 'DELETE',
  });
  return response.data || response;
}

export async function getCategoryProductCount(categoryId) {
  const categories = await getAllCategoriesAdmin();
  const category = categories.find(c => c.id === categoryId || c.name === categoryId);
  return category?.productCount || 0;
}

// ===== POSTS MANAGEMENT =====
export async function getAllPostsAdmin(search = '') {
  const params = search ? `?search=${encodeURIComponent(search)}` : '';
  const response = await apiRequest(`/admin/posts${params}`);
  return response.data;
}

export async function getPostByIdAdmin(postId) {
  const response = await apiRequest(`/admin/posts/${postId}`);
  return response.data;
}

export async function createPost(postData) {
  const response = await apiRequest('/admin/posts', {
    method: 'POST',
    body: JSON.stringify(postData),
  });
  return response.data;
}

export async function updatePost(postId, updates) {
  const response = await apiRequest(`/admin/posts/${postId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
}

export async function deletePost(postId) {
  const response = await apiRequest(`/admin/posts/${postId}`, {
    method: 'DELETE',
  });
  return response;
}

// ===== NOTIFICATIONS MANAGEMENT =====
export async function getAllNotifications(limit = 50, offset = 0) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  if (offset) params.append('offset', offset);
  const queryString = params.toString();
  const url = `/admin/notifications${queryString ? `?${queryString}` : ''}`;
  const response = await apiRequest(url);
  return response.data;
}

export async function getUnreadNotifications(limit = 50) {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit);
  const queryString = params.toString();
  const url = `/admin/notifications/unread${queryString ? `?${queryString}` : ''}`;
  const response = await apiRequest(url);
  return {
    notifications: response.data,
    unreadCount: response.unreadCount || 0,
  };
}

export async function markNotificationAsRead(notificationId) {
  const response = await apiRequest(`/admin/notifications/${notificationId}/read`, {
    method: 'PUT',
  });
  return response.data;
}

export async function markAllNotificationsAsRead() {
  const response = await apiRequest('/admin/notifications/read-all', {
    method: 'PUT',
  });
  return response;
}

export async function deleteNotification(notificationId) {
  const response = await apiRequest(`/admin/notifications/${notificationId}`, {
    method: 'DELETE',
  });
  return response;
}

export async function deleteAllReadNotifications() {
  const response = await apiRequest('/admin/notifications/read-all', {
    method: 'DELETE',
  });
  return response;
}

// ===== PROMOTIONS/COUPONS MANAGEMENT =====
export async function getAllPromotions() {
  const response = await apiRequest('/admin/coupons');
  return response.data;
}

export async function getPromotionById(promotionId) {
  const response = await apiRequest(`/admin/coupons/${promotionId}`);
  return response.data;
}

export async function createPromotion(promotionData) {
  const response = await apiRequest('/admin/coupons', {
    method: 'POST',
    body: JSON.stringify(promotionData),
  });
  return response.data;
}

export async function updatePromotion(promotionId, updates) {
  const response = await apiRequest(`/admin/coupons/${promotionId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
}

export async function deletePromotion(promotionId) {
  const response = await apiRequest(`/admin/coupons/${promotionId}`, {
    method: 'DELETE',
  });
  return response.data || response;
}

// ===== SERVICES MANAGEMENT =====
export async function getAllServicesAdmin(status = 'all', search = '') {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (search) params.append('search', search);
  const queryString = params.toString();
  const response = await apiRequest(`/admin/services${queryString ? `?${queryString}` : ''}`);
  return response.data;
}

export async function createServiceAdmin(serviceData) {
  const response = await apiRequest('/admin/services', {
    method: 'POST',
    body: JSON.stringify(serviceData),
  });
  return response.data;
}

export async function updateServiceAdmin(serviceId, updates) {
  const response = await apiRequest(`/admin/services/${serviceId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
}

export async function deleteServiceAdmin(serviceId) {
  const response = await apiRequest(`/admin/services/${serviceId}`, {
    method: 'DELETE',
  });
  return response.data || response;
}

// ===== APPOINTMENTS MANAGEMENT =====
export async function getAllAppointmentsAdmin({
  status = 'all',
  search = '',
  from = '',
  to = '',
} = {}) {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.append('status', status);
  if (search) params.append('search', search);
  if (from) params.append('from', from);
  if (to) params.append('to', to);
  const queryString = params.toString();
  const response = await apiRequest(`/admin/appointments${queryString ? `?${queryString}` : ''}`);
  return response.data;
}

export async function getAppointmentByIdAdmin(appointmentId) {
  const response = await apiRequest(`/admin/appointments/${appointmentId}`);
  return response.data;
}

export async function updateAppointmentStatusAdmin(appointmentId, status, note = '') {
  const response = await apiRequest(`/admin/appointments/${appointmentId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status, note }),
  });
  return response.data;
}

export async function deleteAppointmentAdmin(appointmentId) {
  const response = await apiRequest(`/admin/appointments/${appointmentId}`, {
    method: 'DELETE',
  });
  return response;
}

