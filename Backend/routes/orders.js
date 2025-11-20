import express from "express";
import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/orderController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// Tất cả routes đều yêu cầu authentication
router.use(authenticateToken);

// POST /api/orders - Tạo đơn hàng mới
router.post("/", createOrder);

// GET /api/orders - Lấy danh sách đơn hàng của user
router.get("/", getUserOrders);

// GET /api/orders/:id - Lấy chi tiết đơn hàng
router.get("/:id", getOrderById);

// PUT /api/orders/:id/status - Cập nhật trạng thái đơn hàng
router.put("/:id/status", updateOrderStatus);

export default router;

