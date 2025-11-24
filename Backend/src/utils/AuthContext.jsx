// src/utils/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import * as authService from "../services/auth.js";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  // Lấy user đang đăng nhập nếu có (từ localStorage)
  const [user, setUser] = useState(() => {
    try {
      const profile = localStorage.getItem('user_profile');
      return profile ? JSON.parse(profile) : null;
    } catch {
      return null;
    }
  });

  // Load user từ API khi component mount để verify token
  useEffect(() => {
    async function loadUser() {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      } else {
        // Nếu không có user từ API, xóa user trong state
        setUser(null);
      }
    }
    loadUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Đồng bộ user -> localStorage (đã được xử lý trong authService)
  useEffect(() => {
    // User state được quản lý bởi authService
  }, [user]);

  async function login(emailOrObj, password) {
    // Hỗ trợ cả object và tham số riêng lẻ
    let email, pass;
    if (typeof emailOrObj === "object" && emailOrObj !== null) {
      email = emailOrObj.email;
      pass = emailOrObj.password;
    } else {
      email = emailOrObj;
      pass = password;
    }

    try {
      const result = await authService.login({ email, password: pass });
      setUser(result.user);
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  async function register(nameOrObj, email, password) {
    // Hỗ trợ cả object và tham số riêng lẻ
    let name, emailVal, pass, phone;
    if (typeof nameOrObj === "object" && nameOrObj !== null) {
      name = nameOrObj.name;
      emailVal = nameOrObj.email;
      pass = nameOrObj.password;
      phone = nameOrObj.phone;
    } else {
      name = nameOrObj;
      emailVal = email;
      pass = password;
      phone = null;
    }

    try {
      const result = await authService.signup({
        name,
        email: emailVal,
        password: pass,
        phone: phone || null,
      });
      setUser(result.user);
      return result.user;
    } catch (error) {
      throw error;
    }
  }

  // Alias cho register để tương thích với signup
  const signup = register;

  function logout() {
    authService.logout();
    setUser(null);
  }

  async function updateProfile(partial) {
    try {
      // Cập nhật qua API (nếu có) hoặc localStorage
      const updated = await authService.updateProfile(partial);
      setUser(updated);
      return updated;
    } catch (error) {
      // Fallback: chỉ cập nhật state
      setUser((prev) => ({ ...prev, ...partial }));
      return { ...user, ...partial };
    }
  }

  // Admin functions - giữ lại để tương thích, có thể cập nhật sau
  // TODO: Implement API endpoints cho admin functions
  function getAllUsers() {
    // Tạm thời trả về mảng rỗng, cần implement API endpoint
    return [];
  }

  function getAllEmployees() {
    // Tạm thời trả về mảng rỗng, cần implement API endpoint
    return [];
  }

  function toggleUserLock(userId) {
    // TODO: Implement API endpoint
    throw new Error("Chức năng này cần được implement qua API");
  }

  function updateUser(userId, updates) {
    // TODO: Implement API endpoint
    throw new Error("Chức năng này cần được implement qua API");
  }

  function deleteUser(userId) {
    // TODO: Implement API endpoint
    throw new Error("Chức năng này cần được implement qua API");
  }

  function createUser(userData) {
    // TODO: Implement API endpoint
    throw new Error("Chức năng này cần được implement qua API");
  }

  const value = {
    user,
    login,
    register,
    signup,
    logout,
    updateProfile,
    // Admin functions
    getAllUsers,
    getAllEmployees,
    toggleUserLock,
    updateUser,
    deleteUser,
    createUser,
  };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
