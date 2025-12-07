// src/pages/BanChay.jsx
import { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Frame from "../components/Frame";
import QuickViewModal from "../components/QuickViewModal";
import { CART_KEY, addToCart, dispatchCartUpdated } from "../services/products";
import { getBestsellerProducts, getFilters } from "../services/productApi";
import "../assets/css/ban-chay.css";
import "../assets/css/thuoc.css";
const PAGE_SIZE = 6;

export default function BanChay() {
  const nav = useNavigate();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tất cả");
  const [brand, setBrand] = useState("Tất cả");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [ratingMin, setRatingMin] = useState(0);
  const [sort, setSort] = useState("soldDesc");
  const [page, setPage] = useState(1);
  const [quick, setQuick] = useState(null);
  const [quickTab, setQuickTab] = useState("tong-quan");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(["Tất cả"]);
  const [brands, setBrands] = useState(["Tất cả"]);
  const [loading, setLoading] = useState(true);
  const [brandSearch, setBrandSearch] = useState("");
  const [showMoreBrands, setShowMoreBrands] = useState(false);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [displayCount, setDisplayCount] = useState(16);

  useEffect(() => {
    dispatchCartUpdated();
  }, []);

  // Load filters
  useEffect(() => {
    async function loadFilters() {
      try {
        const data = await getFilters();
        if (data && data.categories && data.brands) {
          setCategories(["Tất cả", ...(data.categories || [])]);
          setBrands(["Tất cả", ...(data.brands || [])]);
        }
      } catch (err) {
        console.error("Error loading filters:", err);
      }
    }
    loadFilters();
  }, []);

  // Load products
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const data = await getBestsellerProducts(100); // Get more for filtering
        setProducts(data || []);
      } catch (err) {
        console.error("Error loading products:", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const list = useMemo(() => {
    const norm = (s) => (s || "").toLowerCase().trim();
    let l = [...products];
    if (q.trim()) {
      const k = norm(q);
      l = l.filter((p) => norm(p.name).includes(k));
    }
    if (cat !== "Tất cả") l = l.filter((p) => (p.cat || p.tag) === cat);
    if (brand !== "Tất cả") l = l.filter((p) => p.brand === brand);
    const mn = minPrice ? Number(minPrice) : -Infinity;
    const mx = maxPrice ? Number(maxPrice) : Infinity;
    l = l.filter((p) => p.price >= mn && p.price <= mx);
    if (ratingMin > 0) l = l.filter((p) => (p.rating || 0) >= ratingMin);
    if (sort === "soldDesc") l.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    if (sort === "priceAsc") l.sort((a, b) => a.price - b.price);
    if (sort === "priceDesc") l.sort((a, b) => b.price - a.price);
    if (sort === "ratingDesc")
      l.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    if (sort === "newest") l.sort((a, b) => b.id - a.id);
    return l;
  }, [products, q, cat, brand, minPrice, maxPrice, ratingMin, sort]);

  const total = list.length;
  const displayedProducts = list.slice(0, displayCount);
  const hasMore = total > displayCount;

  const resetFilters = () => {
    setQ("");
    setCat("Tất cả");
    setBrand("Tất cả");
    setMinPrice("");
    setMaxPrice("");
    setRatingMin(0);
    setSort("soldDesc");
    setBrandSearch("");
    setShowMoreBrands(false);
    setShowMoreCategories(false);
    setDisplayCount(16);
  };

  const handleShowMore = () => {
    setDisplayCount((prev) => Math.min(prev + 16, total));
  };
  const fmt = (n) => {
    const num = Number(n);
    if (!Number.isFinite(num)) {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0,
      }).format(0);
    }
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(num);
  };
  const stars = (r) =>
    "★".repeat(Math.round(r)) + "☆".repeat(5 - Math.round(r));

  return (
    <main className="lc shop">
      <div className="container shop__wrap">
        <aside className="shop__side">
          <Frame>
            <div className="filter-header">
              <span className="filter-header__title">Bộ lọc</span>
              <button className="filter-header__reset" onClick={resetFilters}>
                Thiết lập lại
              </button>
            </div>
          </Frame>

          <Frame title="Khoảng giá">
            <div className="price-range">
              <div className="price-range__inputs">
                <div className="price-range__input-wrapper">
                  <input
                    type="number"
                    placeholder="Tối thiểu"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                    }}
                  />
                </div>
                <div className="price-range__input-wrapper">
                  <input
                    type="number"
                    placeholder="Tối đa"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                    }}
                  />
                </div>
              </div>
              <button
                className="price-range__apply"
                onClick={() => setDisplayCount(16)}
              >
                Áp dụng
              </button>
              <div className="price-range__options">
                <label className="price-range__option">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={!minPrice && !maxPrice}
                    onChange={() => {
                      setMinPrice("");
                      setMaxPrice("");
                      setDisplayCount(16);
                    }}
                  />
                  <span>Tất cả</span>
                </label>
                <label className="price-range__option">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={!minPrice && maxPrice === "100000"}
                    onChange={() => {
                      setMinPrice("");
                      setMaxPrice("100000");
                      setDisplayCount(16);
                    }}
                  />
                  <span>Dưới 100.000 ₫</span>
                </label>
                <label className="price-range__option">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={minPrice === "100000" && maxPrice === "300000"}
                    onChange={() => {
                      setMinPrice("100000");
                      setMaxPrice("300000");
                      setDisplayCount(16);
                    }}
                  />
                  <span>100.000 ₫ - 300.000 ₫</span>
                </label>
                <label className="price-range__option">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={minPrice === "300000" && maxPrice === "500000"}
                    onChange={() => {
                      setMinPrice("300000");
                      setMaxPrice("500000");
                      setDisplayCount(16);
                    }}
                  />
                  <span>300.000 ₫ - 500.000 ₫</span>
                </label>
                <label className="price-range__option">
                  <input
                    type="radio"
                    name="priceRange"
                    checked={minPrice === "500000" && !maxPrice}
                    onChange={() => {
                      setMinPrice("500000");
                      setMaxPrice("");
                      setDisplayCount(16);
                    }}
                  />
                  <span>Trên 500.000 ₫</span>
                </label>
              </div>
            </div>
          </Frame>
        </aside>

        <section className="shop__main">
          <div className="shop__toolbar">
            <div className="muted">{total.toLocaleString()} sản phẩm</div>
            <div className="shop__actions">
              <span className="sort-label">Sắp xếp theo:</span>
              <select
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setDisplayCount(16);
                }}
              >
                <option value="soldDesc">Bán chạy nhất</option>
                <option value="priceAsc">Giá: thấp → cao</option>
                <option value="priceDesc">Giá: cao → thấp</option>
                <option value="ratingDesc">Đánh giá cao</option>
                <option value="newest">Mới nhất</option>
              </select>
            </div>
          </div>

          <div className="t-grid">
            {displayedProducts.map((p) => (
              <article className="t-card" key={p.id}>
                <div className="t-thumb">
                  <img
                    src={p.cover || p.img || "/img/placeholder.jpg"}
                    alt={p.name || "Sản phẩm"}
                    onError={(e) => {
                      e.currentTarget.src = "/img/placeholder.jpg";
                    }}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                  {p.discount > 0 && (
                    <span className="t-badge t-badge--sale">
                      -{p.discount}%
                    </span>
                  )}
                  {!p.discount && p.sale && (
                    <span className="t-badge t-badge--sale">{p.sale}</span>
                  )}
                  <span className="t-badge t-badge--tag">{p.cat || p.tag}</span>
                </div>

                <div className="t-body">
                  <h3 className="t-title" title={p.name}>
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
                  </h3>

                  <div className="t-price">
                    <b>{fmt(p.price)}</b>
                    {(p.oldPrice || p.old) && <s>{fmt(p.oldPrice || p.old)}</s>}
                  </div>

                  <div className="t-meta">
                    <span className="rate">
                      <i className="ri-star-fill" />{" "}
                      {(p.rating || 0).toFixed(1)}
                    </span>
                    <span className="sold">
                      Đã bán {(p.sold || 0).toLocaleString("vi-VN")}
                    </span>
                  </div>

                  <div className="t-hot">
                    <span
                      style={{
                        width: `${Math.min(
                          100,
                          Math.round(((p.sold || 0) / 5000) * 100)
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="t-actions">
                    <button
                      className="btn btn--buy"
                      onClick={() => {
                        try {
                          addToCart(p, 1);
                        } catch (err) {
                          // Error đã được xử lý trong addToCart
                        }
                      }}
                    >
                      <i className="ri-shopping-cart-2-line" /> Thêm vào giỏ
                    </button>
                    <button
                      className="btn btn--ghost"
                      onClick={() => {
                        setQuickTab("tong-quan");
                        setQuick(p);
                      }}
                    >
                      <i className="ri-eye-line" /> Xem
                    </button>
                    <Link
                      className="btn btn--ghost"
                      to={`/san-pham/${p.id}`}
                      style={{
                        textDecoration: "none",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <i className="ri-file-list-line" /> Chi tiết
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Nút Xem thêm */}
          {hasMore && (
            <div className="show-more-products">
              <button
                className="btn-show-more-products"
                onClick={handleShowMore}
              >
                Xem thêm
                <i className="ri-arrow-down-s-line"></i>
              </button>
            </div>
          )}
        </section>
      </div>

      {quick && (
        <QuickViewModal
          data={{
            ...quick,
            discount: quick.sale
              ? parseInt(quick.sale.replace(/[^0-9]/g, ""))
              : 0,
            tag: quick.cat || "",
            oldPrice: quick.old || quick.price,
          }}
          initialTab={quickTab}
          onAdd={(product) => {
            try {
              addToCart(product, 1);
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
