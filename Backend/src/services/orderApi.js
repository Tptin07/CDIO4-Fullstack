// src/services/orderApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';

// Tạo axios instance với config mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Tạo đơn hàng mới
 * @param {Object} orderData - Dữ liệu đơn hàng
 * @param {number} orderData.address_id - ID địa chỉ giao hàng
 * @param {string} orderData.payment_method - Phương thức thanh toán (COD, bank_transfer, credit_card, e_wallet)
 * @param {string} orderData.shipping_method - Phương thức vận chuyển
 * @param {string} orderData.coupon_code - Mã coupon (optional)
 * @param {string} orderData.note - Ghi chú (optional)
 * @returns {Promise<Object>} - Thông tin đơn hàng đã tạo
 */
export async function createOrder(orderData) {
  try {
    // Log để debug
    console.log("📤 orderApi.createOrder - Sending data:", {
      address_id: orderData.address_id,
      address_id_type: typeof orderData.address_id,
      address_id_value: JSON.stringify(orderData.address_id),
      payment_method: orderData.payment_method,
      shipping_method: orderData.shipping_method,
      coupon_code: orderData.coupon_code,
      note: orderData.note,
      full_orderData: orderData,
    });

    // Validate address_id trước khi gửi
    if (!orderData.address_id) {
      throw new Error("address_id không được để trống");
    }

    // Validate address_id - loại bỏ ID tạm thời và ID bắt đầu bằng 0
    const idString = orderData.address_id.toString();
    
    // Loại bỏ ID bắt đầu bằng "0-" (ID tạm thời)
    if (idString.startsWith('0-')) {
      console.error("❌ orderApi.createOrder - Rejected temporary ID (starts with 0-):", orderData.address_id);
      throw new Error(`Địa chỉ giao hàng không hợp lệ: ID tạm thời không được phép`);
    }
    
    // Loại bỏ mọi ký tự không phải số và parse thành số nguyên
    const cleanAddressId = idString.replace(/[^0-9]/g, '');
    
    // Loại bỏ ID bắt đầu bằng 0
    if (cleanAddressId.length > 1 && cleanAddressId.startsWith('0')) {
      console.error("❌ orderApi.createOrder - Rejected ID starting with 0:", orderData.address_id, "cleaned:", cleanAddressId);
      throw new Error(`Địa chỉ giao hàng không hợp lệ: ID bắt đầu bằng 0 không được phép`);
    }
    
    const addressIdInt = parseInt(cleanAddressId);
    
    if (isNaN(addressIdInt) || addressIdInt <= 0 || addressIdInt.toString().charAt(0) === '0') {
      console.error("❌ orderApi.createOrder - Invalid address_id:", {
        original: orderData.address_id,
        type: typeof orderData.address_id,
        cleaned: cleanAddressId,
        parsed: addressIdInt
      });
      throw new Error(`Địa chỉ giao hàng không hợp lệ: ${orderData.address_id}`);
    }

    // Đảm bảo address_id là số nguyên
    const validatedOrderData = {
      ...orderData,
      address_id: addressIdInt,
    };
    
    console.log("✅ orderApi.createOrder - Validated address_id:", {
      original: orderData.address_id,
      cleaned: cleanAddressId,
      final: addressIdInt,
      type: typeof addressIdInt
    });

    const response = await api.post('/orders', validatedOrderData);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tạo đơn hàng');
    }
  } catch (error) {
    console.error("❌ orderApi.createOrder - Error:", error);
    console.error("❌ orderApi.createOrder - Error response:", error.response?.data);
    const message =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi tạo đơn hàng';
    throw new Error(message);
  }
}

/**
 * Lấy danh sách đơn hàng của user
 * @returns {Promise<Array>} - Danh sách đơn hàng
 */
export async function getUserOrders() {
  try {
    console.log('📤 orderApi.getUserOrders - Requesting orders from API');
    const response = await api.get('/orders');

    console.log('📥 orderApi.getUserOrders - Response:', {
      success: response.data.success,
      dataLength: response.data.data?.length || 0,
      hasData: !!response.data.data
    });

    if (response.data.success) {
      const orders = response.data.data || [];
      console.log('✅ orderApi.getUserOrders - Returning orders:', orders.length);
      if (orders.length > 0) {
        console.log('📦 First order sample:', {
          id: orders[0].id,
          order_code: orders[0].order_code,
          status: orders[0].status,
          item_count: orders[0].item_count,
          items: orders[0].items?.length || 0
        });
      }
      return orders;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy danh sách đơn hàng');
    }
  } catch (error) {
    console.error('❌ orderApi.getUserOrders - Error:', error);
    
    // Log chi tiết error response
    if (error.response) {
      console.error('❌ Error Response Status:', error.response.status);
      console.error('❌ Error Response Data:', JSON.stringify(error.response.data, null, 2));
      console.error('❌ Error Response Headers:', error.response.headers);
    } else if (error.request) {
      console.error('❌ Error Request:', error.request);
      console.error('❌ No response received from server');
    } else {
      console.error('❌ Error Message:', error.message);
    }
    
    // Trích xuất message chi tiết từ response
    const errorData = error.response?.data || {};
    const message = 
      errorData.message || 
      errorData.error || 
      error.message || 
      'Lỗi khi lấy danh sách đơn hàng';
    
    // Tạo error object với thông tin chi tiết
    const detailedError = new Error(message);
    detailedError.status = error.response?.status;
    detailedError.errorData = errorData;
    throw detailedError;
  }
}

/**
 * Hủy đơn hàng (cập nhật trạng thái thành cancelled)
 * @param {number|string} orderId - ID đơn hàng
 * @param {string} reason - Lý do hủy đơn hàng
 * @returns {Promise<Object>} - Thông tin đơn hàng đã hủy
 */
export async function cancelOrder(orderId, reason = '') {
  try {
    // Validate orderId - loại bỏ ID tạm thời và ID bắt đầu bằng 0
    const idString = orderId.toString();
    
    // Loại bỏ ID bắt đầu bằng "0-" (ID tạm thời)
    if (idString.startsWith('0-')) {
      console.error("❌ orderApi.cancelOrder - Rejected temporary ID (starts with 0-):", orderId);
      throw new Error(`ID đơn hàng không hợp lệ: ID tạm thời không được phép`);
    }
    
    const cleanId = idString.replace(/[^0-9]/g, '');
    
    // Loại bỏ ID bắt đầu bằng 0
    if (cleanId.length > 1 && cleanId.startsWith('0')) {
      console.error("❌ orderApi.cancelOrder - Rejected ID starting with 0:", orderId, "cleaned:", cleanId);
      throw new Error(`ID đơn hàng không hợp lệ: ID bắt đầu bằng 0 không được phép`);
    }
    
    const validatedOrderId = parseInt(cleanId);
    
    if (isNaN(validatedOrderId) || validatedOrderId <= 0 || validatedOrderId.toString().charAt(0) === '0') {
      console.error("❌ orderApi.cancelOrder - Invalid orderId:", {
        original: orderId,
        cleaned: cleanId,
        parsed: validatedOrderId
      });
      throw new Error(`ID đơn hàng không hợp lệ: ${orderId}`);
    }
    
    // Gửi lý do hủy đơn qua note nếu có
    const requestBody = {
      status: 'cancelled'
    };
    
    if (reason && reason.trim()) {
      requestBody.note = `[Hủy đơn] Lý do: ${reason.trim()}`;
    }
    
    const response = await api.put(`/orders/${validatedOrderId}/status`, requestBody);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi hủy đơn hàng');
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi hủy đơn hàng';
    throw new Error(message);
  }
}

/**
 * Lấy chi tiết đơn hàng
 * @param {number|string} orderId - ID đơn hàng
 * @returns {Promise<Object>} - Chi tiết đơn hàng
 */
export async function getOrderById(orderId) {
  try {
    // Validate orderId - loại bỏ ID tạm thời và ID bắt đầu bằng 0
    const idString = orderId.toString();
    
    // Loại bỏ ID bắt đầu bằng "0-" (ID tạm thời)
    if (idString.startsWith('0-')) {
      console.error("❌ orderApi.getOrderById - Rejected temporary ID (starts with 0-):", orderId);
      throw new Error(`ID đơn hàng không hợp lệ: ID tạm thời không được phép`);
    }
    
    const cleanId = idString.replace(/[^0-9]/g, '');
    
    // Loại bỏ ID bắt đầu bằng 0
    if (cleanId.length > 1 && cleanId.startsWith('0')) {
      console.error("❌ orderApi.getOrderById - Rejected ID starting with 0:", orderId, "cleaned:", cleanId);
      throw new Error(`ID đơn hàng không hợp lệ: ID bắt đầu bằng 0 không được phép`);
    }
    
    const validatedOrderId = parseInt(cleanId);
    
    if (isNaN(validatedOrderId) || validatedOrderId <= 0 || validatedOrderId.toString().charAt(0) === '0') {
      console.error("❌ orderApi.getOrderById - Invalid orderId:", {
        original: orderId,
        cleaned: cleanId,
        parsed: validatedOrderId
      });
      throw new Error(`ID đơn hàng không hợp lệ: ${orderId}`);
    }
    
    const response = await api.get(`/orders/${validatedOrderId}`);

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy thông tin đơn hàng');
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi lấy thông tin đơn hàng';
    throw new Error(message);
  }
}

