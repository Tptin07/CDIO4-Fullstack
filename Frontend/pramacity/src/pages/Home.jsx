// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../assets/css/home.css";
import "../assets/css/thuoc.css";
import { useAuth } from "../utils/AuthContext";
import { getAllPosts } from "../services/posts";
import { addToCart } from "../services/products";
import {
  getFeaturedProducts,
  getNewProducts,
  getCategoriesForHome,
  getProducts,
} from "../services/productApi";
import QuickViewModal from "../components/QuickViewModal";

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

export default function Home() {
  const { user } = useAuth();
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newProducts, setNewProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [quick, setQuick] = useState(null);
  const [quickTab, setQuickTab] = useState("tong-quan");
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    async function loadPosts() {
      try {
        const result = await getAllPosts({ sort: "popular", limit: 6 });
        setFeaturedPosts(result.posts || []);
      } catch (error) {
        console.error("Error loading posts:", error);
        setFeaturedPosts([]);
      }
    }
    loadPosts();
  }, []);

  // Load products from API
  useEffect(() => {
    async function loadProducts() {
      setLoadingProducts(true);
      try {
        const [featured, newProds] = await Promise.all([
          getFeaturedProducts(8).catch(() => []),
          getNewProducts(8).catch(() => []),
        ]);
        setFeaturedProducts(featured || []);
        setNewProducts(newProds || []);
      } catch (error) {
        console.error("Error loading products:", error);
        setFeaturedProducts([]);
        setNewProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  // Load flash sale products
  useEffect(() => {
    async function loadFlashSale() {
      try {
        const data = await getProducts({
          sort: "giam-gia",
          limit: 4,
        });
        if (data && Array.isArray(data.products)) {
          setFlashSaleProducts(data.products.slice(0, 4));
        }
      } catch (error) {
        console.error("Error loading flash sale products:", error);
        setFlashSaleProducts([]);
      }
    }
    loadFlashSale();
  }, []);

  // Banner carousel auto-rotate
  useEffect(() => {
    const bannerImages = [
      "/Banner/thuoc_nho_mat.jpg",
      "/Banner/siro-ho.png",
      "/Banner/durex.jpg",
      "/Banner/duoc_my_pham.jpg",
    ];

    if (bannerImages.length > 1) {
      const interval = setInterval(() => {
        setCurrentBannerIndex((prev) => (prev + 1) % bannerImages.length);
      }, 4000); // Change every 4 seconds

      return () => clearInterval(interval);
    }
  }, []);

  // Load categories from API
  useEffect(() => {
    async function loadCategories() {
      setLoadingCategories(true);
      try {
        const categoriesData = await getCategoriesForHome();
        const mappedCategories = categoriesData.map((cat) => {
          const mapping = getCategoryMapping(cat.name);
          return {
            id: cat.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            icon: mapping.icon,
            color: mapping.color,
            link: `/thuoc?cat=${encodeURIComponent(cat.name)}`,
            subcategories: mapping.subcategories || [],
          };
        });
        setCategories(mappedCategories);
      } catch (error) {
        console.error("Error loading categories:", error);
        setCategories(getDefaultCategories());
      } finally {
        setLoadingCategories(false);
      }
    }
    loadCategories();
  }, []);

  // Mapping function để gán icon và color cho categories từ database
  function getCategoryMapping(categoryName) {
    const nameLower = categoryName.toLowerCase();
    const mappings = {
      "thực phẩm chức năng": {
        icon: "ri-medicine-bottle-line",
        color: "#10b981",
        subcategories: [
          "Vitamin & Khoáng chất",
          "Sinh lý - Nội tiết tố",
          "Hỗ trợ tiêu hóa",
        ],
      },
      "dược mỹ phẩm": {
        icon: "ri-cream-line",
        color: "#8b5cf6",
        subcategories: ["Chăm sóc da mặt", "Chăm sóc cơ thể", "Chăm sóc tóc"],
      },
      "chăm sóc da": {
        icon: "ri-cream-line",
        color: "#8b5cf6",
        subcategories: ["Chăm sóc da mặt", "Chăm sóc cơ thể", "Kem dưỡng"],
      },
      thuốc: {
        icon: "ri-capsule-line",
        color: "#3b82f6",
        subcategories: ["Thuốc kê đơn", "Thuốc không kê đơn", "Tra cứu thuốc"],
      },
      "thuốc kê đơn": {
        icon: "ri-capsule-line",
        color: "#3b82f6",
        subcategories: ["Thuốc kê đơn", "Theo chỉ định bác sĩ"],
      },
      "thuốc không kê đơn": {
        icon: "ri-capsule-line",
        color: "#3b82f6",
        subcategories: ["Thuốc không kê đơn", "Mua tự do"],
      },
      "chăm sóc cá nhân": {
        icon: "ri-user-heart-line",
        color: "#f59e0b",
        subcategories: [
          "Vệ sinh cá nhân",
          "Chăm sóc răng miệng",
          "Chăm sóc tóc",
        ],
      },
      "thiết bị y tế": {
        icon: "ri-hospital-line",
        color: "#ef4444",
        subcategories: ["Thiết bị đo", "Thiết bị hỗ trợ", "Dụng cụ y tế"],
      },
      "khẩu trang": {
        icon: "ri-mask-line",
        color: "#06b6d4",
        subcategories: ["Khẩu trang y tế", "Khẩu trang vải", "Khẩu trang N95"],
      },
    };

    for (const [key, value] of Object.entries(mappings)) {
      if (nameLower.includes(key) || key.includes(nameLower)) {
        return value;
      }
    }

    return {
      icon: "ri-medicine-bottle-line",
      color: "#6b7280",
      subcategories: ["Sản phẩm đa dạng", "Chất lượng cao"],
    };
  }

  // Default categories fallback
  function getDefaultCategories() {
    return [
      {
        id: 1,
        name: "Thực phẩm chức năng",
        slug: "thuc-pham-chuc-nang",
        icon: "ri-medicine-bottle-line",
        link: "/thuoc",
        color: "#10b981",
        subcategories: [
          "Vitamin & Khoáng chất",
          "Sinh lý - Nội tiết tố",
          "Hỗ trợ tiêu hóa",
        ],
      },
      {
        id: 2,
        name: "Dược mỹ phẩm",
        slug: "duoc-my-pham",
        icon: "ri-cream-line",
        link: "/thuoc",
        color: "#8b5cf6",
        subcategories: ["Chăm sóc da mặt", "Chăm sóc cơ thể", "Chăm sóc tóc"],
      },
      {
        id: 3,
        name: "Thuốc",
        slug: "thuoc",
        icon: "ri-capsule-line",
        link: "/thuoc",
        color: "#3b82f6",
        subcategories: ["Thuốc kê đơn", "Thuốc không kê đơn", "Tra cứu thuốc"],
      },
      {
        id: 4,
        name: "Chăm sóc cá nhân",
        slug: "cham-soc-ca-nhan",
        icon: "ri-user-heart-line",
        link: "/thuoc",
        color: "#f59e0b",
        subcategories: [
          "Vệ sinh cá nhân",
          "Chăm sóc răng miệng",
          "Chăm sóc tóc",
        ],
      },
      {
        id: 5,
        name: "Thiết bị y tế",
        slug: "thiet-bi-y-te",
        icon: "ri-hospital-line",
        link: "/thuoc",
        color: "#ef4444",
        subcategories: ["Thiết bị đo", "Thiết bị hỗ trợ", "Dụng cụ y tế"],
      },
    ];
  }

  const stats = [
    { number: "10,000+", label: "Sản phẩm đa dạng", icon: "ri-box-3-line" },
    { number: "50,000+", label: "Khách hàng tin dùng", icon: "ri-user-line" },
    { number: "99%", label: "Độ hài lòng", icon: "ri-star-line" },
    {
      number: "24/7",
      label: "Hỗ trợ tư vấn",
      icon: "ri-customer-service-2-line",
    },
  ];

  const features = [
    {
      icon: "ri-truck-line",
      title: "Giao hàng nhanh",
      description: "Giao trong 2 giờ nội thành, miễn phí ship đơn trên 300k",
    },
    {
      icon: "ri-shield-check-line",
      title: "Hàng chính hãng",
      description: "100% sản phẩm chính hãng, có giấy phép lưu hành",
    },
    {
      icon: "ri-price-tag-3-line",
      title: "Giá tốt nhất",
      description:
        "Cam kết giá rẻ nhất thị trường, hoàn tiền nếu tìm thấy rẻ hơn",
    },
    {
      icon: "ri-customer-service-2-line",
      title: "Tư vấn 24/7",
      description: "Đội ngũ dược sĩ tư vấn chuyên nghiệp, hỗ trợ mọi lúc",
    },
  ];

  const handleAddToCart = (product) => {
    if (!user) {
      document.dispatchEvent(new CustomEvent("OPEN_AUTH"));
      return;
    }
    try {
      const cartProduct = {
        id: product.id,
        name: product.name,
        price: product.price,
        img: product.cover || product.img,
      };
      addToCart(cartProduct, 1);
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const handleQuickView = (product) => {
    const discountPercent =
      product.old && product.price
        ? Math.round(((product.old - product.price) / product.old) * 100)
        : 0;

    const quickViewData = {
      ...product,
      discount: discountPercent,
      tag: product.cat || "Sản phẩm",
      img: product.cover || product.img,
      cover: product.cover || product.img,
      oldPrice: product.old || product.oldPrice,
      price: product.price,
      name: product.name,
      rating: product.rating || 4.5,
      sold: product.sold || 0,
      brand: product.brand,
      form: product.form,
      desc: product.desc,
    };
    setQuickTab("tong-quan");
    setQuick(quickViewData);
  };

  return (
    <main className="home-page">
      {/* HERO SECTION - Landing Page */}
      <section className="hero-landing">
        <div className="hero-landing-background">
          <div className="hero-landing-overlay"></div>
          <div className="hero-landing-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-landing-content">
            {/* Left Side - Text Content */}
            <div className="hero-landing-text">
              {/* Highlight Badges */}
              <div className="hero-highlight-tags">
                <span className="highlight-tag highlight-tag--new">
                  <i className="ri-sparkling-line"></i>
                  Nền tảng y tế số #1
                </span>
                <span className="highlight-tag highlight-tag--trust">
                  <i className="ri-shield-check-line"></i>
                  Đã được 50K+ khách hàng tin dùng
                </span>
              </div>

              <h1 className="hero-landing-title">
                Chăm sóc sức khỏe
                <span className="hero-landing-title-highlight"> toàn diện</span>
                <br />
                cho cả gia đình bạn
              </h1>

              <p className="hero-landing-description">
                Hiệu thuốc Việt - Nơi cung cấp{" "}
                <strong>thuốc, thực phẩm chức năng và thiết bị y tế </strong>
                chính hãng với giá tốt nhất. Đội ngũ dược sĩ chuyên nghiệp tư
                vấn miễn phí 24/7.
              </p>

              {/* Key Benefits */}
              <div className="hero-landing-benefits">
                <div className="hero-benefit-item">
                  <i className="ri-truck-line"></i>
                  <span>Giao hàng 2h nội thành</span>
                </div>
                <div className="hero-benefit-item">
                  <i className="ri-shield-check-line"></i>
                  <span>100% chính hãng</span>
                </div>
                <div className="hero-benefit-item">
                  <i className="ri-price-tag-3-line"></i>
                  <span>Giá tốt nhất thị trường</span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="hero-landing-actions">
                <Link
                  to="/thuoc"
                  className="btn-hero-landing btn-hero-landing--primary"
                >
                  <i className="ri-shopping-cart-2-line"></i>
                  <span>Mua sắm ngay</span>
                  <i className="ri-arrow-right-line"></i>
                </Link>
                <Link
                  to="/bai-viet"
                  className="btn-hero-landing btn-hero-landing--secondary"
                >
                  <i className="ri-book-open-line"></i>
                  <span>Tư vấn sức khỏe</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="hero-landing-trust">
                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  <span>Đã được cấp phép</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  <span>Thanh toán an toàn</span>
                </div>
                <div className="trust-item">
                  <span className="trust-icon">✓</span>
                  <span>Đổi trả dễ dàng</span>
                </div>
              </div>
            </div>

            {/* Right Side - Flash Sale & Banner Carousel */}
            <div className="hero-landing-right">
              {/* Flash Sale Section */}
              <div className="hero-flashsale">
                <div className="hero-flashsale-header">
                  <div className="flashsale-header-left">
                    <span className="flashsale-badge">
                      <i className="ri-flashlight-line"></i>
                      Flash Sale
                    </span>
                    <span className="flashsale-timer">
                      <i className="ri-time-line"></i>
                      Kết thúc trong 23:59:59
                    </span>
                  </div>
                </div>
                <div className="hero-flashsale-tags">
                  <span className="flashsale-tag flashsale-tag--hot">
                    🔥 Hot
                  </span>
                  <span className="flashsale-tag flashsale-tag--discount">
                    Giảm sốc
                  </span>
                  <span className="flashsale-tag flashsale-tag--limited">
                    Số lượng có hạn
                  </span>
                </div>
                <div className="hero-flashsale-products-grid">
                  {flashSaleProducts.length > 0
                    ? flashSaleProducts.map((product, idx) => (
                        <Link
                          key={product.id || idx}
                          to={`/san-pham/${product.id}`}
                          className="hero-flashsale-item-square"
                          title={product.name || "Sản phẩm"}
                        >
                          <div className="hero-flashsale-image-square">
                            <img
                              src={
                                product.cover || product.img || "/img/vitc.png"
                              }
                              alt={product.name || "Sản phẩm"}
                              onError={(e) => {
                                e.currentTarget.src = "/img/vitc.png";
                              }}
                            />
                            {product.discount > 0 && (
                              <span className="flashsale-discount-badge-square">
                                -{product.discount}%
                              </span>
                            )}
                          </div>
                        </Link>
                      ))
                    : // Fallback với placeholder
                      Array.from({ length: 4 }).map((_, idx) => (
                        <div
                          key={idx}
                          className="hero-flashsale-item-square hero-flashsale-item-placeholder"
                        >
                          <div className="hero-flashsale-image-square">
                            <div className="loading-skeleton"></div>
                          </div>
                        </div>
                      ))}
                </div>
              </div>

              {/* Banner Carousel */}
              <div className="hero-banner-carousel">
                <div className="banner-carousel-wrapper">
                  {[
                    "/Banner/thuoc_nho_mat.jpg",
                    "/Banner/siro-ho.png",
                    "/Banner/durex.jpg",
                    "/Banner/duoc_my_pham.jpg",
                  ].map((banner, idx) => (
                    <Link
                      key={idx}
                      to="/khuyen-mai"
                      className={`banner-carousel-item ${
                        idx === currentBannerIndex ? "active" : ""
                      }`}
                      style={{
                        backgroundImage: `url(${banner})`,
                      }}
                    >
                      <img
                        src={banner}
                        alt={`Banner ${idx + 1}`}
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </Link>
                  ))}
                </div>
                <div className="banner-carousel-dots">
                  {[
                    "/Banner/thuoc_nho_mat.jpg",
                    "/Banner/siro-ho.png",
                    "/Banner/durex.jpg",
                    "/Banner/duoc_my_pham.jpg",
                  ].map((_, idx) => (
                    <button
                      key={idx}
                      className={`banner-dot ${
                        idx === currentBannerIndex ? "active" : ""
                      }`}
                      onClick={() => setCurrentBannerIndex(idx)}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="hero-scroll-indicator">
          <span>Cuộn xuống</span>
          <i className="ri-arrow-down-line"></i>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="container">
          <div className="section-tag-header">
            <span className="section-tag">
              <i className="ri-bar-chart-box-line"></i>
              Thống kê ấn tượng
            </span>
          </div>
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-icon">
                  <i className={stat.icon}></i>
                </div>
                <div className="stat-content">
                  <div className="stat-number">{stat.number}</div>
                  <div className="stat-label">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="categories-section-modern">
        <div className="container">
          <div className="section-header-modern">
            <div>
              <span className="section-tag section-tag--categories">
                <i className="ri-grid-line"></i>
                Danh mục đa dạng
              </span>
              <h2 className="section-title-modern">Danh mục sản phẩm</h2>
              <p className="section-subtitle-modern">
                Khám phá đầy đủ các danh mục sản phẩm chăm sóc sức khỏe chất
                lượng cao
              </p>
            </div>
            <Link to="/thuoc" className="section-link-modern">
              Xem tất cả <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          {loadingCategories ? (
            <div className="loading-state">
              <p>Đang tải danh mục...</p>
            </div>
          ) : (
            <div className="categories-grid-modern">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <Link
                    key={category.id}
                    to={category.link}
                    className="category-card-modern"
                    style={{ "--category-color": category.color }}
                  >
                    <div
                      className="category-icon-modern"
                      style={{ background: category.color }}
                    >
                      <i className={category.icon}></i>
                    </div>
                    <div className="category-info">
                      <h3>{category.name}</h3>
                      {category.subcategories &&
                        category.subcategories.length > 0 && (
                          <ul className="category-subs">
                            {category.subcategories
                              .slice(0, 3)
                              .map((sub, i) => (
                                <li key={i}>{sub}</li>
                              ))}
                          </ul>
                        )}
                      <span className="category-link-modern">
                        Xem thêm <i className="ri-arrow-right-line"></i>
                      </span>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="empty-state">
                  <p>Chưa có danh mục nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features-section">
        <div className="container">
          <div className="section-header-modern">
            <div>
              <h2 className="section-title-modern">
                Tại sao chọn Hiệu thuốc Việt?
              </h2>
              <p className="section-subtitle-modern">
                Cam kết mang đến dịch vụ tốt nhất cho khách hàng
              </p>
            </div>
          </div>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  <i className={feature.icon}></i>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS SECTION */}
      <section className="products-section-modern">
        <div className="container">
          <div className="section-header-modern">
            <div>
              <span className="section-tag section-tag--hot">
                <i className="ri-fire-line"></i>
                Đang bán chạy
              </span>
              <h2 className="section-title-modern">Sản phẩm nổi bật</h2>
              <p className="section-subtitle-modern">
                Ưu đãi đặc biệt - Giảm giá lên đến 50% cho sản phẩm hot nhất
                tuần
              </p>
            </div>
            <Link to="/khuyen-mai" className="section-link-modern">
              Xem tất cả <i className="ri-arrow-right-line"></i>
            </Link>
          </div>

          {loadingProducts ? (
            <div className="loading-state">
              <p>Đang tải sản phẩm...</p>
            </div>
          ) : (
            <div className="t-grid">
              {featuredProducts.length > 0 ? (
                featuredProducts.slice(0, 4).map((product) => (
                  <article key={product.id} className="t-card">
                    <div className="t-thumb">
                      <img
                        src={
                          product.cover || product.img || "/img/placeholder.jpg"
                        }
                        alt={product.name || "Sản phẩm"}
                        onError={(e) => {
                          e.currentTarget.src = "/img/placeholder.jpg";
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      {product.discount > 0 && (
                        <span className="t-badge t-badge--sale">
                          -{product.discount}%
                        </span>
                      )}
                      {product.tag && (
                        <span className="t-badge t-badge--tag">
                          {product.tag}
                        </span>
                      )}
                    </div>

                    <div className="t-body">
                      <h3 className="t-title" title={product.name}>
                        <Link
                          to={`/san-pham/${product.id}`}
                          style={{
                            color: "inherit",
                            textDecoration: "none",
                            cursor: "pointer",
                          }}
                        >
                          {product.name || "Sản phẩm"}
                        </Link>
                      </h3>

                      <div className="t-price">
                        <b>{vnd(product.price || 0)}</b>
                        {product.oldPrice && <s>{vnd(product.oldPrice)}</s>}
                      </div>

                      <div className="t-meta">
                        <span className="rate">
                          <i className="ri-star-fill" />{" "}
                          {(product.rating || 0).toFixed(1)}
                        </span>
                        <span className="sold">
                          Đã bán {(product.sold || 0).toLocaleString("vi-VN")}
                        </span>
                      </div>

                      <div className="t-hot">
                        <span
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round(((product.sold || 0) / 5000) * 100)
                            )}%`,
                          }}
                        />
                      </div>

                      <div className="t-actions">
                        <button
                          className="btn btn--buy"
                          onClick={() => handleAddToCart(product)}
                        >
                          <i className="ri-shopping-cart-2-line" /> Thêm vào giỏ
                        </button>
                        <button
                          className="btn btn--ghost"
                          onClick={() => handleQuickView(product)}
                        >
                          <i className="ri-eye-line" /> Xem nhanh
                        </button>
                        <Link
                          className="btn btn--ghost"
                          to={`/san-pham/${product.id}`}
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
                ))
              ) : (
                <div className="empty-state" style={{ gridColumn: "1 / -1" }}>
                  <p>Chưa có sản phẩm nào</p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* BLOG SECTION */}
      <section className="blog-section-modern">
        <div className="container">
          <div className="section-header-modern">
            <div>
              <span className="section-tag section-tag--blog">
                <i className="ri-book-open-line"></i>
                Kiến thức y tế
              </span>
              <h2 className="section-title-modern">Góc sức khỏe</h2>
              <p className="section-subtitle-modern">
                Cập nhật tin tức y tế mới nhất và mẹo sống khỏe từ đội ngũ
                chuyên gia
              </p>
            </div>
            <Link to="/bai-viet" className="section-link-modern">
              Xem tất cả <i className="ri-arrow-right-line"></i>
            </Link>
          </div>
          <div className="blog-grid-modern">
            {featuredPosts.length > 0 ? (
              featuredPosts.slice(0, 4).map((post) => (
                <article key={post.id} className="blog-card-modern">
                  <div className="blog-image-modern">
                    <img
                      src={post.cover || "/img/placeholder.jpg"}
                      alt={post.title || "Bài viết"}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = "/img/placeholder.jpg";
                      }}
                    />
                    {post.cat && (
                      <span
                        className={`blog-badge-modern blog-badge--${
                          post.cat === "Dinh dưỡng"
                            ? "green"
                            : post.cat === "Bệnh lý"
                            ? "red"
                            : post.cat === "Thuốc"
                            ? "blue"
                            : post.cat === "Mẹo sống khỏe"
                            ? "purple"
                            : "gray"
                        }`}
                      >
                        {post.cat}
                      </span>
                    )}
                  </div>
                  <div className="blog-content-modern">
                    <h3 className="blog-title-modern">
                      <Link to={`/bai-viet/${post.id}`}>
                        {post.title || "Bài viết"}
                      </Link>
                    </h3>
                    <p className="blog-excerpt-modern">{post.excerpt || ""}</p>
                    <div className="blog-meta-modern">
                      {post.date && (
                        <span className="blog-date">
                          <i className="ri-calendar-line"></i>
                          {new Date(post.date).toLocaleDateString("vi-VN")}
                        </span>
                      )}
                      {post.readMin && (
                        <span className="blog-read">
                          <i className="ri-time-line"></i>
                          {post.readMin} phút đọc
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <div className="empty-state">
                <p>Chưa có bài viết nào</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="cta-section-modern">
        <div className="container">
          <div className="cta-content-modern">
            <h2>Sẵn sàng bắt đầu mua sắm?</h2>
            <p>
              Khám phá hàng ngàn sản phẩm chăm sóc sức khỏe với giá tốt nhất và
              dịch vụ chuyên nghiệp
            </p>
            <div className="cta-actions">
              <Link to="/thuoc" className="btn-cta-primary">
                Xem tất cả sản phẩm
                <i className="ri-arrow-right-line"></i>
              </Link>
              <Link to="/bai-viet" className="btn-cta-secondary">
                Đọc bài viết sức khỏe
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {quick && (
        <QuickViewModal
          data={quick}
          initialTab={quickTab}
          onAdd={(product) => {
            if (!user) {
              document.dispatchEvent(new CustomEvent("OPEN_AUTH"));
              setQuick(null);
              return;
            }
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
              console.error("Error adding to cart:", err);
            }
          }}
          onClose={() => setQuick(null)}
        />
      )}
    </main>
  );
}
