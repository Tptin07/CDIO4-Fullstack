// src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Comments from "../components/Comments";
import { addToCart } from "../services/products";
import { getProductById, getRelatedProducts } from "../services/productApi";
import "../assets/css/product-detail.css";

const vnd = (n) => {
  if (n === null || n === undefined || isNaN(n)) {
    return "0đ";
  }
  return Number(n).toLocaleString("vi-VN") + "đ";
};

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

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  // State cho sản phẩm và loading
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Load sản phẩm và sản phẩm liên quan
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      setError(null);
      try {
        const [productData, relatedData] = await Promise.all([
          getProductById(id),
          getRelatedProducts(id, 4).catch(() => []), // Nếu lỗi thì trả về mảng rỗng
        ]);
        setProduct(productData);
        setRelated(relatedData || []);

        // Set ảnh đầu tiên làm ảnh được chọn
        if (productData.images && productData.images.length > 0) {
          setSelectedImage(0);
        }
      } catch (err) {
        console.error("Error loading product:", err);
        setError("Không thể tải thông tin sản phẩm. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProduct();
    }
  }, [id]);

  // Scroll to top khi id sản phẩm thay đổi
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  if (loading) {
    return (
      <main className="pd">
        <div
          className="container pd-empty"
          style={{ textAlign: "center", padding: "2rem" }}
        >
          Đang tải thông tin sản phẩm...
        </div>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="pd">
        <div className="container pd-empty">
          {error ||
            "Không tìm thấy sản phẩm. Có thể sản phẩm đã được cập nhật lại."}
        </div>
      </main>
    );
  }

  const handleAdd = (p = product, qty = quantity) => {
    try {
      addToCart(p, qty);
      toast(`Đã thêm ${qty} "${p.name}" vào giỏ`);
    } catch (err) {
      // Error đã được xử lý trong addToCart (hiển thị toast và mở modal)
    }
  };

  const handleQuantityChange = (delta) => {
    setQuantity((prev) => Math.max(1, Math.min(99, prev + delta)));
  };

  // Tính sale text từ old price nếu không có sale
  const calculateSale = () => {
    if (product.sale) return product.sale;
    const oldPrice = product.old || product.oldPrice;
    if (oldPrice && oldPrice > product.price) {
      const discount = Math.round(
        ((oldPrice - product.price) / oldPrice) * 100
      );
      return `-${discount}%`;
    }
    return "";
  };
  const saleText = calculateSale();

  return (
    <main className="pd">
      {/* CARD 2 CỘT */}
      <div className="container pd-layout">
        {/* CỘT ẢNH */}
        <div className="pd-image-column">
          <div className="pd-media-main">
            {saleText && <span className="pd-sale-badge">{saleText}</span>}
            <img
              src={
                (product.images && product.images[selectedImage]?.url) ||
                product.img ||
                product.cover ||
                "/img/placeholder.jpg"
              }
              alt={product.name}
              onError={(e) => {
                e.currentTarget.src = "/img/placeholder.jpg";
              }}
            />
          </div>

          {/* thumbnails – hiển thị tối đa 4 hình ảnh từ database */}
          {product.images && product.images.length > 0 ? (
            <div className="pd-thumbs">
              {product.images.slice(0, 4).map((img, index) => (
                <button
                  className={`pd-thumb ${
                    selectedImage === index ? "active" : ""
                  }`}
                  key={index}
                  type="button"
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={img.url}
                    alt={img.alt || product.name}
                    onError={(e) => {
                      e.currentTarget.src = "/img/placeholder.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="pd-thumbs">
              <button className="pd-thumb active" type="button">
                <img
                  src={product.img || product.cover || "/img/placeholder.jpg"}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src = "/img/placeholder.jpg";
                  }}
                />
              </button>
            </div>
          )}

          <div className="pd-meta-small">
            <span>
              <i className="ri-shield-check-line" /> Hàng chính hãng
            </span>
            <span>
              <i className="ri-truck-line" /> Giao nhanh trong ngày
            </span>
            <span>
              <i className="ri-24-hours-line" /> Tư vấn dược sĩ 24/7
            </span>
          </div>
        </div>

        {/* CỘT THÔNG TIN */}
        <div className="pd-info">
          <nav className="pd-breadcrumb">
            <Link to="/">Trang chủ</Link>
            <span>/</span>
            <span>{product.cat}</span>
          </nav>

          <h1 className="pd-title">{product.name}</h1>

          <div className="pd-rating-row">
            <span className="pd-rating">
              <i className="ri-star-fill" /> {(product.rating || 0).toFixed(1)}
            </span>
            <span className="pd-dot" />
            <span>
              Đã bán <b>{(product.sold || 0).toLocaleString("vi-VN")}</b> sản
              phẩm
            </span>
          </div>

          <div className="pd-brand-row">
            <span>
              Thương hiệu: <b>{product.brand || "Đang cập nhật"}</b>
            </span>
            <span>Danh mục: {product.cat}</span>
          </div>

          {/* GIÁ */}
          <div className="pd-price-box">
            <div>
              <div className="pd-price-main">{vnd(product.price)}</div>
              {(product.old || product.oldPrice) && (
                <div className="pd-price-old">
                  Giá niêm yết:
                  <s>{vnd(product.old || product.oldPrice)}</s>
                </div>
              )}
            </div>
            {saleText && <span className="pd-price-tag">{saleText}</span>}
          </div>

          {/* CHỌN SỐ LƯỢNG */}
          <div className="pd-quantity-box">
            <label>Số lượng:</label>
            <div className="pd-quantity-controls">
              <button
                type="button"
                className="pd-qty-btn"
                onClick={() => handleQuantityChange(-1)}
                disabled={quantity <= 1}
              >
                <i className="ri-subtract-line" />
              </button>
              <input
                type="number"
                className="pd-qty-input"
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value) || 1;
                  setQuantity(Math.max(1, Math.min(99, val)));
                }}
                min="1"
                max="99"
              />
              <button
                type="button"
                className="pd-qty-btn"
                onClick={() => handleQuantityChange(1)}
                disabled={quantity >= 99}
              >
                <i className="ri-add-line" />
              </button>
            </div>
          </div>

          {/* NÚT */}
          <div className="pd-actions">
            <button
              type="button"
              className="btn btn-main"
              onClick={() => handleAdd()}
            >
              Chọn mua
            </button>
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => navigate(-1)}
            >
              ← Quay lại
            </button>
          </div>

          {/* THÔNG TIN SẢN PHẨM */}
          <div className="pd-section">
            <h3>Thông tin sản phẩm</h3>
            <ul className="pd-info-list">
              <li>
                <strong>Tên sản phẩm:</strong> {product.name}
              </li>
              {product.sku && (
                <li>
                  <strong>Mã sản phẩm:</strong> {product.sku}
                </li>
              )}
              {product.brand && product.brand !== "—" && (
                <li>
                  <strong>Thương hiệu:</strong> {product.brand}
                </li>
              )}
              {product.form && product.form.trim() !== "" && (
                <li>
                  <strong>Dạng bào chế:</strong> {product.form}
                </li>
              )}
              {product.cat && (
                <li>
                  <strong>Nhóm công dụng:</strong> {product.cat}
                </li>
              )}
              <li>
                <strong>Giá:</strong> {vnd(product.price)}
              </li>
              {(product.old || product.oldPrice) && (
                <li>
                  <strong>Giá gốc:</strong>{" "}
                  <s>{vnd(product.old || product.oldPrice)}</s>
                </li>
              )}
              {saleText && (
                <li>
                  <strong>Giảm giá:</strong> {saleText}
                </li>
              )}
              <li>
                <strong>Đánh giá:</strong> ⭐ {(product.rating || 0).toFixed(1)}
                /5.0
              </li>
              <li>
                <strong>Đã bán:</strong>{" "}
                {product.sold ? product.sold.toLocaleString("vi-VN") : "0"} sản
                phẩm
              </li>
            </ul>
          </div>

          {/* MÔ TẢ */}
          <div className="pd-section">
            <h3>Mô tả sản phẩm</h3>
            <p>
              {product.desc ||
                product.description ||
                product.shortDescription ||
                "Sản phẩm chất lượng cao, được sản xuất theo tiêu chuẩn GMP. Phù hợp cho sử dụng hàng ngày."}
            </p>
          </div>

          <div className="pd-section pd-note">
            <h4>Lưu ý sử dụng</h4>
            <ul>
              <li>Đọc kỹ hướng dẫn sử dụng trước khi dùng.</li>
              <li>
                Nếu đang mang thai, cho con bú hoặc có bệnh nền, hãy hỏi ý kiến
                bác sĩ/dược sĩ.
              </li>
              <li>
                Bảo quản nơi khô ráo, tránh ánh nắng trực tiếp, để xa tầm tay
                trẻ em.
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* SẢN PHẨM LIÊN QUAN */}
      {related.length > 0 && (
        <section className="pd-related">
          <h3 className="pd-related-title">Sản phẩm liên quan</h3>
          <div className="pd-related-grid">
            {related.map((p) => (
              <article key={p.id} className="pd-rel-card">
                <Link to={`/san-pham/${p.id}`} className="pd-rel-thumb">
                  <img src={p.img || p.cover} alt={p.name} />
                  {p.sale && <span className="pd-rel-sale">{p.sale}</span>}
                </Link>
                <div className="pd-rel-body">
                  <h4 className="pd-rel-name" title={p.name}>
                    <Link
                      to={`/san-pham/${p.id}`}
                      style={{
                        color: "inherit",
                        textDecoration: "none",
                        cursor: "pointer",
                      }}
                    >
                      {p.name}
                    </Link>
                  </h4>
                  <div className="pd-rel-price">
                    <span>{vnd(p.price)}</span>
                    {(p.old || p.oldPrice) && <s>{vnd(p.old || p.oldPrice)}</s>}
                  </div>
                  <button
                    type="button"
                    className="btn btn-rel"
                    onClick={() => handleAdd(p)}
                  >
                    Thêm giỏ
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ĐÁNH GIÁ KHÁCH HÀNG */}
      {product && id && (
        <Comments
          productId={Number(id)}
          productRating={product.rating || 0}
          productName={product.name || ""}
        />
      )}
    </main>
  );
}
