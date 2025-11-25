// src/components/Comments.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCommentsByProduct, addComment, getCommentCount } from "../services/comments";
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

export default function Comments({ productId, productRating = 0, productName = '' }) {
  const navigate = useNavigate();
  
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
    totalPages: 0 
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Load bình luận khi productId thay đổi
  useEffect(() => {
    async function loadComments() {
      if (!productId) return;
      
      console.log('🔄 Loading comments for product:', productId);
      setCommentsLoading(true);
      try {
        const [commentsData, count] = await Promise.all([
          getCommentsByProduct(productId, currentPage, 10, 'approved'),
          getCommentCount(productId, 'approved')
        ]);
        
        console.log('📊 Comments data received:', {
          comments: commentsData.comments?.length || 0,
          count: count,
          pagination: commentsData.pagination,
        });
        
        // Đảm bảo comments là array
        const commentsArray = Array.isArray(commentsData.comments) ? commentsData.comments : [];
        console.log('✅ Setting comments:', commentsArray.length, 'items');
        
        setComments(commentsArray);
        setPagination(commentsData.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
        setCommentCount(count);
      } catch (err) {
        console.error("❌ Error loading comments:", err);
        setComments([]);
        setCommentCount(0);
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

    try {
      setCommentsLoading(true);
      await addComment(
        productId, 
        commentForm.content.trim(), 
        commentForm.rating || 5, 
        commentForm.title?.trim() || null
      );
      
      // Reload comments để lấy danh sách mới nhất
      const commentsData = await getCommentsByProduct(productId, 1, 10, 'approved');
      setComments(commentsData.comments || []);
      setPagination(commentsData.pagination || { page: 1, limit: 10, total: 0, totalPages: 0 });
      
      // Update count
      const count = await getCommentCount(productId, 'approved');
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
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${hours}:${minutes} ${day}-${month}-${year}`;
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
              ({commentCount} {commentCount === 1 ? 'bình luận' : 'bình luận'})
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
                const token = localStorage.getItem('auth_token');
                if (!token) {
                  toast("Vui lòng đăng nhập để bình luận");
                  navigate('/dang-nhap');
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
                {commentsLoading ? 'Đang gửi...' : 'Gửi bình luận'}
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
                          <span>{comment.user_name?.charAt(0).toUpperCase() || 'K'}</span>
                        )}
                      </div>
                      <div className="comment-info">
                        <div className="comment-name-row">
                          <h4 className="comment-user-name">Khách hàng</h4>
                          {index === 0 && (
                            <span className="comment-helpful-tag">Hữu ích nhất</span>
                          )}
                        </div>
                        <div className="comment-meta">
                          {comment.rating && (
                            <div className="comment-rating-wrapper">
                              <span className="comment-stars">
                                {'★'.repeat(comment.rating)}{'☆'.repeat(5 - comment.rating)}
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
                      <p className="comment-content">{comment.content || 'Không có nội dung đánh giá.'}</p>
                    </div>
                  </article>

                  {/* Pharmacity Response */}
                  <article className="comment-item comment-pharmacity">
                    <div className="comment-header">
                      <div className="comment-avatar comment-avatar-pharmacity">
                        <div className="pharmacity-logo">NHÀ THUỐC<br />Hiệu thuốc Việt</div>
                      </div>
                      <div className="comment-info">
                        <div className="comment-name-row">
                          <h4 className="comment-user-name">Hiệu thuốc Việt</h4>
                          <span className="comment-verified">
                            <i className="ri-verify-badge-fill"></i>
                          </span>
                        </div>
                        <div className="comment-meta">
                          <span className="comment-date">
                            {formatDate(comment.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="comment-body">
                      <p className="comment-content">
                        Hiệu thuốc Việt xin chào! Sản phẩm {productName || 'này'} có công dụng là dùng phòng và điều trị mất điện giải và nước trong tiêu chảy cấp tự nhẹ đến vừa. Nếu cần hỗ trợ thêm thông tin, anh/chị vui lòng liên hệ hotline 1800.6821 (miễn phí). Để chuyên viên hỗ trợ mình kiểm tra chi tiết và nhanh chóng nhé. Chúc anh/chị nhiều sức khỏe!
                      </p>
                    </div>
                  </article>
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
                    {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                      .filter(page => {
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
                            {showEllipsis && <span className="pagination-ellipsis">...</span>}
                            <button
                              className={`pagination-page ${currentPage === page ? 'active' : ''}`}
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

