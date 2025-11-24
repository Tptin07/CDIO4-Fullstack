// src/pages/SearchResults.jsx
import React, { useMemo, useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Frame from "../components/Frame";
import QuickViewModal from "../components/QuickViewModal";
import { searchAll } from "../services/search";
import {
  getAllProducts,
  addToCart,
  dispatchCartUpdated,
} from "../services/products";
import "../assets/css/search-results.css";

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

  // Perform search
  const searchResults = useMemo(() => {
    if (!query.trim()) {
      return { products: [], posts: [], total: 0 };
    }
    return searchAll(query);
  }, [query]);

  // Get unique brands from all products
  const brands = useMemo(() => {
    const allProducts = getAllProducts();
    const uniqueBrands = [
      "Tất cả",
      ...new Set(allProducts.map((p) => p.brand).filter(Boolean)),
    ];
    return uniqueBrands;
  }, []);

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
    let products = searchResults.products;

    // Apply filters
    if (productType !== "Tất cả") {
      products = products.filter((p) => p.cat === productType);
    }
    if (brand !== "Tất cả") {
      products = products.filter((p) => p.brand === brand);
    }
    if (minPrice) {
      const min = Number(minPrice);
      products = products.filter((p) => p.price >= min);
    }
    if (maxPrice) {
      const max = Number(maxPrice);
      products = products.filter((p) => p.price <= max);
    }

    // Sort products
    if (sortBy === "bestselling") {
      products = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
    } else if (sortBy === "price-low") {
      products = [...products].sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      products = [...products].sort((a, b) => b.price - a.price);
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

  const fmt = (n) => n.toLocaleString("vi-VN") + "₫";
  const getUnit = (product) => {
    // Determine unit based on product name or category
    if (
      product.name?.toLowerCase().includes("siro") ||
      product.name?.toLowerCase().includes("dung dịch")
    ) {
      return "Chai";
    }
    if (
      product.name?.toLowerCase().includes("viên") ||
      product.name?.toLowerCase().includes("vỉ")
    ) {
      return "Hộp";
    }
    return "Hộp";
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
    <main className="search-results-page">
      <div className="container">
        <div className="search-results-wrap">
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
          <div className="search-results-layout">
            {/* Filter Sidebar */}
            <aside className="search-filters">
              <Frame>
                <div className="filter-header">
                  <span className="filter-header__title">Bộ lọc</span>
                  <button
                    className="filter-header__reset"
                    onClick={resetFilters}
                  >
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
                              onClick={() => setPage(1)}
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
                                    minPrice === "100000" &&
                                    maxPrice === "300000"
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
                                    minPrice === "300000" &&
                                    maxPrice === "500000"
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
            <div className="search-results-main">
              {/* Note and Toolbar */}
              <div className="search-results-header">
                <p className="search-note">
                  Lưu ý: Thuốc kê đơn và một số sản phẩm sẽ cần tư vấn từ dược
                  sĩ
                </p>
                <div className="search-toolbar">
                  <div className="search-sort">
                    <span className="sort-label">Sắp xếp theo:</span>
                    <div className="sort-buttons">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          key={option.id}
                          className={`sort-btn ${
                            sortBy === option.id ? "active" : ""
                          }`}
                          onClick={() => {
                            setSortBy(option.id);
                            setDisplayCount(16);
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="display-mode">
                    <button
                      className={`display-btn ${
                        displayMode === "grid" ? "active" : ""
                      }`}
                      onClick={() => setDisplayMode("grid")}
                      title="Lưới"
                    >
                      <i className="ri-grid-line"></i>
                    </button>
                    <button
                      className={`display-btn ${
                        displayMode === "list" ? "active" : ""
                      }`}
                      onClick={() => setDisplayMode("list")}
                      title="Danh sách"
                    >
                      <i className="ri-list-check"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* Results */}
              {!query.trim() ? (
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
                  <div
                    className={`search-results-grid ${
                      displayMode === "list" ? "list-mode" : ""
                    }`}
                  >
                    {displayedProducts.map((p) => {
                      const unit = getUnit(p);
                      const needsConsultation =
                        p.cat?.includes("kê đơn") || false;
                      return (
                        <div
                          key={`product-${p.id}`}
                          className="search-result-card search-result-card--product"
                        >
                          <Link
                            to={`/san-pham/${p.id}`}
                            className="search-result-card__link"
                          >
                            <div className="search-result-card__media">
                              <img
                                src={p.cover || p.img}
                                alt={p.name}
                                loading="lazy"
                              />
                              {p.sale && (
                                <span className="search-result-card__badge">
                                  {p.sale}
                                </span>
                              )}
                            </div>
                            <div className="search-result-card__body">
                              <h3 className="search-result-card__title">
                                {p.name}
                              </h3>
                              <div className="search-result-card__price">
                                <span className="current">
                                  {fmt(p.price)} / {unit}
                                </span>
                                {p.old && (
                                  <span className="old">{fmt(p.old)}</span>
                                )}
                              </div>
                              <div className="search-result-card__unit">
                                {unit}
                                {p.name?.includes("x") && (
                                  <span className="unit-detail">
                                    {" "}
                                    {p.name.match(
                                      /x\s*\d+[ml|viên|vỉ]*/i
                                    )?.[0] || ""}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                          <div className="search-result-card__actions">
                            {needsConsultation ? (
                              <Link
                                to={`/san-pham/${p.id}`}
                                className="btn btn--ghost btn--light"
                              >
                                Xem chi tiết
                              </Link>
                            ) : (
                              <button
                                className="btn btn--primary"
                                onClick={() => {
                                  addToCart(p.id, 1);
                                  dispatchCartUpdated();
                                }}
                              >
                                Chọn mua
                              </button>
                            )}
                            {needsConsultation && (
                              <span className="consultation-note">
                                Cần tư vấn từ dược sĩ
                              </span>
                            )}
                          </div>
                        </div>
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
            </div>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      {quick && (
        <QuickViewModal
          product={quick}
          activeTab={quickTab}
          onTabChange={setQuickTab}
          onClose={() => setQuick(null)}
        />
      )}
    </main>
  );
}
