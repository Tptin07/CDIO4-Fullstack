import * as commentModel from "../models/commentModel.js";

/**
 * POST /api/comments
 * Thêm bình luận mới cho sản phẩm
 */
export async function addComment(req, res) {
  try {
    // Kiểm tra user đã đăng nhập
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để bình luận",
      });
    }

    const userId = req.user.userId;
    const { product_id, content, rating, title } = req.body;

    // Validation
    if (!product_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp product_id",
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nội dung bình luận không được để trống",
      });
    }

    const comment = await commentModel.addComment(
      product_id,
      userId,
      content,
      rating || 5,
      title || null
    );

    res.status(201).json({
      success: true,
      message: "Đã thêm bình luận thành công.",
      data: comment,
    });
  } catch (error) {
    console.error("❌ Error in addComment:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi thêm bình luận",
    });
  }
}

/**
 * GET /api/comments/product/:productId
 * Lấy tất cả bình luận của sản phẩm
 */
export async function getCommentsByProduct(req, res) {
  try {
    const { productId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status || "approved"; // approved, pending, all

    console.log("📥 GET /api/comments/product/:productId", {
      productId,
      page,
      limit,
      status,
    });

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp product_id",
      });
    }

    // Chỉ admin mới có thể xem pending comments
    let finalStatus = status;
    if (status === "all" || status === "pending") {
      if (!req.user || req.user.role !== "admin") {
        finalStatus = "approved";
      }
    } else {
      finalStatus = "approved";
    }

    const result = await commentModel.getCommentsByProduct(
      productId,
      page,
      limit,
      finalStatus
    );

    console.log("✅ Comments found:", {
      count: result.comments?.length || 0,
      total: result.pagination?.total || 0,
      comments: result.comments?.map(c => ({ id: c.id, status: c.status, user_id: c.user_id }))
    });

    res.json({
      success: true,
      data: result.comments || [],
      pagination: result.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 },
    });
  } catch (error) {
    console.error("❌ Error in getCommentsByProduct:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bình luận",
      error: error.message,
    });
  }
}

/**
 * GET /api/comments/:id
 * Lấy một bình luận theo ID
 */
export async function getCommentById(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp comment id",
      });
    }

    const comment = await commentModel.getCommentById(id);

    res.json({
      success: true,
      data: comment,
    });
  } catch (error) {
    console.error("❌ Error in getCommentById:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy bình luận",
    });
  }
}

/**
 * PUT /api/comments/:id
 * Cập nhật bình luận
 */
export async function updateComment(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userId = req.user.userId;
    const { id } = req.params;
    const { content } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp comment id",
      });
    }

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: "Nội dung bình luận không được để trống",
      });
    }

    const comment = await commentModel.updateComment(id, userId, content);

    res.json({
      success: true,
      message: "Đã cập nhật bình luận thành công",
      data: comment,
    });
  } catch (error) {
    console.error("❌ Error in updateComment:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật bình luận",
    });
  }
}

/**
 * DELETE /api/comments/:id
 * Xóa bình luận
 */
export async function deleteComment(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userId = req.user.userId;
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp comment id",
      });
    }

    const result = await commentModel.deleteComment(id, userId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("❌ Error in deleteComment:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi xóa bình luận",
    });
  }
}

/**
 * GET /api/comments/product/:productId/count
 * Đếm số lượng bình luận của sản phẩm
 */
export async function getCommentCount(req, res) {
  try {
    const { productId } = req.params;
    const status = req.query.status || "approved";

    console.log("📥 GET /api/comments/product/:productId/count", {
      productId,
      status,
    });

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp product_id",
      });
    }

    const result = await commentModel.getCommentCount(productId, status);

    console.log("✅ Comment count:", result);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in getCommentCount:", error);
    console.error("Error details:", {
      message: error.message,
      code: error.code,
      stack: error.stack,
    });
    res.status(500).json({
      success: false,
      message: "Lỗi khi đếm số lượng bình luận",
      error: error.message,
    });
  }
}

