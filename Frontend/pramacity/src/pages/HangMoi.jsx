// src/pages/HangMoi.jsx
import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import QuickViewModal from "../components/QuickViewModal";
import { addToCart } from "../services/products";
import { getNewProducts } from "../services/productApi";
import "../assets/css/hangmoi.css";

// Map category từ cat để hiển thị
const CATEGORY_MAP = {
  "Vitamin": "health",
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
  const [page, setPage] = useState(1);
  const [quick, setQuick] = useState(null);
  const [quickTab, setQuickTab] = useState("tong-quan");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 8;

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

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleProducts = filtered.slice(start, start + PAGE_SIZE);

  const gotoPage = (p) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
    sliderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleTagClick = (key) => {
    setActiveTag(key);
    setPage(1);
  };

  return (
    <main className="lc new-products">

      {/* HERO */}
      <section className="np-hero">
        <div className="np-hero-main">
          <span className="np-chip">Hàng mới mỗi ngày</span>
          <h2 className="np-hero-title">Khám phá sản phẩm vừa lên kệ</h2>
          <p className="np-hero-sub">
            Bổ sung vitamin, chăm sóc da, sản phẩm cho bé… luôn được cập nhật
            liên tục để bạn dễ dàng chọn mua.
          </p>
        </div>

        <div className="np-hero-side">
          <ul className="np-tags">
            {TAGS.map((tag) => (
              <li key={tag.key}>
                <button
                  type="button"
                  className={
                    "np-tag-btn" + (activeTag === tag.key ? " is-active" : "")
                  }
                  onClick={() => handleTagClick(tag.key)}
                >
                  {tag.label}
                </button>
              </li>
            ))}
          </ul>
          <div className="np-small-note">
            <i className="ri-information-line" />
            <span>Giá và số lượng có thể thay đổi theo từng thời điểm.</span>
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
                      <i className="ri-star-fill" /> {(p.rating || 0).toFixed(1)}
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

        {/* Phân trang (dùng chung style như Thuốc) */}
        {totalPages > 1 && (
          <div className="t-paging">
            <button
              className="t-page-btn"
              onClick={() => gotoPage(currentPage - 1)}
              disabled={currentPage === 1}
            >
              ‹ Trước
            </button>
            <span className="t-page-current">{currentPage}</span>
            <button
              className="t-page-btn"
              onClick={() => gotoPage(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Sau ›
            </button>
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
