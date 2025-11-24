// src/pages/SearchResults.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Frame from "../components/Frame";
import QuickViewModal from "../components/QuickViewModal";
import { searchProducts } from "../services/search";
import { addToCart, dispatchCartUpdated } from "../services/products";
import { getProducts, getFilters } from "../services/productApi";
import "../assets/css/search-results.css";
import "../assets/css/thuoc.css";
import "../assets/css/ban-chay.css";

const PAGE_SIZE = 12;

// Filter options
const PRODUCT_TYPES = [
  "Tất cả",
  "Thuốc trị ho cảm",
  "Siro trị ho cảm",
  "Hô hấp, ho, xoang",
  "Thuốc trị hen suyễn",
];

const TARGET_AUDIENCES = [
  "Tất cả",
  "Trẻ em",
  "Người lớn",
  "Người cao tuổi",
  "Người trưởng thành",
];

const INDICATIONS = [
  "Tất cả",
  "Ho khan",
  "Ho có đờm",
  "Ho do dị ứng",
  "Viêm họng",
  "Viêm phế quản",
];

const MEDICINE_TYPES = [
  "Tất cả",
  "Thuốc kê đơn",
  "Thuốc không kê đơn",
  "Thực phẩm chức năng",
];

const COUNTRIES = ["Tất cả", "Việt Nam", "Mỹ", "Pháp", "Đức", "Nhật Bản"];

const BRAND_ORIGINS = ["Tất cả", "Việt Nam", "Mỹ", "Pháp", "Đức", "Nhật Bản"];

const SORT_OPTIONS = [
  { id: "bestselling", label: "Bán chạy" },
  { id: "price-low", label: "Giá thấp" },
  { id: "price-high", label: "Giá cao" },
];

export default function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  const searchType = searchParams.get("type") || "products"; // "products" or "posts"

  const [quick, setQuick] = useState(null);
  const [quickTab, setQuickTab] = useState("tong-quan");
  const [sortBy, setSortBy] = useState("bestselling");
  const [displayMode, setDisplayMode] = useState("grid"); // "grid" or "list"
  const [displayCount, setDisplayCount] = useState(16);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [brands, setBrands] = useState(["Tất cả"]);

  // Filter states
  const [productType, setProductType] = useState("Tất cả");
  const [targetAudience, setTargetAudience] = useState("Tất cả");
  const [targetAudienceSearch, setTargetAudienceSearch] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [indication, setIndication] = useState("Tất cả");
  const [medicineType, setMedicineType] = useState("Tất cả");
  const [country, setCountry] = useState("Tất cả");
  const [brand, setBrand] = useState("Tất cả");
  const [brandOrigin, setBrandOrigin] = useState("Tất cả");
  const [brandSearch, setBrandSearch] = useState("");

  // Collapsible filter states
  const [expandedFilters, setExpandedFilters] = useState({
    productType: true,
    targetAudience: true,
    price: true,
    indication: false,
    medicineType: false,
    country: false,
    brand: false,
    brandOrigin: false,
  });

  // Show more states for long lists
  const [showMore, setShowMore] = useState({
    productType: false,
    targetAudience: false,
    indication: false,
    medicineType: false,
    country: false,
    brand: false,
    brandOrigin: false,
  });

  useEffect(() => {
    dispatchCartUpdated();
  }, []);

  // Load tất cả sản phẩm từ API khi component mount hoặc khi query thay đổi
  useEffect(() => {
    async function loadAllProducts() {
      setLoadingProducts(true);
      try {
        // Load tất cả sản phẩm từ API (limit lớn để lấy hết)
        const result = await getProducts({ limit: 10000 });
        // Xử lý response có thể là object với products hoặc array trực tiếp
        let products = [];
        if (Array.isArray(result)) {
          products = result;
        } else if (result && Array.isArray(result.products)) {
          products = result.products;
        } else if (
          result &&
          result.data &&
          Array.isArray(result.data.products)
        ) {
          products = result.data.products;
        } else if (result && result.data && Array.isArray(result.data)) {
          products = result.data;
        }
        setAllProducts(products);

        // Load brands từ API
        try {
          const filters = await getFilters();
          const uniqueBrands = [
            "Tất cả",
            ...new Set(
              (filters?.brands || [])
                .filter(Boolean)
                .map((b) => (typeof b === "string" ? b : b.name || b))
            ),
          ];
          setBrands(uniqueBrands);
        } catch (filterError) {
          console.error("Error loading filters:", filterError);
          // Fallback: extract brands from products
          const uniqueBrands = [
            "Tất cả",
            ...new Set(products.map((p) => p.brand).filter(Boolean)),
          ];
          setBrands(uniqueBrands);
        }
      } catch (error) {
        console.error("Error loading products from API:", error);
        setAllProducts([]);
        setBrands(["Tất cả"]);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadAllProducts();
  }, []); // Chỉ load một lần khi mount, để tránh load quá nhiều lần

  // State for posts search (async)
  const [searchPostsData, setSearchPostsData] = useState([]);

  // Load posts when query changes (async)
  useEffect(() => {
    if (!query.trim() || searchType !== "posts") {
      setSearchPostsData([]);
      return;
    }

    async function loadPosts() {
      try {
        const { getAllPosts } = await import("../services/posts");
        const result = await getAllPosts({ q: query, limit: 100 });
        const posts = result?.posts || [];

        // Filter posts locally
        const searchQuery = query.trim().toLowerCase();
        const filtered = posts.filter((post) => {
          if (post.title?.toLowerCase().includes(searchQuery)) return true;
          if (post.cat?.toLowerCase().includes(searchQuery)) return true;
          if (post.excerpt?.toLowerCase().includes(searchQuery)) return true;
          if (post.tags && Array.isArray(post.tags)) {
            if (
              post.tags.some((tag) => tag.toLowerCase().includes(searchQuery))
            )
              return true;
          }
          return false;
        });
        setSearchPostsData(filtered);
      } catch (error) {
        console.error("Error loading posts:", error);
        setSearchPostsData([]);
      }
    }

    if (searchType === "posts") {
      loadPosts();
    }
  }, [query, searchType]);

  // Perform search for products - sử dụng dữ liệu từ API
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return { products: [], posts: [], total: 0 };
    }
    try {
      if (searchType === "products") {
        // Tìm kiếm trong allProducts từ API
        const searchQuery = query.trim().toLowerCase();
        const normalizedQuery = searchQuery
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();

        const filtered = allProducts.filter((product) => {
          if (!product) return false;

          const name = (product.name || "").toLowerCase();
          const normalizedName = name
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          const brand = (product.brand || "").toLowerCase();
          const normalizedBrand = brand
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          const cat = (product.cat || "").toLowerCase();
          const normalizedCat = cat
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          const desc = (product.desc || "").toLowerCase();
          const normalizedDesc = desc
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");

          // Check matches
          return (
            normalizedName.includes(normalizedQuery) ||
            normalizedBrand.includes(normalizedQuery) ||
            normalizedCat.includes(normalizedQuery) ||
            normalizedDesc.includes(normalizedQuery) ||
            String(product.id || "").includes(searchQuery)
          );
        });

        return {
          products: filtered,
          posts: [],
          total: filtered.length,
        };
      } else {
        return {
          products: [],
          posts: searchPostsData,
          total: searchPostsData.length,
        };
      }
    } catch (error) {
      console.error("Error in search:", error);
      return { products: [], posts: [], total: 0 };
    }
  }, [query, searchType, searchPostsData, allProducts]);

  // Brands đã được load từ API trong useEffect

  // Filter target audiences by search
  const filteredTargetAudiences = useMemo(() => {
    if (!targetAudienceSearch.trim()) {
      return TARGET_AUDIENCES;
    }
    return TARGET_AUDIENCES.filter((aud) =>
      aud.toLowerCase().includes(targetAudienceSearch.toLowerCase())
    );
  }, [targetAudienceSearch]);

  // Filter and sort results
  const filteredResults = useMemo(() => {
    let products = Array.isArray(searchResults?.products)
      ? searchResults.products
      : [];

    // Apply filters
    if (productType !== "Tất cả") {
      products = products.filter((p) => p.cat === productType);
    }
    if (brand !== "Tất cả") {
      products = products.filter((p) => p.brand === brand);
    }
    if (minPrice) {
      const min = Number(minPrice);
      if (!isNaN(min)) {
        products = products.filter((p) => (p.price || 0) >= min);
      }
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      if (!isNaN(max)) {
        products = products.filter((p) => (p.price || 0) <= max);
      }
    }

    // Sort products
    if (sortBy === "bestselling") {
      products = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
    } else if (sortBy === "price-low") {
      products = [...products].sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "price-high") {
      products = [...products].sort((a, b) => (b.price || 0) - (a.price || 0));
    }

    return {
      products,
      total: products.length,
    };
  }, [searchResults, productType, brand, minPrice, maxPrice, sortBy]);

  const total = filteredResults.total;
  const displayedProducts = filteredResults.products.slice(0, displayCount);
  const hasMore = total > displayCount;

  const handleShowMore = () => {
    setDisplayCount((prev) => Math.min(prev + 16, total));
  };

  const toggleFilter = (filterKey) => {
    setExpandedFilters((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const toggleShowMore = (filterKey) => {
    setShowMore((prev) => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  const resetFilters = () => {
    setProductType("Tất cả");
    setTargetAudience("Tất cả");
    setTargetAudienceSearch("");
    setMinPrice("");
    setMaxPrice("");
    setIndication("Tất cả");
    setMedicineType("Tất cả");
    setCountry("Tất cả");
    setBrand("Tất cả");
    setBrandOrigin("Tất cả");
    setBrandSearch("");
    setDisplayCount(16);
  };

  const handleSearchTypeChange = (type) => {
    setSearchParams({ q: query, type });
    setDisplayCount(16);
  };

  const vnd = (n) => {
    if (!n || isNaN(n)) return "0đ";
    return new Intl.NumberFormat("vi-VN").format(Number(n)) + "đ";
  };

  // Helper to render filter section
  const renderFilterSection = (
    key,
    title,
    options,
    selected,
    onSelect,
    showSearch = false,
    searchValue = "",
    onSearchChange = null
  ) => {
    const isExpanded = expandedFilters[key];
    const itemsToShow = showMore[key] ? options : options.slice(0, 5);
    const hasMore = options.length > 5;

    return (
      <div className="filter-section">
        <button
          className="filter-section__header"
          onClick={() => toggleFilter(key)}
        >
          <span>{title}</span>
          <i className={`ri-arrow-${isExpanded ? "up" : "down"}-s-line`}></i>
        </button>
        {isExpanded && (
          <div className="filter-section__content">
            {showSearch && (
              <div className="filter-search">
                <i className="ri-search-line"></i>
                <input
                  type="text"
                  placeholder="Tìm theo tên"
                  value={searchValue}
                  onChange={(e) => onSearchChange(e.target.value)}
                />
              </div>
            )}
            <div className="filter-checkboxes">
              {itemsToShow.map((option) => (
                <label key={option} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={selected === option}
                    onChange={() => {
                      onSelect(option);
                      setDisplayCount(16);
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
            {hasMore && (
              <button
                className="filter-show-more"
                onClick={() => toggleShowMore(key)}
              >
                Xem thêm
                <i
                  className={`ri-arrow-${showMore[key] ? "up" : "down"}-s-line`}
                ></i>
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <main className="lc shop">
      {/* Search Type Header */}
      <div className="search-type-header">
        <span className="search-type-label">Tìm kiếm theo:</span>
        <div className="search-type-radio">
          <label>
            <input
              type="radio"
              name="searchType"
              value="products"
              checked={searchType === "products"}
              onChange={(e) => handleSearchTypeChange(e.target.value)}
            />
            <span>Sản phẩm</span>
          </label>
          <label>
            <input
              type="radio"
              name="searchType"
              value="posts"
              checked={searchType === "posts"}
              onChange={(e) => handleSearchTypeChange(e.target.value)}
            />
            <span>Bài viết sức khỏe</span>
          </label>
        </div>
      </div>

      {/* Layout: Sidebar + Main */}
      <div className="container shop__wrap">
        {/* Filter Sidebar */}
        <aside className="shop__side">
          <Frame>
            <div className="filter-header">
              <span className="filter-header__title">Bộ lọc</span>
              <button className="filter-header__reset" onClick={resetFilters}>
                Thiết lập lại
              </button>
            </div>
            {searchType === "products" && (
              <>
                <div className="filter-section">
                  <button
                    className="filter-section__header"
                    onClick={() => toggleFilter("price")}
                  >
                    <span>Khoảng giá</span>
                    <i
                      className={`ri-arrow-${
                        expandedFilters.price ? "up" : "down"
                      }-s-line`}
                    ></i>
                  </button>
                  {expandedFilters.price && (
                    <div className="filter-section__content">
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
                              checked={
                                minPrice === "100000" && maxPrice === "300000"
                              }
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
                              checked={
                                minPrice === "300000" && maxPrice === "500000"
                              }
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
                    </div>
                  )}
                </div>

                {renderFilterSection(
                  "productType",
                  "Loại sản phẩm",
                  PRODUCT_TYPES,
                  productType,
                  setProductType
                )}

                {renderFilterSection(
                  "targetAudience",
                  "Đối tượng sử dụng",
                  filteredTargetAudiences,
                  targetAudience,
                  setTargetAudience,
                  true,
                  targetAudienceSearch,
                  setTargetAudienceSearch
                )}

                {renderFilterSection(
                  "indication",
                  "Chỉ định",
                  INDICATIONS,
                  indication,
                  setIndication
                )}

                {renderFilterSection(
                  "medicineType",
                  "Loại thuốc",
                  MEDICINE_TYPES,
                  medicineType,
                  setMedicineType
                )}

                {renderFilterSection(
                  "country",
                  "Nước sản xuất",
                  COUNTRIES,
                  country,
                  setCountry
                )}

                <div className="filter-section">
                  <button
                    className="filter-section__header"
                    onClick={() => toggleFilter("brand")}
                  >
                    <span>Thương hiệu</span>
                    <i
                      className={`ri-arrow-${
                        expandedFilters.brand ? "up" : "down"
                      }-s-line`}
                    ></i>
                  </button>
                  {expandedFilters.brand && (
                    <div className="filter-section__content">
                      <div className="filter-search">
                        <i className="ri-search-line"></i>
                        <input
                          type="text"
                          placeholder="Nhập tên thương hiệu"
                          value={brandSearch || ""}
                          onChange={(e) => setBrandSearch(e.target.value)}
                        />
                      </div>
                      <div className="filter-checkboxes">
                        {(brandSearch
                          ? brands.filter((b) =>
                              b
                                .toLowerCase()
                                .includes(brandSearch.toLowerCase())
                            )
                          : brands.slice(0, 5)
                        ).map((b) => (
                          <label key={b} className="filter-checkbox">
                            <input
                              type="checkbox"
                              checked={brand === b}
                              onChange={() => {
                                setBrand(b);
                                setDisplayCount(16);
                              }}
                            />
                            <span>{b}</span>
                          </label>
                        ))}
                      </div>
                      {brands.length > 5 && (
                        <button
                          className="filter-show-more"
                          onClick={() => toggleShowMore("brand")}
                        >
                          Xem thêm
                          <i
                            className={`ri-arrow-${
                              showMore.brand ? "up" : "down"
                            }-s-line`}
                          ></i>
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {renderFilterSection(
                  "brandOrigin",
                  "Xuất xứ thương hiệu",
                  BRAND_ORIGINS,
                  brandOrigin,
                  setBrandOrigin
                )}
              </>
            )}
          </Frame>
        </aside>

        {/* Main Content */}
        <section className="shop__main">
          {/* Toolbar */}
          <div className="shop__toolbar">
            <div className="muted">{total.toLocaleString()} sản phẩm</div>
            <div className="shop__actions">
              <span className="sort-label">Sắp xếp theo:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setDisplayCount(16);
                }}
              >
                <option value="bestselling">Bán chạy</option>
                <option value="price-low">Giá: thấp → cao</option>
                <option value="price-high">Giá: cao → thấp</option>
              </select>
            </div>
          </div>

          {/* Results */}
          {loadingProducts ? (
            <div className="search-empty">
              <i className="ri-loader-4-line"></i>
              <p>Đang tải dữ liệu từ server...</p>
            </div>
          ) : !query.trim() ? (
            <div className="search-empty">
              <i className="ri-search-line"></i>
              <p>Nhập từ khóa để tìm kiếm</p>
            </div>
          ) : total === 0 ? (
            <div className="search-empty">
              <i className="ri-search-line"></i>
              <p>Không tìm thấy kết quả cho "{query}"</p>
              <span className="muted">
                Thử tìm kiếm với từ khóa khác hoặc kiểm tra chính tả
              </span>
            </div>
          ) : (
            <>
              {/* Product Grid */}
              <div className="t-grid">
                {displayedProducts.map((p) => {
                  if (!p || !p.id) return null;
                  const needsConsultation = p.cat?.includes("kê đơn") || false;
                  return (
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
                          {p.old && !p.oldPrice && <s>{vnd(p.old)}</s>}
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
                          {needsConsultation ? (
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
                          ) : (
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
                                  dispatchCartUpdated();
                                } catch (err) {
                                  // Error đã được xử lý trong addToCart
                                }
                              }}
                            >
                              <i className="ri-shopping-cart-2-line" /> Thêm vào
                              giỏ
                            </button>
                          )}
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
                  );
                })}
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
            </>
          )}
        </section>
      </div>

      {/* Quick View Modal */}
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
              dispatchCartUpdated();
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
