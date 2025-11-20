import express from "express";
import {
  addComment,
  getCommentsByProduct,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentCount,
} from "../controllers/commentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/comments/product/:productId - Lấy bình luận của sản phẩm (không cần auth)
router.get("/product/:productId", getCommentsByProduct);

// GET /api/comments/product/:productId/count - Đếm số lượng bình luận (không cần auth)
router.get("/product/:productId/count", getCommentCount);

// Các routes còn lại yêu cầu authentication
router.use(authenticateToken);

// GET /api/comments/:id - Lấy một bình luận theo ID (cần auth để xem chi tiết)
router.get("/:id", getCommentById);

// POST /api/comments - Thêm bình luận mới
router.post("/", addComment);

// PUT /api/comments/:id - Cập nhật bình luận
router.put("/:id", updateComment);

// DELETE /api/comments/:id - Xóa bình luận
router.delete("/:id", deleteComment);

export default router;

