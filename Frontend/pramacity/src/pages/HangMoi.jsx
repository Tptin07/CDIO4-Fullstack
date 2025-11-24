// src/pages/HangMoi.jsx
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import QuickViewModal from "../components/QuickViewModal";
import { addToCart } from "../services/products";
import { getNewProducts } from "../services/productApi";
import "../assets/css/hangmoi.css";

// Map category từ cat để hiển thị
const CATEGORY_MAP = {
  Vitamin: "health",
  "Vitamin/ khoáng": "health",
  "Chăm sóc da": "skin",
  "Cho bé": "kids",
  "Khẩu trang": "health", // Khẩu trang thuộc nhóm sức khỏe
  "Thiết bị y tế": "health",
};

const TAGS = [
  { key: "all", label: "Tất cả" },
  { key: "health", label: "Chăm sóc sức khỏe" },
  { key: "skin", label: "Chăm sóc da" },
  { key: "kids", label: "Cho bé" },
];

const CATEGORY_LABELS = {
  health: "Vitamin/ khoáng",
  skin: "Chăm sóc da",
  kids: "Cho bé",
};

// Map ngược lại từ category về cat để hiển thị label đúng
const getCategoryLabel = (product) => {
  // Ưu tiên dùng cat từ data gốc
  if (product.cat) return product.cat;
  // Nếu không có cat, dùng category để map
  return CATEGORY_LABELS[product.category] || product.category || "Sản phẩm";
};

const fmt = (n) => n.toLocaleString("vi-VN") + "₫";
const offPercent = (p) => {
  const oldPrice = p.oldPrice || p.old;
  return oldPrice && oldPrice > p.price
    ? Math.round(((oldPrice - p.price) / oldPrice) * 100)
    : 0;
};

// Toast đơn giản
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
    setTimeout(() => t.remove(), 280);
  }, 2300);
}

export default function HangMoi() {
  const sliderRef = useRef(null);
  const [activeTag, setActiveTag] = useState("all");
  const [visibleCount, setVisibleCount] = useState(8);
  const [quick, setQuick] = useState(null);
  const [quickTab, setQuickTab] = useState("tong-quan");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const INITIAL_COUNT = 8;
  const LOAD_MORE_COUNT = 8;

  // Load products from API
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const data = await getNewProducts(100); // Get more for filtering
        // Map products to include category
        const mapped = (data || []).map((p) => ({
          ...p,
          oldPrice: p.old || p.oldPrice,
          category: CATEGORY_MAP[p.cat || p.tag] || "health",
          badge: p.sale ? ((p.sold || 0) > 5000 ? "hot" : "new") : null,
        }));
        setProducts(mapped);
      } catch (error) {
        console.error("Error loading products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const scrollBy = (dx) => {
    if (!sliderRef.current) return;
    sliderRef.current.scrollBy({ left: dx, behavior: "smooth" });
  };

  // lọc theo tag
  const filtered = products.filter((p) =>
    activeTag === "all" ? true : p.category === activeTag
  );

  const visibleProducts = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + LOAD_MORE_COUNT);
    // Scroll to grid after a short delay to allow rendering
    setTimeout(() => {
      sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleTagClick = (key) => {
    setActiveTag(key);
    setVisibleCount(INITIAL_COUNT);
  };

  return (
    <main className="lc new-products">
      {/* HERO - Full Width với màu sắc tươi tắn */}
      <section className="np-hero-wrapper">
        <div className="np-hero-bg">
          <div className="np-hero-gradient"></div>
          <div className="np-hero-pattern"></div>
        </div>

        <div className="np-hero-container">
          <div className="np-hero-content">
            <div className="np-hero-main">
              <div className="np-hero-badges">
                <span className="np-badge-new">
                  <i className="ri-sparkling-2-fill"></i>
                  Hàng mới mỗi ngày
                </span>
                <span className="np-badge-hot">
                  <i className="ri-fire-fill"></i>
                  Hot nhất tuần
                </span>
                <span className="np-badge-sale">
                  <i className="ri-price-tag-3-fill"></i>
                  Ưu đãi đặc biệt
                </span>
              </div>

              <h1 className="np-hero-title">
                Khám phá sản phẩm{" "}
                <span className="np-hero-title-highlight">vừa lên kệ</span>
              </h1>

              <p className="np-hero-sub">
                Bổ sung vitamin, chăm sóc da, sản phẩm cho bé… luôn được cập
                nhật liên tục để bạn dễ dàng chọn mua những sản phẩm chất lượng
                nhất.
              </p>

              <div className="np-hero-stats">
                <div className="np-stat-item">
                  <span className="np-stat-number">50+</span>
                  <span className="np-stat-label">Sản phẩm mới</span>
                </div>
                <div className="np-stat-divider"></div>
                <div className="np-stat-item">
                  <span className="np-stat-number">24/7</span>
                  <span className="np-stat-label">Cập nhật</span>
                </div>
                <div className="np-stat-divider"></div>
                <div className="np-stat-item">
                  <span className="np-stat-number">100%</span>
                  <span className="np-stat-label">Chính hãng</span>
                </div>
              </div>
            </div>

            <div className="np-hero-filters">
              <div className="np-filters-header">
                <h3 className="np-filters-title">
                  <i className="ri-filter-3-fill"></i>
                  Lọc theo danh mục
                </h3>
              </div>

              <div className="np-tags-wrapper">
                <ul className="np-tags">
                  {TAGS.map((tag) => (
                    <li key={tag.key}>
                      <button
                        type="button"
                        className={
                          "np-tag-btn" +
                          (activeTag === tag.key ? " is-active" : "")
                        }
                        onClick={() => handleTagClick(tag.key)}
                      >
                        {activeTag === tag.key && (
                          <i className="ri-check-line"></i>
                        )}
                        {tag.label}
                        {activeTag === tag.key && (
                          <span className="np-tag-count">
                            {filtered.length}
                          </span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="np-hero-note">
                <i className="ri-information-line"></i>
                <span>Giá và số lượng có thể thay đổi theo từng thời điểm</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Nút trượt mobile */}
      <div className="np-arrows">
        <button
          type="button"
          className="np-arrow prev"
          onClick={() => scrollBy(-260)}
          aria-label="Sản phẩm trước"
        >
          <i className="ri-arrow-left-s-line" />
        </button>
        <button
          type="button"
          className="np-arrow next"
          onClick={() => scrollBy(260)}
          aria-label="Sản phẩm sau"
        >
          <i className="ri-arrow-right-s-line" />
        </button>
      </div>

      {/* Grid / slider */}
      <div className="container">
        <div className="np-grid" ref={sliderRef}>
          {visibleProducts.map((p) => {
            const discountPercent = offPercent(p);
            // Lấy category label từ cat nếu có, nếu không thì dùng category
            const categoryLabel = getCategoryLabel(p);
            const progressValue = Math.min(100, ((p.sold || 0) / 10000) * 100); // Progress based on sales

            return (
              <article className="np-card" key={p.id}>
                {/* media */}
                <div className="np-card__media-wrapper">
                  <Link to={`/san-pham/${p.id}`} className="np-card__media">
                    {discountPercent > 0 && (
                      <span className="np-badge np-badge--sale">
                        -{discountPercent}%
                      </span>
                    )}

                    <img
                      src={p.cover || p.img}
                      alt={p.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/img/placeholder.jpg";
                      }}
                    />
                  </Link>

                  {/* Category label */}
                  <span className="np-category-label">{categoryLabel}</span>
                </div>

                {/* body */}
                <div className="np-card__body">
                  <h3 className="np-title">
                    <Link to={`/san-pham/${p.id}`}>{p.name}</Link>
                  </h3>

                  <div className="np-price-row">
                    <span className="np-price">{fmt(p.price)}</span>
                    {(p.oldPrice || p.old) && (
                      <span className="np-price-old">
                        {fmt(p.oldPrice || p.old)}
                      </span>
                    )}
                  </div>

                  <div className="np-rating-row">
                    <span className="np-rating">
                      <i className="ri-star-fill" />{" "}
                      {(p.rating || 0).toFixed(1)}
                    </span>
                    <span className="np-sold">
                      Đã bán {(p.sold || 0).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <div className="np-progress">
                    <div
                      className="np-progress-bar"
                      style={{ width: `${progressValue}%` }}
                    ></div>
                  </div>

                  <div className="np-actions">
                    <button
                      type="button"
                      className="np-btn np-btn--add-cart"
                      onClick={() => {
                        try {
                          addToCart?.(p, 1);
                          toast(`Đã thêm "${p.name}" vào giỏ`);
                        } catch (err) {
                          // Error đã được xử lý trong addToCart
                        }
                      }}
                    >
                      <i className="ri-shopping-cart-line" />
                      <span>Thêm vào giỏ</span>
                    </button>
                    <div className="np-actions-row">
                      <button
                        type="button"
                        className="np-btn np-btn--quick-view"
                        onClick={() => {
                          setQuickTab("tong-quan");
                          // Convert product format to match QuickViewModal expected format
                          const quickViewData = {
                            ...p,
                            discount: discountPercent,
                            tag: categoryLabel,
                            img: p.cover || p.img,
                            cover: p.cover || p.img,
                            oldPrice: p.oldPrice || p.old,
                          };
                          setQuick(quickViewData);
                        }}
                      >
                        <i className="ri-eye-line" />
                        <span>Xem nhanh</span>
                      </button>
                      <Link
                        to={`/san-pham/${p.id}`}
                        className="np-btn np-btn--details"
                      >
                        <i className="ri-file-list-line" />
                        <span>Chi tiết</span>
                      </Link>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Nút Xem thêm */}
        {hasMore && (
          <div className="np-load-more-wrapper">
            <button
              type="button"
              className="np-btn-load-more"
              onClick={handleLoadMore}
            >
              <i className="ri-add-line"></i>
              <span>Xem thêm sản phẩm</span>
              <i className="ri-arrow-down-s-line"></i>
            </button>
            <p className="np-load-more-info">
              Đang hiển thị {visibleProducts.length} / {filtered.length} sản
              phẩm
            </p>
          </div>
        )}
      </div>

      {/* Quick View Modal */}
      {quick && (
        <QuickViewModal
          data={quick}
          initialTab={quickTab}
          onAdd={(product) => {
            try {
              addToCart?.(product, 1);
              toast(`Đã thêm "${product.name}" vào giỏ`);
              setQuick(null);
            } catch (err) {
              // Error đã được xử lý trong addToCart
            }
          }}
          onClose={() => setQuick(null)}
        />
      )}
    </main>
  );
}
