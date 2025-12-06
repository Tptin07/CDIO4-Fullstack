// src/pages/Thuoc.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Frame from "../components/Frame";
import QuickViewModal from "../components/QuickViewModal";
import { addToCart, dispatchCartUpdated } from "../services/products";
import { getProducts, getFilters } from "../services/productApi";
import "../assets/css/thuoc.css";
import "../assets/css/ban-chay.css";

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

export default function Thuoc() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("Tất cả");
  const [brand, setBrand] = useState("Tất cả");
  const [form, setForm] = useState("Tất cả");
  const [sort, setSort] = useState("pho-bien");
  const [quick, setQuick] = useState(null);
  const [quickTab, setQuickTab] = useState("tong-quan"); // "tong-quan" | "chi-tiet"
  const [displayCount, setDisplayCount] = useState(16);
  const [showMoreCategories, setShowMoreCategories] = useState(false);
  const [showMoreBrands, setShowMoreBrands] = useState(false);

  // State cho dữ liệu từ API
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    categories: ["Tất cả"],
    brands: ["Tất cả"],
    forms: ["Tất cả"],
  });

  // Fetch filters khi component mount
  useEffect(() => {
    async function loadFilters() {
      try {
        const data = await getFilters();
        if (data && data.categories && data.brands && data.forms) {
          setFilters({
            categories: ["Tất cả", ...(data.categories || [])],
            brands: ["Tất cả", ...(data.brands || [])],
            forms: ["Tất cả", ...(data.forms || [])],
          });
        }
      } catch (err) {
        console.error("Error loading filters:", err);
        // Giữ filters mặc định nếu lỗi
      }
    }
    loadFilters();
  }, []);

  // Fetch products - load tất cả để filter client-side
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({
          limit: 1000, // Load nhiều để filter client-side
        });
        // Kiểm tra data có tồn tại và có products không
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (data && data.products) {
          setProducts(Array.isArray(data.products) ? data.products : []);
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Error loading products:", err);
        setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.");
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

    if (cat !== "Tất cả") {
      const normalize = (s) => (s || "").toString().trim().toLowerCase();
      list = list.filter((p) => {
        const prodCat = p.cat || p.category || p.tag || p.category_name || "";
        return normalize(prodCat) === normalize(cat);
      });
    }

    if (brand !== "Tất cả") {
      list = list.filter((p) => p.brand === brand);
    }

    if (form !== "Tất cả") {
      list = list.filter((p) => (p.form || p.dosageForm) === form);
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
  }, [products, q, cat, brand, form, sort]);

  const total = filteredProducts.length;
  const displayedProducts = filteredProducts.slice(0, displayCount);
  const hasMore = total > displayCount;

  const handleShowMore = () => {
    setDisplayCount((prev) => Math.min(prev + 16, total));
  };

  const resetFilters = () => {
    setQ("");
    setCat("Tất cả");
    setBrand("Tất cả");
    setForm("Tất cả");
    setSort("pho-bien");
    setDisplayCount(16);
    setShowMoreCategories(false);
    setShowMoreBrands(false);
  };

  return (
    <>
      <main className="lc shop">
        {/* HERO */}
        <section className="t-hero">
          <div className="t-hero__text">
            <h1>
              Thuốc OTC – <span>Giá tốt mỗi ngày</span>
            </h1>
            <p>
              Thuốc giảm đau, cảm cúm, tiêu hoá, vitamin... Mua online – nhận
              hàng trong ngày, tư vấn bởi dược sĩ.
            </p>
            <div className="t-hero__stats">
              <span>
                <i className="ri-shield-check-line" /> Chính hãng GPP
              </span>
              <span>
                <i className="ri-truck-line" /> Giao nhanh
              </span>
              <span>
                <i className="ri-24-hours-line" /> Tư vấn 24/7
              </span>
            </div>
          </div>

          {/* Banner thuốc bên phải */}
          <div className="t-hero__art">
            <div className="hero-banner">
              <div className="hero-banner__text">
                <span className="hero-badge">Flash sale OTC</span>
                <h2>Deal thuốc OTC -30%</h2>
                <p>Panadol, Efferalgan, Vitamin C, men tiêu hoá…</p>
                <button className="hero-btn">Xem khuyến mãi</button>
              </div>
              <div className="hero-banner__img" />
            </div>
          </div>
        </section>

        {/* WRAP 2 CỘT */}
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

            <Frame title="Danh mục">
              <div className="chips">
                {(showMoreCategories
                  ? filters.categories
                  : filters.categories.slice(0, 5)
                ).map((c) => (
                  <button
                    key={c}
                    className={"chip" + (c === cat ? " active" : "")}
                    onClick={() => {
                      setCat(c);
                      setDisplayCount(16);
                    }}
                  >
                    {c}
                  </button>
                ))}
              </div>
              {filters.categories.length > 5 && (
                <button
                  className="filter-show-more"
                  onClick={() => setShowMoreCategories(!showMoreCategories)}
                >
                  Xem thêm
                  <i
                    className={`ri-arrow-${
                      showMoreCategories ? "up" : "down"
                    }-s-line`}
                  ></i>
                </button>
              )}
            </Frame>

            <Frame title="Nhãn hàng">
              <div className="chips">
                {(showMoreBrands
                  ? filters.brands
                  : filters.brands.slice(0, 5)
                ).map((b) => (
                  <button
                    key={b}
                    className={"chip" + (b === brand ? " active" : "")}
                    onClick={() => {
                      setBrand(b);
                      setDisplayCount(16);
                    }}
                  >
                    {b}
                  </button>
                ))}
              </div>
              {filters.brands.length > 5 && (
                <button
                  className="filter-show-more"
                  onClick={() => setShowMoreBrands(!showMoreBrands)}
                >
                  Xem thêm
                  <i
                    className={`ri-arrow-${
                      showMoreBrands ? "up" : "down"
                    }-s-line`}
                  ></i>
                </button>
              )}
            </Frame>
          </aside>

          {/* CONTENT */}
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
                  <option value="pho-bien">Phổ biến</option>
                  <option value="gia-tang">Giá: thấp → cao</option>
                  <option value="gia-giam">Giá: cao → thấp</option>
                  <option value="giam-gia">% giảm nhiều</option>
                </select>
              </div>
            </div>

            {loading && (
              <div style={{ textAlign: "center", padding: "2rem" }}>
                Đang tải sản phẩm...
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
                Không tìm thấy sản phẩm nào.
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
                      <span className="t-badge t-badge--tag">{p.tag}</span>
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
                              // Convert thuoc product format to cart format
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
      </main>

      {quick && (
        <QuickViewModal
          data={quick}
          initialTab={quickTab}
          onAdd={(product) => {
            try {
              // Convert thuoc product format to cart format
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
