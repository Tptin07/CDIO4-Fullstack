// src/pages/Home.jsx
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import "../assets/css/home.css";
import "../assets/css/thuoc.css";
import { useAuth } from "../utils/AuthContext";
import { getAllPosts } from "../services/posts";
import { addToCart } from "../services/products";
import { getFeaturedProducts, getNewProducts, getCategoriesForHome } from "../services/productApi";
import QuickViewModal from "../components/QuickViewModal";

const vnd = (n) => {
  if (n === null || n === undefined || isNaN(n)) {
    return "0đ";
  }
  return Number(n).toLocaleString("vi-VN") + "đ";
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

  useEffect(() => {
    async function loadPosts() {
      try {
        const result = await getAllPosts({ sort: 'popular', limit: 6 });
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
        subcategories: ["Vitamin & Khoáng chất", "Sinh lý - Nội tiết tố", "Hỗ trợ tiêu hóa"],
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
      "thuốc": {
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
        subcategories: ["Vệ sinh cá nhân", "Chăm sóc răng miệng", "Chăm sóc tóc"],
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
        subcategories: ["Vitamin & Khoáng chất", "Sinh lý - Nội tiết tố", "Hỗ trợ tiêu hóa"],
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
        subcategories: ["Vệ sinh cá nhân", "Chăm sóc răng miệng", "Chăm sóc tóc"],
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
    { number: "24/7", label: "Hỗ trợ tư vấn", icon: "ri-customer-service-2-line" },
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
      description: "Cam kết giá rẻ nhất thị trường, hoàn tiền nếu tìm thấy rẻ hơn",
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
      {/* HERO SECTION */}
      <section className="hero-section-modern">
        <div className="hero-background">
          <div className="hero-gradient"></div>
          <div className="hero-pattern"></div>
        </div>
        <div className="container">
          <div className="hero-content-modern">
            <div className="hero-text-modern">
              <div className="hero-badge">
                <i className="ri-medicine-bottle-line"></i>
                <span>Nền tảng y tế số hàng đầu</span>
              </div>
              <h1 className="hero-title-modern">
                Chăm sóc sức khỏe
                <br />
                <span className="gradient-text">toàn diện cho gia đình</span>
              </h1>
              <p className="hero-description">
                Hiệu thuốc Việt cung cấp đầy đủ thuốc, thực phẩm chức năng và thiết bị y tế
                với chất lượng cao, giá tốt nhất thị trường. Đội ngũ dược sĩ chuyên nghiệp
                tư vấn 24/7.
              </p>
              <div className="hero-actions">
                <Link to="/thuoc" className="btn-hero-primary">
                  <i className="ri-shopping-cart-line"></i>
                  Mua sắm ngay
                </Link>
                <Link to="/bai-viet" className="btn-hero-secondary">
                  <i className="ri-book-open-line"></i>
                  Tìm hiểu thêm
                </Link>
              </div>
            </div>
            <div className="hero-visual">
              <div className="hero-stats-preview">
                {stats.slice(0, 3).map((stat, idx) => (
                  <div key={idx} className="stat-preview-card">
                    <i className={stat.icon}></i>
                    <div>
                      <div className="stat-number">{stat.number}</div>
                      <div className="stat-label">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS SECTION */}
      <section className="stats-section">
        <div className="container">
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
              <h2 className="section-title-modern">Danh mục sản phẩm</h2>
              <p className="section-subtitle-modern">
                Khám phá đầy đủ các danh mục sản phẩm chăm sóc sức khỏe
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
                    <div className="category-icon-modern" style={{ background: category.color }}>
                      <i className={category.icon}></i>
                    </div>
                    <div className="category-info">
                      <h3>{category.name}</h3>
                      {category.subcategories && category.subcategories.length > 0 && (
                        <ul className="category-subs">
                          {category.subcategories.slice(0, 3).map((sub, i) => (
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
              <h2 className="section-title-modern">Tại sao chọn Hiệu thuốc Việt?</h2>
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
              <h2 className="section-title-modern">🔥 Sản phẩm nổi bật</h2>
              <p className="section-subtitle-modern">Ưu đãi đặc biệt trong tuần</p>
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
                        src={product.cover || product.img || "/img/placeholder.jpg"}
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
                        <span className="t-badge t-badge--tag">{product.tag}</span>
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
              <h2 className="section-title-modern">📰 Góc sức khỏe</h2>
              <p className="section-subtitle-modern">
                Kiến thức y tế và mẹo sống khỏe từ chuyên gia
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
              Khám phá hàng ngàn sản phẩm chăm sóc sức khỏe với giá tốt nhất
              và dịch vụ chuyên nghiệp
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
