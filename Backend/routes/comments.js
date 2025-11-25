import express from "express";
import {
  addComment,
  getCommentsByProduct,
  getCommentById,
  updateComment,
  deleteComment,
  getCommentCount,
  addReviewReply,
  updateReviewReply,
  deleteReviewReply,
} from "../controllers/commentController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/comments/product/:productId - Lấy bình luận của sản phẩm (không cần auth)
router.get("/product/:productId", getCommentsByProduct);

// GET /api/comments/product/:productId/count - Đếm số lượng bình luận (không cần auth)
router.get("/product/:productId/count", getCommentCount);

// Các routes còn lại yêu cầu authentication
router.use(authenticateToken);

// POST /api/comments - Thêm bình luận mới
router.post("/", addComment);

// Routes cho replies - phải đặt TRƯỚC routes generic :id để tránh conflict
// POST /api/comments/:reviewId/replies - Thêm reply của admin cho review
router.post("/:reviewId/replies", addReviewReply);

// PUT /api/comments/replies/:replyId - Cập nhật reply của admin
router.put("/replies/:replyId", updateReviewReply);

// DELETE /api/comments/replies/:replyId - Xóa reply của admin
router.delete("/replies/:replyId", deleteReviewReply);

// GET /api/comments/:id - Lấy một bình luận theo ID (cần auth để xem chi tiết)
router.get("/:id", getCommentById);

// PUT /api/comments/:id - Cập nhật bình luận
router.put("/:id", updateComment);

// DELETE /api/comments/:id - Xóa bình luận
router.delete("/:id", deleteComment);

export default router;

