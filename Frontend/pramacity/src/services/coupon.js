// src/services/coupon.js
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
 * Validate và tính toán discount của coupon
 * @param {string} couponCode - Mã coupon
 * @param {number} orderAmount - Tổng tiền đơn hàng
 * @returns {Promise<Object>} - Thông tin discount
 */
export async function validateCoupon(couponCode, orderAmount) {
  try {
    const response = await api.post('/coupons/validate', {
      code: couponCode,
      order_amount: orderAmount,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Mã coupon không hợp lệ');
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi kiểm tra mã coupon';
    throw new Error(message);
  }
}

/**
 * Lấy danh sách coupon có sẵn (chỉ active và còn hiệu lực)
 * @returns {Promise<Array>} - Danh sách coupon
 */
export async function getAvailableCoupons() {
  try {
    const response = await api.get('/coupons/available');

    if (response.data.success) {
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy danh sách coupon');
    }
  } catch (error) {
    // Nếu API chưa có, trả về mảng rỗng
    if (error.response?.status === 404) {
      return [];
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi lấy danh sách coupon';
    throw new Error(message);
  }
}

/**
 * Lấy tất cả coupons (bao gồm cả hết hạn) cho trang user
 * @returns {Promise<Array>} - Danh sách tất cả coupon
 */
export async function getAllCoupons() {
  try {
    const response = await api.get('/coupons/all');

    if (response.data.success) {
      return response.data.data || [];
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy danh sách coupon');
    }
  } catch (error) {
    // Nếu API chưa có, trả về mảng rỗng
    if (error.response?.status === 404) {
      return [];
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      'Lỗi khi lấy danh sách coupon';
    throw new Error(message);
  }
}

