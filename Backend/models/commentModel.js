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

  // Cập nhật rating của sản phẩm sau khi thêm đánh giá
  try {
    await query(`CALL UpdateProductRating(?)`, [productId]);
    console.log("✅ Product rating updated for product:", productId);
  } catch (ratingError) {
    console.error("⚠️ Error updating product rating:", ratingError);
    // Nếu stored procedure không tồn tại, tính toán và cập nhật thủ công
    if (ratingError.code === 'ER_SP_DOES_NOT_EXIST' || ratingError.message.includes('does not exist')) {
      try {
        const ratingResults = await query(
          `SELECT COALESCE(AVG(rating), 0.00) as avg_rating
           FROM reviews
           WHERE product_id = ? AND status = 'approved'`,
          [productId]
        );
        const avgRating = Array.isArray(ratingResults) && ratingResults.length > 0
          ? parseFloat(ratingResults[0].avg_rating) || 0
          : 0;
        
        await query(
          `UPDATE products SET rating = ? WHERE id = ?`,
          [avgRating, productId]
        );
        console.log("✅ Product rating updated manually:", avgRating);
      } catch (manualError) {
        console.error("⚠️ Error updating product rating manually:", manualError);
      }
    }
    // Không throw error vì đánh giá đã được thêm thành công
  }

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

    // Đảm bảo page và limit là số nguyên hợp lệ
    const pageNum = Math.max(1, parseInt(page) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit) || 10));
    const offsetNum = Math.max(0, (pageNum - 1) * limitNum);

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

    // Xử lý kết quả count - mysql2 trả về array
    let total = 0;
    if (Array.isArray(countResults)) {
      if (countResults.length > 0) {
        // Nếu là array of rows
        total = parseInt(countResults[0].total) || 0;
      }
    } else if (countResults && typeof countResults === 'object' && 'total' in countResults) {
      // Nếu là object trực tiếp
      total = parseInt(countResults.total) || 0;
    }
    
    const totalPages = Math.ceil(total / limitNum);

    console.log("📊 Total comments found:", total);

    // Lấy danh sách bình luận
    // Sử dụng string interpolation cho LIMIT và OFFSET để tránh lỗi với prepared statement
    // (đã validate limitNum và offsetNum ở trên nên an toàn)
    let comments = await query(
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
      LIMIT ${limitNum} OFFSET ${offsetNum}`,
      [productIdNum, status]
    );
    
    // Đảm bảo comments là array
    if (!Array.isArray(comments)) {
      comments = comments ? [comments] : [];
    }

    console.log("📦 Comments from DB:", {
      count: comments.length || 0,
      comments: comments.slice(0, 3).map(c => ({
        id: c.id,
        product_id: c.product_id,
        user_id: c.user_id,
        user_name: c.user_name,
        status: c.status
      }))
    });

    // Lấy replies cho từng comment
    const commentIds = comments.map(c => c.id);
    let repliesMap = {};
    
    if (commentIds.length > 0) {
      try {
        const placeholders = commentIds.map(() => '?').join(',');
        const replies = await query(
          `SELECT 
            rr.id,
            rr.review_id,
            rr.admin_id,
            rr.content,
            rr.status,
            rr.created_at,
            rr.updated_at,
            u.name AS admin_name,
            u.avatar AS admin_avatar
          FROM review_replies rr
          INNER JOIN users u ON rr.admin_id = u.id
          WHERE rr.review_id IN (${placeholders}) AND rr.status = 'active'
          ORDER BY rr.created_at ASC`,
          commentIds
        );
        
        // Nhóm replies theo review_id
        const repliesArray = Array.isArray(replies) ? replies : (replies ? [replies] : []);
        repliesArray.forEach(reply => {
          if (!repliesMap[reply.review_id]) {
            repliesMap[reply.review_id] = [];
          }
          repliesMap[reply.review_id].push(reply);
        });
      } catch (repliesError) {
        console.warn("⚠️ Error fetching replies:", repliesError.message);
        // Nếu bảng chưa tồn tại, bỏ qua
        if (repliesError.code !== 'ER_NO_SUCH_TABLE') {
          console.error("❌ Unexpected error fetching replies:", repliesError);
        }
      }
    }
    
    // Gắn replies vào từng comment
    const commentsWithReplies = comments.map(comment => ({
      ...comment,
      replies: repliesMap[comment.id] || [],
      replies_count: (repliesMap[comment.id] || []).length
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
    console.error("   Error code:", error.code);
    console.error("   Error message:", error.message);
    console.error("   SQL State:", error.sqlState);
    
    // Kiểm tra nếu bảng chưa tồn tại
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes('doesn\'t exist')) {
      console.warn("⚠️ Bảng reviews chưa tồn tại. Trả về danh sách rỗng.");
      return {
        comments: [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: 0,
          totalPages: 0,
        },
      };
    }
    
    // Nếu lỗi khác, throw để controller xử lý
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

  // Lấy replies cho comment này
  try {
    const replies = await query(
      `SELECT 
        rr.id,
        rr.review_id,
        rr.admin_id,
        rr.content,
        rr.status,
        rr.created_at,
        rr.updated_at,
        u.name AS admin_name,
        u.avatar AS admin_avatar
      FROM review_replies rr
      INNER JOIN users u ON rr.admin_id = u.id
      WHERE rr.review_id = ? AND rr.status = 'active'
      ORDER BY rr.created_at ASC`,
      [commentId]
    );
    
    comment.replies = Array.isArray(replies) ? replies : (replies ? [replies] : []);
    comment.replies_count = comment.replies.length;
  } catch (repliesError) {
    console.warn("⚠️ Error fetching replies:", repliesError.message);
    comment.replies = [];
    comment.replies_count = 0;
  }

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

  // Lấy product_id trước khi cập nhật
  const commentBeforeUpdate = await getCommentById(commentId);
  const productId = commentBeforeUpdate.product_id;

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

  const updatedComment = await getCommentById(commentId);

  // Cập nhật rating của sản phẩm sau khi sửa đánh giá
  try {
    await query(`CALL UpdateProductRating(?)`, [productId]);
    console.log("✅ Product rating updated for product:", productId);
  } catch (ratingError) {
    console.error("⚠️ Error updating product rating:", ratingError);
    // Nếu stored procedure không tồn tại, tính toán và cập nhật thủ công
    if (ratingError.code === 'ER_SP_DOES_NOT_EXIST' || ratingError.message.includes('does not exist')) {
      try {
        const ratingResults = await query(
          `SELECT COALESCE(AVG(rating), 0.00) as avg_rating
           FROM reviews
           WHERE product_id = ? AND status = 'approved'`,
          [productId]
        );
        const avgRating = Array.isArray(ratingResults) && ratingResults.length > 0
          ? parseFloat(ratingResults[0].avg_rating) || 0
          : 0;
        
        await query(
          `UPDATE products SET rating = ? WHERE id = ?`,
          [avgRating, productId]
        );
        console.log("✅ Product rating updated manually:", avgRating);
      } catch (manualError) {
        console.error("⚠️ Error updating product rating manually:", manualError);
      }
    }
    // Không throw error vì đánh giá đã được cập nhật thành công
  }

  return updatedComment;
}

/**
 * Xóa bình luận - sử dụng bảng reviews (hard delete hoặc reject)
 */
export async function deleteComment(commentId, userId) {
  // Kiểm tra comment có tồn tại và thuộc về user không, đồng thời lấy product_id
  const results = await query(
    `SELECT id, user_id, product_id, status FROM reviews WHERE id = ?`,
    [commentId]
  );
  const comment = Array.isArray(results) ? results[0] : results;

  if (!comment) {
    throw new Error("Bình luận không tồn tại");
  }

  if (comment.user_id !== userId) {
    throw new Error("Bạn không có quyền xóa bình luận này");
  }

  // Lấy product_id trước khi xóa
  const actualProductId = comment.product_id;

  // Xóa hoàn toàn (hard delete) vì reviews không có status 'deleted'
  await query(
    `DELETE FROM reviews 
     WHERE id = ? AND user_id = ?`,
    [commentId, userId]
  );

  // Cập nhật rating của sản phẩm sau khi xóa đánh giá
  if (actualProductId) {
    try {
      await query(`CALL UpdateProductRating(?)`, [actualProductId]);
      console.log("✅ Product rating updated for product:", actualProductId);
    } catch (ratingError) {
      console.error("⚠️ Error updating product rating:", ratingError);
      // Nếu stored procedure không tồn tại, tính toán và cập nhật thủ công
      if (ratingError.code === 'ER_SP_DOES_NOT_EXIST' || ratingError.message.includes('does not exist')) {
        try {
          const ratingResults = await query(
            `SELECT COALESCE(AVG(rating), 0.00) as avg_rating
             FROM reviews
             WHERE product_id = ? AND status = 'approved'`,
            [actualProductId]
          );
          const avgRating = Array.isArray(ratingResults) && ratingResults.length > 0
            ? parseFloat(ratingResults[0].avg_rating) || 0
            : 0;
          
          await query(
            `UPDATE products SET rating = ? WHERE id = ?`,
            [avgRating, actualProductId]
          );
          console.log("✅ Product rating updated manually:", avgRating);
        } catch (manualError) {
          console.error("⚠️ Error updating product rating manually:", manualError);
        }
      }
      // Không throw error vì đánh giá đã được xóa thành công
    }
  }

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

    // Xử lý kết quả - mysql2 trả về array
    let count = 0;
    if (Array.isArray(results) && results.length > 0) {
      count = parseInt(results[0].count) || 0;
    } else if (results && typeof results === 'object' && 'count' in results) {
      count = parseInt(results.count) || 0;
    }
    
    return { count };
  } catch (error) {
    console.error("❌ Error in getCommentCount model:", error);
    console.error("   Error code:", error.code);
    console.error("   Error message:", error.message);
    
    // Nếu bảng chưa tồn tại, trả về 0
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes('doesn\'t exist')) {
      console.warn("⚠️ Bảng reviews chưa tồn tại. Trả về count = 0");
      return { count: 0 };
    }
    throw error;
  }
}

/**
 * Thêm reply của admin cho review
 */
export async function addReviewReply(reviewId, adminId, content) {
  // Validate
  if (!content || content.trim().length === 0) {
    throw new Error("Nội dung trả lời không được để trống");
  }

  if (content.trim().length > 2000) {
    throw new Error("Nội dung trả lời không được vượt quá 2000 ký tự");
  }

  // Kiểm tra review có tồn tại không
  const reviewResults = await query(
    `SELECT id FROM reviews WHERE id = ?`,
    [reviewId]
  );
  const review = Array.isArray(reviewResults) ? reviewResults[0] : reviewResults;
  
  if (!review) {
    throw new Error("Bình luận không tồn tại");
  }

  // Thêm reply
  let result;
  try {
    console.log("📝 Adding review reply:", { reviewId, adminId, contentLength: content.trim().length });
    result = await query(
      `INSERT INTO review_replies (review_id, admin_id, content, status) 
       VALUES (?, ?, ?, 'active')`,
      [reviewId, adminId, content.trim()]
    );
    console.log("✅ Reply inserted, result:", result);
    console.log("✅ Reply inserted, insertId:", result?.insertId);
  } catch (error) {
    console.error("❌ Error inserting reply:", error);
    // Kiểm tra nếu bảng chưa tồn tại
    if (error.code === 'ER_NO_SUCH_TABLE' || error.message.includes('doesn\'t exist')) {
      throw new Error("Bảng review_replies chưa được tạo. Vui lòng chạy script tạo bảng trước.");
    }
    throw error;
  }

  // Kiểm tra insertId - mysql2 trả về insertId trong result object
  const insertId = result?.insertId;
  if (!insertId) {
    console.error("❌ No insertId in result:", result);
    console.error("❌ Result type:", typeof result);
    console.error("❌ Result keys:", result ? Object.keys(result) : 'null');
    throw new Error("Không thể lấy ID của reply vừa tạo. Có thể bảng review_replies chưa được tạo.");
  }

  // Lấy reply vừa tạo
  const replyResults = await query(
    `SELECT 
      rr.id,
      rr.review_id,
      rr.admin_id,
      rr.content,
      rr.status,
      rr.created_at,
      rr.updated_at,
      u.name AS admin_name,
      u.avatar AS admin_avatar
    FROM review_replies rr
    INNER JOIN users u ON rr.admin_id = u.id
    WHERE rr.id = ?`,
    [insertId]
  );

  const reply = Array.isArray(replyResults) ? replyResults[0] : replyResults;
  console.log("✅ Reply retrieved:", reply);
  return reply;
}

/**
 * Cập nhật reply của admin
 */
export async function updateReviewReply(replyId, adminId, content) {
  // Validate
  if (!content || content.trim().length === 0) {
    throw new Error("Nội dung trả lời không được để trống");
  }

  if (content.trim().length > 2000) {
    throw new Error("Nội dung trả lời không được vượt quá 2000 ký tự");
  }

  // Kiểm tra reply có tồn tại và thuộc về admin này không
  const replyResults = await query(
    `SELECT id, admin_id FROM review_replies WHERE id = ? AND status = 'active'`,
    [replyId]
  );
  const reply = Array.isArray(replyResults) ? replyResults[0] : replyResults;
  
  if (!reply) {
    throw new Error("Trả lời không tồn tại");
  }

  if (reply.admin_id !== adminId) {
    throw new Error("Bạn không có quyền chỉnh sửa trả lời này");
  }

  // Cập nhật
  await query(
    `UPDATE review_replies SET content = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [content.trim(), replyId]
  );

  // Lấy reply đã cập nhật
  const updatedResults = await query(
    `SELECT 
      rr.id,
      rr.review_id,
      rr.admin_id,
      rr.content,
      rr.status,
      rr.created_at,
      rr.updated_at,
      u.name AS admin_name,
      u.avatar AS admin_avatar
    FROM review_replies rr
    INNER JOIN users u ON rr.admin_id = u.id
    WHERE rr.id = ?`,
    [replyId]
  );

  return Array.isArray(updatedResults) ? updatedResults[0] : updatedResults;
}

/**
 * Xóa reply của admin (soft delete)
 */
export async function deleteReviewReply(replyId, adminId) {
  // Kiểm tra reply có tồn tại và thuộc về admin này không
  const replyResults = await query(
    `SELECT id, admin_id FROM review_replies WHERE id = ? AND status = 'active'`,
    [replyId]
  );
  const reply = Array.isArray(replyResults) ? replyResults[0] : replyResults;
  
  if (!reply) {
    throw new Error("Trả lời không tồn tại");
  }

  if (reply.admin_id !== adminId) {
    throw new Error("Bạn không có quyền xóa trả lời này");
  }

  // Soft delete
  await query(
    `UPDATE review_replies SET status = 'deleted', updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    [replyId]
  );

  return {
    message: "Đã xóa trả lời thành công",
  };
}

