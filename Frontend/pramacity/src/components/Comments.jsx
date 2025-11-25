// src/components/Comments.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import {
  getCommentsByProduct,
  addComment,
  getCommentCount,
  addReviewReply,
  updateReviewReply,
  deleteReviewReply,
} from "../services/comments";
import "../assets/css/comments.css";

// Toast mini
function toast(msg) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const t = document.createElement("div");
  t.className = "toast-item";
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 250);
  }, 2200);
}

export default function Comments({
  productId,
  productRating = 0,
  productName = "",
}) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // State cho bình luận
  const [showCommentForm, setShowCommentForm] = useState(false);
  const [commentForm, setCommentForm] = useState({
    title: "",
    content: "",
    rating: 5,
  });
  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentCount, setCommentCount] = useState(0);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyForm, setReplyForm] = useState({ content: "" });
  const [editingReply, setEditingReply] = useState(null);

  // Reset currentPage khi productId thay đổi
  useEffect(() => {
    if (productId) {
      setCurrentPage(1);
    }
  }, [productId]);

  // Load bình luận khi productId thay đổi
  useEffect(() => {
    async function loadComments() {
      // Validate productId - đảm bảo là số hợp lệ và > 0
      const productIdNum = Number(productId);
      if (
        !productId ||
        productIdNum === 0 ||
        isNaN(productIdNum) ||
        productIdNum <= 0
      ) {
        console.warn("⚠️ Invalid productId:", productId, "→ Skipping API call");
        setComments([]);
        setCommentCount(0);
        setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
        setCommentsLoading(false);
        return;
      }

      console.log(
        "🔄 Loading comments for product:",
        productIdNum,
        "Type:",
        typeof productIdNum
      );
      setCommentsLoading(true);
      try {
        const [commentsData, count] = await Promise.all([
          getCommentsByProduct(productIdNum, currentPage, 10),
          getCommentCount(productIdNum),
        ]);

        console.log("📊 Comments data received:", {
          comments: commentsData.comments?.length || 0,
          count: count,
          pagination: commentsData.pagination,
        });

        // Đảm bảo comments là array
        const commentsArray = Array.isArray(commentsData.comments)
          ? commentsData.comments
          : [];

        setComments(commentsArray);
        setPagination(
          commentsData.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          }
        );
        setCommentCount(count);
      } catch (err) {
        console.error("❌ Error loading comments:", err);
        setComments([]);
        setCommentCount(0);
        setPagination({ page: 1, limit: 10, total: 0, totalPages: 0 });
      } finally {
        setCommentsLoading(false);
      }
    }

    loadComments();
  }, [productId, currentPage]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!commentForm.content.trim()) {
      toast("Vui lòng nhập nội dung bình luận");
      return;
    }

    if (!productId || productId === 0 || isNaN(Number(productId))) {
      toast("Lỗi: Không tìm thấy sản phẩm");
      return;
    }

    const productIdNum = Number(productId);

    try {
      setCommentsLoading(true);
      await addComment(
        productIdNum,
        commentForm.content.trim(),
        commentForm.rating || 5,
        commentForm.title?.trim() || null
      );

      // Reload comments để lấy danh sách mới nhất
      const commentsData = await getCommentsByProduct(productIdNum, 1, 10);
      setComments(commentsData.comments || []);
      setPagination(
        commentsData.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        }
      );

      // Update count
      const count = await getCommentCount(productIdNum);
      setCommentCount(count);

      // Reset form và quay về trang 1
      setCommentForm({ title: "", content: "", rating: 5 });
      setShowCommentForm(false);
      setCurrentPage(1);
      toast("Đã gửi bình luận thành công!");
    } catch (err) {
      console.error("Error submitting comment:", err);
      toast(err.message || "Lỗi khi gửi bình luận. Vui lòng thử lại.");
    } finally {
      setCommentsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Vừa xong";
    const date = new Date(dateString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}-${month}-${year}`;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <section className="comments-section">
      <div className="container">
        <div className="comments-header">
          <h3>Đánh giá của khách hàng</h3>
          <div className="comments-summary">
            <div className="comments-rating-display">
              <span className="comments-score">{productRating.toFixed(1)}</span>
              <span className="comments-stars">★</span>
            </div>
            <span className="comments-count">
              ({commentCount} {commentCount === 1 ? "bình luận" : "bình luận"})
            </span>
          </div>
        </div>

        {/* Form bình luận */}
        {!showCommentForm ? (
          <div className="comments-form-toggle">
            <button
              type="button"
              className="btn btn-main"
              onClick={() => {
                // Kiểm tra đăng nhập
                const token = localStorage.getItem("auth_token");
                if (!token) {
                  toast("Vui lòng đăng nhập để bình luận");
                  navigate("/dang-nhap");
                  return;
                }
                setShowCommentForm(true);
              }}
            >
              <i className="ri-edit-line" /> Viết bình luận
            </button>
          </div>
        ) : (
          <form className="comments-form" onSubmit={handleCommentSubmit}>
            <h4>Viết bình luận của bạn</h4>

            <div className="comments-form-group">
              <label>Tiêu đề bình luận (tùy chọn)</label>
              <input
                type="text"
                value={commentForm.title}
                onChange={(e) =>
                  setCommentForm({ ...commentForm, title: e.target.value })
                }
                placeholder="Nhập tiêu đề..."
                maxLength={255}
              />
            </div>

            <div className="comments-form-group">
              <label>Đánh giá *</label>
              <div className="comments-star-select">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${
                      star <= commentForm.rating ? "active" : ""
                    }`}
                    onClick={() =>
                      setCommentForm({ ...commentForm, rating: star })
                    }
                  >
                    ★
                  </button>
                ))}
                <span className="star-label">
                  {commentForm.rating === 5
                    ? "Rất tốt"
                    : commentForm.rating === 4
                    ? "Tốt"
                    : commentForm.rating === 3
                    ? "Bình thường"
                    : commentForm.rating === 2
                    ? "Không tốt"
                    : "Rất không tốt"}
                </span>
              </div>
            </div>

            <div className="comments-form-group">
              <label>Nội dung bình luận *</label>
              <textarea
                value={commentForm.content}
                onChange={(e) =>
                  setCommentForm({ ...commentForm, content: e.target.value })
                }
                placeholder="Chia sẻ ý kiến của bạn về sản phẩm..."
                rows={5}
                required
                maxLength={2000}
              />
              <small className="comments-char-count">
                {commentForm.content.length}/2000 ký tự
              </small>
            </div>

            <div className="comments-form-actions">
              <button
                type="submit"
                className="btn btn-main"
                disabled={commentsLoading}
              >
                {commentsLoading ? "Đang gửi..." : "Gửi bình luận"}
              </button>
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  setShowCommentForm(false);
                  setCommentForm({ title: "", content: "", rating: 5 });
                }}
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* Danh sách bình luận */}
        <div className="comments-list">
          {commentsLoading && comments.length === 0 ? (
            <div className="comments-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải bình luận...</p>
            </div>
          ) : !comments || comments.length === 0 ? (
            <div className="comments-empty">
              <i className="ri-message-3-line"></i>
              <p>Chưa có bình luận nào. Hãy là người đầu tiên bình luận!</p>
            </div>
          ) : (
            <>
              {comments.map((comment, index) => (
                <div key={comment.id} className="comment-block">
                  {/* Customer Question/Comment */}
                  <article className="comment-item comment-customer">
                    <div className="comment-header">
                      <div className="comment-avatar comment-avatar-customer">
                        {comment.user_avatar ? (
                          <img
                            src={comment.user_avatar}
                            alt={comment.user_name}
                          />
                        ) : (
                          <span>
                            {comment.user_name?.charAt(0).toUpperCase() || "K"}
                          </span>
                        )}
                      </div>
                      <div className="comment-info">
                        <div className="comment-name-row">
                          <h4 className="comment-user-name">Khách hàng</h4>
                          {index === 0 && (
                            <span className="comment-helpful-tag">
                              Hữu ích nhất
                            </span>
                          )}
                        </div>
                        <div className="comment-meta">
                          {comment.rating && (
                            <div className="comment-rating-wrapper">
                              <span className="comment-stars">
                                {"★".repeat(comment.rating)}
                                {"☆".repeat(5 - comment.rating)}
                              </span>
                              <span className="comment-rating-number">
                                {comment.rating}.0
                              </span>
                            </div>
                          )}
                          <span className="comment-date">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="comment-body">
                      {comment.title && (
                        <h5 className="comment-title">{comment.title}</h5>
                      )}
                      <p className="comment-content">
                        {comment.content || "Không có nội dung đánh giá."}
                      </p>
                    </div>
                  </article>

                  {/* Admin Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="comment-replies">
                      {comment.replies.map((reply) => (
                        <article
                          key={reply.id}
                          className="comment-item comment-pharmacity"
                        >
                          <div className="comment-header">
                            <div className="comment-avatar comment-avatar-pharmacity">
                              <div className="pharmacity-logo">
                                NHÀ THUỐC
                                <br />
                                Hiệu thuốc Việt
                              </div>
                            </div>
                            <div className="comment-info">
                              <div className="comment-name-row">
                                <h4 className="comment-user-name">
                                  Hiệu thuốc Việt
                                </h4>
                                <span className="comment-verified">
                                  <i className="ri-verify-badge-fill"></i>
                                </span>
                                {isAdmin && (
                                  <div className="comment-actions">
                                    <button
                                      type="button"
                                      className="comment-action-btn"
                                      onClick={() => {
                                        setEditingReply(reply.id);
                                        setReplyForm({
                                          content: reply.content,
                                        });
                                      }}
                                      title="Chỉnh sửa"
                                    >
                                      <i className="ri-edit-line"></i>
                                    </button>
                                    <button
                                      type="button"
                                      className="comment-action-btn"
                                      onClick={async () => {
                                        if (
                                          window.confirm(
                                            "Bạn có chắc muốn xóa trả lời này?"
                                          )
                                        ) {
                                          try {
                                            await deleteReviewReply(reply.id);
                                            toast("Đã xóa trả lời thành công");
                                            // Reload comments
                                            const productIdNum =
                                              Number(productId);
                                            const commentsData =
                                              await getCommentsByProduct(
                                                productIdNum,
                                                currentPage,
                                                10
                                              );
                                            setComments(
                                              commentsData.comments || []
                                            );
                                          } catch (err) {
                                            toast(
                                              err.message ||
                                                "Lỗi khi xóa trả lời"
                                            );
                                          }
                                        }
                                      }}
                                      title="Xóa"
                                    >
                                      <i className="ri-delete-bin-line"></i>
                                    </button>
                                  </div>
                                )}
                              </div>
                              <div className="comment-meta">
                                <span className="comment-date">
                                  {formatDate(reply.created_at)}
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="comment-body">
                            {editingReply === reply.id ? (
                              <div className="reply-edit-form">
                                <textarea
                                  value={replyForm.content}
                                  onChange={(e) =>
                                    setReplyForm({
                                      content: e.target.value,
                                    })
                                  }
                                  rows={3}
                                  maxLength={2000}
                                />
                                <div className="reply-edit-actions">
                                  <button
                                    type="button"
                                    className="btn btn-main btn-sm"
                                    onClick={async () => {
                                      try {
                                        await updateReviewReply(
                                          reply.id,
                                          replyForm.content
                                        );
                                        toast("Đã cập nhật trả lời thành công");
                                        setEditingReply(null);
                                        setReplyForm({ content: "" });
                                        // Reload comments
                                        const productIdNum = Number(productId);
                                        const commentsData =
                                          await getCommentsByProduct(
                                            productIdNum,
                                            currentPage,
                                            10
                                          );
                                        setComments(
                                          commentsData.comments || []
                                        );
                                      } catch (err) {
                                        toast(
                                          err.message ||
                                            "Lỗi khi cập nhật trả lời"
                                        );
                                      }
                                    }}
                                  >
                                    Lưu
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-ghost btn-sm"
                                    onClick={() => {
                                      setEditingReply(null);
                                      setReplyForm({ content: "" });
                                    }}
                                  >
                                    Hủy
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="comment-content">{reply.content}</p>
                            )}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}

                  {/* Admin Reply Form */}
                  {isAdmin && replyingTo === comment.id && (
                    <div className="admin-reply-form">
                      <div className="comment-item comment-pharmacity">
                        <div className="comment-header">
                          <div className="comment-avatar comment-avatar-pharmacity">
                            <div className="pharmacity-logo">
                              NHÀ THUỐC
                              <br />
                              Hiệu thuốc Việt
                            </div>
                          </div>
                          <div className="comment-info">
                            <div className="comment-name-row">
                              <h4 className="comment-user-name">
                                Hiệu thuốc Việt
                              </h4>
                              <span className="comment-verified">
                                <i className="ri-verify-badge-fill"></i>
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="comment-body">
                          <textarea
                            value={replyForm.content}
                            onChange={(e) =>
                              setReplyForm({ content: e.target.value })
                            }
                            placeholder="Viết trả lời của bạn..."
                            rows={4}
                            maxLength={2000}
                          />
                          <div className="reply-form-actions">
                            <button
                              type="button"
                              className="btn btn-main btn-sm"
                              onClick={async () => {
                                if (!replyForm.content.trim()) {
                                  toast("Vui lòng nhập nội dung trả lời");
                                  return;
                                }
                                try {
                                  await addReviewReply(
                                    comment.id,
                                    replyForm.content
                                  );
                                  toast("Đã thêm trả lời thành công");
                                  setReplyingTo(null);
                                  setReplyForm({ content: "" });
                                  // Reload comments
                                  const productIdNum = Number(productId);
                                  const commentsData =
                                    await getCommentsByProduct(
                                      productIdNum,
                                      currentPage,
                                      10
                                    );
                                  setComments(commentsData.comments || []);
                                } catch (err) {
                                  toast(err.message || "Lỗi khi thêm trả lời");
                                }
                              }}
                            >
                              Gửi trả lời
                            </button>
                            <button
                              type="button"
                              className="btn btn-ghost btn-sm"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyForm({ content: "" });
                              }}
                            >
                              Hủy
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Admin Reply Button */}
                  {isAdmin && replyingTo !== comment.id && (
                    <div className="comment-reply-btn-wrapper">
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          setReplyingTo(comment.id);
                          setReplyForm({ content: "" });
                        }}
                      >
                        <i className="ri-reply-line"></i> Trả lời
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {/* Phân trang */}
              {pagination.totalPages > 1 && (
                <div className="comments-pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="ri-arrow-left-s-line"></i> Trước
                  </button>

                  <div className="pagination-pages">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter((page) => {
                        // Hiển thị trang đầu, cuối, và các trang xung quanh trang hiện tại
                        return (
                          page === 1 ||
                          page === pagination.totalPages ||
                          (page >= currentPage - 1 && page <= currentPage + 1)
                        );
                      })
                      .map((page, index, array) => {
                        // Thêm dấu ... nếu có khoảng trống
                        const prevPage = array[index - 1];
                        const showEllipsis = prevPage && page - prevPage > 1;

                        return (
                          <span key={page}>
                            {showEllipsis && (
                              <span className="pagination-ellipsis">...</span>
                            )}
                            <button
                              className={`pagination-page ${
                                currentPage === page ? "active" : ""
                              }`}
                              onClick={() => handlePageChange(page)}
                            >
                              {page}
                            </button>
                          </span>
                        );
                      })}
                  </div>

                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === pagination.totalPages}
                  >
                    Sau <i className="ri-arrow-right-s-line"></i>
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </section>
  );
}
