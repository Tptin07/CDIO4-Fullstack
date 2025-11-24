import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { getProductById } from "../services/productApi";

export default function QuickViewModal({ data, onClose, onAdd, initialTab = "tong-quan" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [productData, setProductData] = useState(data);
  const [loading, setLoading] = useState(false);
  
  // Fetch chi tiết sản phẩm từ API nếu có id
  useEffect(() => {
    // Reset về data ban đầu khi data thay đổi
    setProductData(data);
    
    if (data && data.id) {
      setLoading(true);
      getProductById(data.id)
        .then((fullData) => {
          setProductData(fullData);
        })
        .catch((err) => {
          console.error("Error loading product details:", err);
          // Giữ data ban đầu nếu lỗi
          setProductData(data);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [data?.id]);
  
  if (!data) return null;
  
  // Sử dụng productData (từ API) hoặc data (từ props) làm fallback
  const displayData = productData || data;

  // Khóa cuộn khi mở modal, trả lại như cũ khi đóng
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Cập nhật tab khi initialTab thay đổi
    setActiveTab(initialTab);
    return () => {
      document.body.style.overflow = prev || "";
    };
  }, [initialTab]);

  const node = (
    <div className="qv-overlay" onClick={onClose}>
      <div className="qv-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="qv-header">
          <div className="qv-tabs">
            <button 
              className={activeTab === "tong-quan" ? "on" : ""}
              onClick={() => setActiveTab("tong-quan")}
            >
              Tổng quan
            </button>
            <button 
              className={activeTab === "chi-tiet" ? "on" : ""}
              onClick={() => setActiveTab("chi-tiet")}
            >
              Chi tiết
            </button>
          </div>
          <button className="qv-close" onClick={onClose}>
            ×
          </button>
        </div>

        {/* Body */}
        <div className="qv-body">
          <div
            className="qv-media"
            style={{ 
              backgroundImage: `url(${displayData.cover || displayData.img || "/img/placeholder.jpg"})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            }}
          >
            {displayData.discount > 0 && (
              <span className="qv-badge off">-{displayData.discount}%</span>
            )}
            {displayData.tag && (
              <span className="qv-badge tag">{displayData.tag}</span>
            )}
          </div>

          <div className="qv-info">
            <h3 className="qv-title">{displayData.name}</h3>

            <div className="qv-price">
              <b>{(displayData.price || 0).toLocaleString("vi-VN")}đ</b>
              {(displayData.oldPrice || displayData.old) && (
                <s>{(displayData.oldPrice || displayData.old).toLocaleString("vi-VN")}đ</s>
              )}
            </div>

            <div className="qv-meta">
              <span>⭐ {((displayData.rating || 0).toFixed?.(1) ?? "0.0")}</span>
              <span>Đã bán {(displayData.sold || 0).toLocaleString("vi-VN")}</span>
            </div>
            
            {loading && (
              <div style={{ padding: "1rem", textAlign: "center", color: "#666" }}>
                Đang tải thông tin chi tiết...
              </div>
            )}

            {/* Tab Content */}
            {activeTab === "tong-quan" ? (
              <>
                <p className="qv-desc">
                  {displayData.desc || displayData.description || displayData.shortDescription || 
                   "Sản phẩm đang được ưu đãi mạnh. Thêm vào giỏ để giữ giá ngay!"}
                </p>

                <div className="qv-actions">
                  <button
                    className="qv-btn qv-primary"
                    onClick={() => onAdd?.(displayData)}
                  >
                    <i className="ri-shopping-cart-2-line" />
                    Thêm vào giỏ
                  </button>
                  <button className="qv-btn" onClick={onClose}>
                    Đóng
                  </button>
                </div>
              </>
            ) : (
              <div className="qv-detail">
                <div className="qv-detail-section">
                  <h4>Thông tin sản phẩm</h4>
                  <ul>
                    <li><strong>Tên sản phẩm:</strong> {displayData.name}</li>
                    {displayData.sku && (
                      <li><strong>Mã sản phẩm:</strong> {displayData.sku}</li>
                    )}
                    {displayData.brand && displayData.brand !== "—" && (
                      <li><strong>Thương hiệu:</strong> {displayData.brand}</li>
                    )}
                    {displayData.form && displayData.form.trim() !== "" && (
                      <li><strong>Dạng bào chế:</strong> {displayData.form}</li>
                    )}
                    {displayData.tag && (
                      <li><strong>Nhóm công dụng:</strong> {displayData.tag}</li>
                    )}
                    <li><strong>Giá:</strong> {(displayData.price || 0).toLocaleString("vi-VN")}đ</li>
                    {(displayData.oldPrice || displayData.old) && (
                      <li><strong>Giá gốc:</strong> <s>{(displayData.oldPrice || displayData.old).toLocaleString("vi-VN")}đ</s></li>
                    )}
                    {displayData.discount && displayData.discount > 0 && (
                      <li><strong>Giảm giá:</strong> -{displayData.discount}%</li>
                    )}
                    <li><strong>Đánh giá:</strong> ⭐ {((displayData.rating || 0).toFixed?.(1) ?? "0.0")}/5.0</li>
                    <li><strong>Đã bán:</strong> {(displayData.sold || 0).toLocaleString("vi-VN")} sản phẩm</li>
                  </ul>
                </div>

                <div className="qv-detail-section">
                  <h4>Mô tả sản phẩm</h4>
                  <p>
                    {displayData.desc || displayData.description || displayData.shortDescription || 
                     "Sản phẩm chất lượng cao, được sản xuất theo tiêu chuẩn GMP. Phù hợp cho sử dụng hàng ngày."}
                  </p>
                </div>

                <div className="qv-detail-section">
                  <h4>Hướng dẫn sử dụng</h4>
                  <p>
                    Vui lòng đọc kỹ hướng dẫn sử dụng trước khi dùng. Nếu có bất kỳ thắc mắc nào, 
                    hãy liên hệ với dược sĩ hoặc bác sĩ để được tư vấn chi tiết.
                  </p>
                </div>

                <div className="qv-actions">
                  <button
                    className="qv-btn qv-primary"
                    onClick={() => onAdd?.(displayData)}
                  >
                    <i className="ri-shopping-cart-2-line" />
                    Thêm vào giỏ
                  </button>
                  <button className="qv-btn" onClick={onClose}>
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="qv-footer">
          {displayData.sku && (
            <div className="qv-coupon">
              <i className="ri-ticket-2-line" />
              Mã hot hôm nay: <code>{displayData.sku}</code>
            </div>
          )}
          <small>Giao nhanh 2h tại nội thành.</small>
        </div>
      </div>
    </div>
  );

  // Dùng portal để modal luôn phủ toàn trang, không bị overflow/stacking chặn
  return createPortal(node, document.body);
}
