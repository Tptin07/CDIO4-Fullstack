// src/services/auth.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';
const TOKEN_KEY = 'auth_token';
const PROFILE_KEY = 'user_profile';

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

// Interceptor để xử lý lỗi response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      logout();
    }
    return Promise.reject(error);
  }
);

/**
 * Đăng ký user mới
 */
export async function signup({ name, email, password, phone }) {
  try {
    const response = await api.post('/auth/register', {
      name,
      email,
      password,
      phone: phone || null,
    });

    if (response.data.success) {
      const { token, user } = response.data.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
      return { token, user };
    } else {
      throw new Error(response.data.message || 'Đăng ký thất bại');
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Có lỗi xảy ra khi đăng ký';
    throw new Error(message);
  }
}

/**
 * Đăng nhập
 */
export async function login({ email, password }) {
  try {
    const response = await api.post('/auth/login', {
      email,
      password,
    });

    if (response.data.success) {
      const { token, user } = response.data.data;
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
      return { token, user };
    } else {
      throw new Error(response.data.message || 'Đăng nhập thất bại');
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Email hoặc mật khẩu không đúng';
    throw new Error(message);
  }
}

/**
 * Đăng xuất
 */
export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

/**
 * Lấy thông tin user hiện tại từ localStorage hoặc API
 */
export async function getCurrentUser() {
  // Thử lấy từ localStorage trước
  const profile = localStorage.getItem(PROFILE_KEY);
  if (profile) {
    try {
      return JSON.parse(profile);
    } catch {
      // Nếu parse lỗi, xóa và lấy từ API
    }
  }

  // Nếu không có trong localStorage, thử lấy từ API
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    return null;
  }

  try {
    const response = await api.get('/auth/me');
    if (response.data.success) {
      const user = response.data.data.user;
      localStorage.setItem(PROFILE_KEY, JSON.stringify(user));
      return user;
    }
  } catch (error) {
    // Nếu lỗi, xóa token và profile
    logout();
  }

  return null;
}

/**
 * User tự khóa tài khoản của mình (cần xác thực mật khẩu)
 */
export async function lockAccount(password) {
  try {
    const response = await api.post('/auth/lock-account', {
      password,
    });

    if (response.data.success) {
      return response.data;
    } else {
      throw new Error(response.data.message || 'Khóa tài khoản thất bại');
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Có lỗi xảy ra khi khóa tài khoản';
    throw new Error(message);
  }
}

/**
 * Cập nhật hồ sơ user
 */
export async function updateProfile({ id, name, phone, gender, birthday, date_of_birth, avatar }) {
  try {
    // Lấy thông tin hiện tại để đảm bảo có đầy đủ dữ liệu
    const currentProfile = await getCurrentUser();
    if (!currentProfile || currentProfile.id !== id) {
      throw new Error('User not found');
    }

    // Chuẩn bị dữ liệu để gửi
    const updateData = {
      name: name !== undefined ? name : currentProfile.name,
    };

    // Xử lý phone: CHỈ gửi khi được truyền vào (không tự động thêm)
    // Nếu phone là undefined, KHÔNG thêm vào updateData (backend sẽ giữ nguyên)
    if (phone !== undefined) {
      // Nếu phone là null, gửi null (để xóa phone)
      // Nếu phone là empty string hoặc chỉ có khoảng trắng, chuyển thành null
      if (phone === null) {
        updateData.phone = null;
      } else if (typeof phone === 'string') {
        updateData.phone = phone.trim() || null;
      } else {
        updateData.phone = null;
      }
    }
    // Nếu phone === undefined, KHÔNG thêm vào updateData (giữ nguyên trong DB)

    // Chỉ thêm gender nếu được cung cấp (không tự động thêm)
    if (gender !== undefined) {
      updateData.gender = gender;
    }

    // Chỉ thêm date_of_birth nếu được cung cấp (không tự động thêm)
    if (date_of_birth !== undefined || birthday !== undefined) {
      updateData.date_of_birth = date_of_birth !== undefined ? date_of_birth : birthday;
    }

    // Avatar: chỉ gửi khi được truyền vào (không tự động gửi currentProfile.avatar)
    // Nếu avatar là undefined, backend sẽ không cập nhật field này
    if (avatar !== undefined) {
      // Nếu avatar được truyền vào (có thể là base64 string, null, hoặc empty)
      updateData.avatar = avatar === '' ? null : avatar;
    }
    // Nếu avatar là undefined, không gửi field này (backend sẽ giữ nguyên giá trị hiện tại)

    console.log('📤 Sending update profile request:', {
      name: updateData.name,
      phone: updateData.phone,
      hasPhone: updateData.phone !== undefined,
      gender: updateData.gender,
      date_of_birth: updateData.date_of_birth,
      hasAvatar: !!updateData.avatar,
      avatarLength: updateData.avatar ? updateData.avatar.length : 0,
      avatarPreview: updateData.avatar ? updateData.avatar.substring(0, 50) + '...' : null
    });

    // Gọi API để cập nhật profile
    const response = await api.put('/auth/profile', updateData);

    if (response.data.success) {
      const updatedUser = response.data.data.user;
      // Cập nhật localStorage
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedUser));
      return updatedUser;
    } else {
      throw new Error(response.data.message || 'Cập nhật thất bại');
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      'Có lỗi xảy ra khi cập nhật thông tin';
    throw new Error(message);
  }
}
