// src/services/cart.js
import axios from "axios";

const API_BASE_URL = "http://localhost:3000/api";
const TOKEN_KEY = "auth_token";

// Tạo axios instance với config mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
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
      console.error("Token không hợp lệ hoặc đã hết hạn");
    }
    return Promise.reject(error);
  }
);

/**
 * Thêm sản phẩm vào giỏ hàng
 */
export async function addToCart(productId, quantity = 1) {
  // Block admin or employee users from using cart functions client-side
  try {
    const profile = localStorage.getItem("user_profile");
    const user = profile ? JSON.parse(profile) : null;
    if (user && (user.role === "admin" || user.role === "employee")) {
      throw new Error("Admin/Employee không được phép thao tác giỏ hàng");
    }
  } catch (err) {
    // nếu có lỗi khi parse hoặc admin/employee, trả về lỗi
    if (err.message && err.message.includes("Admin/Employee không được phép")) {
      return Promise.reject(new Error(err.message));
    }
    // else continue
  }
  try {
    // Validate productId - loại bỏ ID tạm thời và ID bắt đầu bằng 0
    const idString = productId.toString();

    // Loại bỏ ID bắt đầu bằng "0-" (ID tạm thời)
    if (idString.startsWith("0-")) {
      console.error(
        "❌ cart.addToCart - Rejected temporary ID (starts with 0-):",
        productId
      );
      throw new Error(`ID sản phẩm không hợp lệ: ID tạm thời không được phép`);
    }

    const cleanId = idString.replace(/[^0-9]/g, "");

    // Loại bỏ ID bắt đầu bằng 0
    if (cleanId.length > 1 && cleanId.startsWith("0")) {
      console.error(
        "❌ cart.addToCart - Rejected ID starting with 0:",
        productId,
        "cleaned:",
        cleanId
      );
      throw new Error(
        `ID sản phẩm không hợp lệ: ID bắt đầu bằng 0 không được phép`
      );
    }

    const validatedProductId = parseInt(cleanId);

    if (
      isNaN(validatedProductId) ||
      validatedProductId <= 0 ||
      validatedProductId.toString().charAt(0) === "0"
    ) {
      console.error("❌ cart.addToCart - Invalid productId:", {
        original: productId,
        cleaned: cleanId,
        parsed: validatedProductId,
      });
      throw new Error(`ID sản phẩm không hợp lệ: ${productId}`);
    }

    const response = await api.post("/cart", {
      product_id: validatedProductId,
      quantity: quantity,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(
        response.data.message || "Lỗi khi thêm sản phẩm vào giỏ hàng"
      );
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Lỗi khi thêm sản phẩm vào giỏ hàng";
    throw new Error(message);
  }
}

/**
 * Lấy tất cả sản phẩm trong giỏ hàng
 */
export async function getCart() {
  try {
    const response = await api.get("/cart");

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Lỗi khi lấy giỏ hàng");
    }
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Lỗi khi lấy giỏ hàng";
    throw new Error(message);
  }
}

/**
 * Cập nhật số lượng và ghi chú sản phẩm trong giỏ hàng
 */
export async function updateCartItem(cartItemId, quantity, note = null) {
  try {
    // Validate cartItemId - loại bỏ ID tạm thời và ID bắt đầu bằng 0
    const idString = cartItemId.toString();

    // Loại bỏ ID bắt đầu bằng "0-" (ID tạm thời)
    if (idString.startsWith("0-")) {
      console.error(
        "❌ cart.updateCartItem - Rejected temporary ID (starts with 0-):",
        cartItemId
      );
      throw new Error(`ID giỏ hàng không hợp lệ: ID tạm thời không được phép`);
    }

    const cleanId = idString.replace(/[^0-9]/g, "");

    // Loại bỏ ID bắt đầu bằng 0
    if (cleanId.length > 1 && cleanId.startsWith("0")) {
      console.error(
        "❌ cart.updateCartItem - Rejected ID starting with 0:",
        cartItemId,
        "cleaned:",
        cleanId
      );
      throw new Error(
        `ID giỏ hàng không hợp lệ: ID bắt đầu bằng 0 không được phép`
      );
    }

    const validatedId = parseInt(cleanId);

    if (
      isNaN(validatedId) ||
      validatedId <= 0 ||
      validatedId.toString().charAt(0) === "0"
    ) {
      console.error("❌ cart.updateCartItem - Invalid cartItemId:", {
        original: cartItemId,
        cleaned: cleanId,
        parsed: validatedId,
      });
      throw new Error(`ID giỏ hàng không hợp lệ: ${cartItemId}`);
    }

    const response = await api.put(`/cart/${validatedId}`, {
      quantity: quantity,
      note: note,
    });

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Lỗi khi cập nhật giỏ hàng");
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Lỗi khi cập nhật giỏ hàng";
    throw new Error(message);
  }
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
export async function removeFromCart(cartItemId) {
  try {
    // Validate cartItemId - loại bỏ ID tạm thời
    const cleanId = cartItemId.toString().replace(/[^0-9]/g, "");
    const validatedId = parseInt(cleanId);

    if (isNaN(validatedId) || validatedId <= 0) {
      console.error("❌ cart.removeFromCart - Invalid cartItemId:", {
        original: cartItemId,
        cleaned: cleanId,
        parsed: validatedId,
      });
      throw new Error(`ID giỏ hàng không hợp lệ: ${cartItemId}`);
    }

    const response = await api.delete(`/cart/${validatedId}`);

    if (response.data.success) {
      return true;
    } else {
      throw new Error(
        response.data.message || "Lỗi khi xóa sản phẩm khỏi giỏ hàng"
      );
    }
  } catch (error) {
    const message =
      error.response?.data?.message ||
      error.message ||
      "Lỗi khi xóa sản phẩm khỏi giỏ hàng";
    throw new Error(message);
  }
}

/**
 * Xóa tất cả sản phẩm trong giỏ hàng
 */
export async function clearCart() {
  try {
    const response = await api.delete("/cart");

    if (response.data.success) {
      return true;
    } else {
      throw new Error(response.data.message || "Lỗi khi xóa giỏ hàng");
    }
  } catch (error) {
    const message =
      error.response?.data?.message || error.message || "Lỗi khi xóa giỏ hàng";
    throw new Error(message);
  }
}

/**
 * Lấy số lượng sản phẩm trong giỏ hàng
 */
export async function getCartCount() {
  try {
    const response = await api.get("/cart/count");

    if (response.data.success) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || "Lỗi khi lấy số lượng giỏ hàng");
    }
  } catch (error) {
    // Nếu lỗi 401 (chưa đăng nhập), trả về 0
    if (error.response?.status === 401) {
      return { items: 0, totalQuantity: 0 };
    }
    const message =
      error.response?.data?.message ||
      error.message ||
      "Lỗi khi lấy số lượng giỏ hàng";
    throw new Error(message);
  }
}
