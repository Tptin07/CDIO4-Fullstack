// src/pages/FlashSale.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import QuickViewModal from "../components/QuickViewModal";
import { addToCart, dispatchCartUpdated } from "../services/products";
import { getProducts } from "../services/productApi";
import "../assets/css/thuoc.css";
import "../assets/css/khuyenmai.css";

const vnd = (n) => {
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

export default function FlashSale() {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("giam-gia");
  const [quick, setQuick] = useState(null);
  const [quickTab, setQuickTab] = useState("tong-quan");
  const [displayCount, setDisplayCount] = useState(16);

  // State cho dữ liệu từ API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products - chỉ lấy sản phẩm có discount
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({
          sort: "giam-gia",
          limit: 1000, // Load nhiều để filter client-side
        });
        if (data && Array.isArray(data.products)) {
          // Chỉ lấy sản phẩm có discount > 0
          const flashSaleProducts = data.products.filter(
            (p) => (p.discount || 0) > 0
          );
          setProducts(flashSaleProducts);
        } else if (data && data.products) {
          const flashSaleProducts = (
            Array.isArray(data.products) ? data.products : []
          ).filter((p) => (p.discount || 0) > 0);
          setProducts(flashSaleProducts);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error loading flash sale products:", err);
        setError(
          "Không thể tải danh sách sản phẩm flash sale. Vui lòng thử lại sau."
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  useEffect(() => {
    dispatchCartUpdated();
  }, []);

  // Filter và sort products client-side
  const filteredProducts = useMemo(() => {
    let list = [...products];

    if (q.trim()) {
      const searchTerm = q.toLowerCase();
      list = list.filter((p) =>
        (p.name || "").toLowerCase().includes(searchTerm)
      );
    }

    if (sort === "pho-bien") {
      list.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    } else if (sort === "gia-tang") {
      list.sort((a, b) => a.price - b.price);
    } else if (sort === "gia-giam") {
      list.sort((a, b) => b.price - a.price);
    } else if (sort === "giam-gia") {
      list.sort((a, b) => {
        const discountA = a.discount || 0;
        const discountB = b.discount || 0;
        return discountB - discountA;
      });
    }

    return list;
  }, [products, q, sort]);

  const total = filteredProducts.length;
  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = total > displayCount;

  const handleShowMore = () => {
    setDisplayCount((prev) => Math.min(prev + 16, total));
  };

  return (
    <>
      <main className="lc shop">
        {/* HERO */}
        <section className="t-hero">
          <div className="t-hero__text">
            <h1>
              Flash Sale <span>Giá tốt nhất</span>
            </h1>
            <p>
              Sản phẩm giảm giá sốc, ưu đãi đặc biệt. Mua ngay để nhận giá tốt
              nhất, số lượng có hạn!
            </p>
            <div className="t-hero__stats">
              <span>
                <i className="ri-fire-line" /> Deal hot
              </span>
              <span>
                <i className="ri-time-line" /> Giới hạn thời gian
              </span>
              <span>
                <i className="ri-shopping-cart-line" /> Số lượng có hạn
              </span>
            </div>
          </div>

          {/* Banner flash sale bên phải */}
          <div className="t-hero__art">
            <div className="hero-banner">
              <div className="hero-banner__text">
                <span className="hero-badge">Flash Sale</span>
                <h2>Giảm giá sốc -30%</h2>
                <p>Thuốc, vitamin, thiết bị y tế…</p>
                <button className="hero-btn">Xem ngay</button>
              </div>
              <div className="hero-banner__img" />
            </div>
          </div>
        </section>

        {/* WRAP CONTENT */}
        <div className="container shop__wrap">
          {/* CONTENT */}
          <section className="shop__main">
            <div className="shop__toolbar">
              <div className="muted">
                {total.toLocaleString()} sản phẩm flash sale
              </div>
              <div className="shop__actions">
                <span className="sort-label">Sắp xếp theo:</span>
                <select
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setDisplayCount(16);
                  }}
                >
                  <option value="giam-gia">% giảm nhiều</option>
                  <option value="pho-bien">Phổ biến</option>
                  <option value="gia-tang">Giá: thấp → cao</option>
                  <option value="gia-giam">Giá: cao → thấp</option>
                </select>
              </div>
            </div>

            {/* Search */}
            <div className="promo-search" style={{ marginBottom: "24px" }}>
              <div className="search-container">
                <div className="search-box">
                  <i className="ri-search-line"></i>
                  <input
                    type="text"
                    placeholder="Tìm sản phẩm flash sale..."
                    value={q}
                    onChange={(e) => {
                      setQ(e.target.value);
                      setDisplayCount(16);
                    }}
                  />
                </div>
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                Đang tải sản phẩm flash sale...
              </div>
            )}

            {error && (
              <div
                style={{ textAlign: "center", padding: "2rem", color: "red" }}
              >
                {error}
              </div>
            )}

            {!loading && !error && displayedProducts.length === 0 && (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                Không tìm thấy sản phẩm flash sale nào.
              </div>
            )}

            <div className="t-grid">
              {displayedProducts &&
                displayedProducts.length > 0 &&
                displayedProducts.map((p) => (
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
                      {p.tag && (
                        <span className="t-badge t-badge--tag">{p.tag}</span>
                      )}
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
                        <b>{vnd(p.price)}</b>
                        {p.oldPrice && <s>{vnd(p.oldPrice)}</s>}
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
                              const cartProduct = {
                                id: p.id,
                                name: p.name,
                                price: p.price,
                                img: p.cover || p.img,
                              };
                              addToCart(cartProduct, 1);
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
                          <i className="ri-eye-line" /> Xem nhanh
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
      </main>

      {quick && (
        <QuickViewModal
          data={quick}
          initialTab={quickTab}
          onAdd={(product) => {
            try {
              const cartProduct = {
                id: product.id,
                name: product.name,
                price: product.price,
                img: product.cover || product.img,
              };
              addToCart(cartProduct, 1);
              setQuick(null);
            } catch (err) {
              // Error đã được xử lý trong addToCart
            }
          }}
          onClose={() => setQuick(null)}
        />
      )}
    </>
  );
}
