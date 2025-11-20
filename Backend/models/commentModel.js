import { query } from "../config/database.js";

/**
 * Thêm bình luận mới cho sản phẩm (sử dụng bảng reviews)
 */
export async function addComment(productId, userId, content, rating = 5, title = null) {
  // Kiểm tra sản phẩm có tồn tại không
  const productResults = await query(
    `SELECT id, status FROM products WHERE id = ?`,
    [productId]
  );
  const product = Array.isArray(productResults) ? productResults[0] : productResults;

  if (!product) {
    throw new Error("Sản phẩm không tồn tại");
  }

  if (product.status !== "active") {
    throw new Error("Sản phẩm không còn hoạt động");
  }

  // Validation content
  if (!content || content.trim().length === 0) {
    throw new Error("Nội dung bình luận không được để trống");
  }

  if (content.trim().length > 2000) {
    throw new Error("Nội dung bình luận không được vượt quá 2000 ký tự");
  }

  // Validation rating
  const ratingValue = parseInt(rating) || 5;
  if (ratingValue < 1 || ratingValue > 5) {
    throw new Error("Đánh giá phải từ 1 đến 5 sao");
  }

  console.log("📝 Adding comment:", {
    productId,
    userId,
    ratingValue,
    title,
    contentLength: content.trim().length,
  });

  const result = await query(
    `INSERT INTO reviews (product_id, user_id, rating, title, comment, status) 
     VALUES (?, ?, ?, ?, ?, 'approved')`,
    [productId, userId, ratingValue, title, content.trim()]
  );

  console.log("✅ Comment inserted, ID:", result.insertId);

  // Lấy thông tin comment vừa tạo
  const results = await query(
    `SELECT 
      r.id,
      r.product_id,
      r.user_id,
      r.rating,
      r.title,
      r.comment AS content,
      r.status,
      r.created_at,
      r.updated_at,
      u.name AS user_name,
      u.avatar AS user_avatar
    FROM reviews r
    INNER JOIN users u ON r.user_id = u.id
    WHERE r.id = ?`,
    [result.insertId]
  );

  const newComment = Array.isArray(results) ? results[0] : results;
  console.log("📦 New comment data:", {
    id: newComment?.id,
    user_id: newComment?.user_id,
    status: newComment?.status,
  });
  return newComment;
}

/**
 * Lấy tất cả bình luận của sản phẩm (có phân trang) - sử dụng bảng reviews
 */
export async function getCommentsByProduct(
  productId,
  page = 1,
  limit = 10,
  status = "approved"
) {
  try {
    // Đảm bảo productId là number
    const productIdNum = parseInt(productId);
    if (isNaN(productIdNum)) {
      throw new Error("Product ID không hợp lệ");
    }

    // Đảm bảo page và limit là số nguyên
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const offsetNum = (pageNum - 1) * limitNum;

    console.log("🔍 getCommentsByProduct:", {
      productId,
      productIdNum,
      page: pageNum,
      limit: limitNum,
      offset: offsetNum,
      status,
    });

    // Lấy tổng số bình luận
    const countResults = await query(
      `SELECT COUNT(*) as total 
       FROM reviews 
       WHERE product_id = ? AND status = ?`,
      [productIdNum, status]
    );

    // Xử lý kết quả count
    let total = 0;
    if (Array.isArray(countResults) && countResults.length > 0) {
      total = parseInt(countResults[0].total) || 0;
    } else if (countResults && typeof countResults === 'object') {
      total = parseInt(countResults.total) || 0;
    }
    
    const totalPages = Math.ceil(total / limitNum);

    console.log("📊 Total comments found:", total);

    // Lấy danh sách bình luận - đảm bảo limit và offset là số nguyên
    const comments = await query(
      `SELECT 
        r.id,
        r.product_id,
        r.user_id,
        r.rating,
        r.title,
        r.comment AS content,
        r.status,
        r.created_at,
        r.updated_at,
        u.name AS user_name,
        u.avatar AS user_avatar,
        u.email AS user_email
      FROM reviews r
      INNER JOIN users u ON r.user_id = u.id
      WHERE r.product_id = ? AND r.status = ?
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?`,
      [productIdNum, status, parseInt(limitNum), parseInt(offsetNum)]
    );

    console.log("📦 Comments from DB:", {
      count: comments?.length || 0,
      comments: comments?.map(c => ({
        id: c.id,
        product_id: c.product_id,
        user_id: c.user_id,
        user_name: c.user_name,
        status: c.status
      }))
    });

    // Bảng reviews không hỗ trợ replies, nên set empty array
    const commentsWithReplies = (comments || []).map(comment => ({
      ...comment,
      replies: [],
      replies_count: 0
    }));

    return {
      comments: commentsWithReplies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
      },
    };
  } catch (error) {
    console.error("❌ Error in getCommentsByProduct model:", error);
    // Kiểm tra nếu bảng chưa tồn tại
    if (error.code === 'ER_NO_SUCH_TABLE') {
      throw new Error("Bảng reviews chưa được tạo. Vui lòng kiểm tra database.");
    }
    throw error;
  }
}

/**
 * Lấy một bình luận theo ID - sử dụng bảng reviews
 */
export async function getCommentById(commentId) {
  const results = await query(
    `SELECT 
      r.id,
      r.product_id,
      r.user_id,
      r.rating,
      r.title,
      r.comment AS content,
      r.status,
      r.created_at,
      r.updated_at,
      u.name AS user_name,
      u.avatar AS user_avatar,
      u.email AS user_email
    FROM reviews r
    INNER JOIN users u ON r.user_id = u.id
    WHERE r.id = ?`,
    [commentId]
  );

  const comment = Array.isArray(results) ? results[0] : results;

  if (!comment) {
    throw new Error("Bình luận không tồn tại");
  }

  // Bảng reviews không hỗ trợ replies
  comment.replies = [];
  comment.replies_count = 0;

  return comment;
}

/**
 * Cập nhật bình luận - sử dụng bảng reviews
 */
export async function updateComment(commentId, userId, content, rating = null) {
  // Kiểm tra comment có tồn tại và thuộc về user không
  const results = await query(
    `SELECT id, user_id, status FROM reviews WHERE id = ?`,
    [commentId]
  );
  const comment = Array.isArray(results) ? results[0] : results;

  if (!comment) {
    throw new Error("Bình luận không tồn tại");
  }

  if (comment.user_id !== userId) {
    throw new Error("Bạn không có quyền chỉnh sửa bình luận này");
  }

  // Validation content
  if (!content || content.trim().length === 0) {
    throw new Error("Nội dung bình luận không được để trống");
  }

  if (content.trim().length > 2000) {
    throw new Error("Nội dung bình luận không được vượt quá 2000 ký tự");
  }

  // Cập nhật
  if (rating !== null) {
    const ratingValue = parseInt(rating) || 5;
    if (ratingValue < 1 || ratingValue > 5) {
      throw new Error("Đánh giá phải từ 1 đến 5 sao");
    }
    await query(
      `UPDATE reviews 
       SET comment = ?, rating = ?, updated_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [content.trim(), ratingValue, commentId, userId]
    );
  } else {
    await query(
      `UPDATE reviews 
       SET comment = ?, updated_at = NOW() 
       WHERE id = ? AND user_id = ?`,
      [content.trim(), commentId, userId]
    );
  }

  return await getCommentById(commentId);
}

/**
 * Xóa bình luận - sử dụng bảng reviews (hard delete hoặc reject)
 */
export async function deleteComment(commentId, userId) {
  // Kiểm tra comment có tồn tại và thuộc về user không
  const results = await query(
    `SELECT id, user_id, status FROM reviews WHERE id = ?`,
    [commentId]
  );
  const comment = Array.isArray(results) ? results[0] : results;

  if (!comment) {
    throw new Error("Bình luận không tồn tại");
  }

  if (comment.user_id !== userId) {
    throw new Error("Bạn không có quyền xóa bình luận này");
  }

  // Xóa hoàn toàn (hard delete) vì reviews không có status 'deleted'
  await query(
    `DELETE FROM reviews 
     WHERE id = ? AND user_id = ?`,
    [commentId, userId]
  );

  return {
    message: "Đã xóa bình luận thành công",
  };
}

/**
 * Đếm số lượng bình luận của sản phẩm - sử dụng bảng reviews
 */
export async function getCommentCount(productId, status = "approved") {
  try {
    // Đảm bảo productId là number
    const productIdNum = parseInt(productId);
    if (isNaN(productIdNum)) {
      return { count: 0 };
    }

    const results = await query(
      `SELECT COUNT(*) as count 
       FROM reviews 
       WHERE product_id = ? AND status = ?`,
      [productIdNum, status]
    );

    const result = Array.isArray(results) ? results[0] : results;
    return {
      count: result?.count || 0,
    };
  } catch (error) {
    console.error("❌ Error in getCommentCount model:", error);
    // Nếu bảng chưa tồn tại, trả về 0
    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.warn("⚠️ Bảng reviews chưa tồn tại. Trả về count = 0");
      return { count: 0 };
    }
    throw error;
  }
}

