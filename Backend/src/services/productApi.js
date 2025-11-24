// src/services/productApi.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Lấy danh sách sản phẩm với filter, sort, pagination
 */
export async function getProducts(filters = {}) {
  try {
    const {
      q = '',
      cat = 'Tất cả',
      brand = 'Tất cả',
      form = 'Tất cả',
      sort = 'pho-bien',
      page = 1,
      limit = 6,
    } = filters;

    const params = new URLSearchParams();
    if (q) params.append('q', q);
    if (cat) params.append('cat', cat);
    if (brand) params.append('brand', brand);
    if (form) params.append('form', form);
    if (sort) params.append('sort', sort);
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const response = await api.get(`/products?${params.toString()}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy danh sách sản phẩm');
    }
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    // Trả về data rỗng thay vì throw để tránh crash component
    if (error.response) {
      // Server trả về response nhưng có lỗi
      console.error('Response error:', error.response.status, error.response.data);
    } else if (error.request) {
      // Request được gửi nhưng không nhận được response
      console.error('No response received:', error.request);
    } else {
      // Lỗi khi setup request
      console.error('Request setup error:', error.message);
    }
    throw error;
  }
}

/**
 * Lấy danh sách filters (categories, brands, forms)
 */
export async function getFilters() {
  try {
    const response = await api.get('/products/filters');
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy danh sách bộ lọc');
    }
  } catch (error) {
    console.error('❌ Error fetching filters:', error);
    throw error;
  }
}

/**
 * Lấy chi tiết sản phẩm theo ID
 */
export async function getProductById(id) {
  try {
    const response = await api.get(`/products/${id}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Không tìm thấy sản phẩm');
    }
  } catch (error) {
    console.error('❌ Error fetching product:', error);
    throw error;
  }
}

/**
 * Lấy sản phẩm liên quan
 */
export async function getRelatedProducts(id, limit = 3) {
  try {
    const response = await api.get(`/products/${id}/related?limit=${limit}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy sản phẩm liên quan');
    }
  } catch (error) {
    console.error('❌ Error fetching related products:', error);
    throw error;
  }
}

/**
 * Lấy sản phẩm nổi bật (featured)
 */
export async function getFeaturedProducts(limit = 8) {
  try {
    const response = await api.get(`/products/featured?limit=${limit}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy sản phẩm nổi bật');
    }
  } catch (error) {
    console.error('❌ Error fetching featured products:', error);
    throw error;
  }
}

/**
 * Lấy sản phẩm mới (new products)
 */
export async function getNewProducts(limit = 8) {
  try {
    const response = await api.get(`/products/new?limit=${limit}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy sản phẩm mới');
    }
  } catch (error) {
    console.error('❌ Error fetching new products:', error);
    throw error;
  }
}

/**
 * Lấy sản phẩm bán chạy (bestseller)
 */
export async function getBestsellerProducts(limit = 8) {
  try {
    const response = await api.get(`/products/bestseller?limit=${limit}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy sản phẩm bán chạy');
    }
  } catch (error) {
    console.error('❌ Error fetching bestseller products:', error);
    throw error;
  }
}

/**
 * Lấy sản phẩm khuyến mãi (sale products)
 */
export async function getSaleProducts(limit = 12) {
  try {
    const response = await api.get(`/products/sale?limit=${limit}`);
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy sản phẩm khuyến mãi');
    }
  } catch (error) {
    console.error('❌ Error fetching sale products:', error);
    throw error;
  }
}

/**
 * Lấy danh sách categories đầy đủ cho trang home
 */
export async function getCategoriesForHome() {
  try {
    const response = await api.get('/products/categories');
    
    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lấy danh sách danh mục');
    }
  } catch (error) {
    console.error('❌ Error fetching categories:', error);
    throw error;
  }
}

