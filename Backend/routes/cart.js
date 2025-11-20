import express from "express";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartCount,
} from "../controllers/cartController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(authenticateToken);

// POST /api/cart - Thêm sản phẩm vào giỏ hàng
router.post("/", addToCart);

// GET /api/cart - Lấy tất cả sản phẩm trong giỏ hàng
router.get("/", getCart);

// GET /api/cart/count - Lấy số lượng sản phẩm trong giỏ hàng
router.get("/count", getCartCount);

// PUT /api/cart/:id - Cập nhật số lượng sản phẩm
router.put("/:id", updateCartItem);

// DELETE /api/cart/:id - Xóa sản phẩm khỏi giỏ hàng
router.delete("/:id", removeFromCart);

// DELETE /api/cart - Xóa tất cả sản phẩm trong giỏ hàng
router.delete("/", clearCart);

export default router;

