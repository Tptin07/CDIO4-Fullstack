// src/components/Header.jsx
import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

import { useAuth } from "../utils/AuthContext";
import AuthModal from "./AuthModal";
import CartSidebar from "./CartSidebar";
import { getSaleProducts, getProducts } from "../services/productApi";
import {
  searchProductsInArray,
  getSearchSuggestionsFromArray,
} from "../services/search";
import { dispatchCartUpdated } from "../services/products";

// ============================================
// CONSTANTS
// ============================================
const CART_KEY = "demo_cart";
// URL banner cho giao diện tìm kiếm mở rộng (có thể thay đổi)
const SEARCH_BANNER_IMAGE_URL = ""; // Thêm URL hình ảnh banner tại đây

// ============================================
// COMPONENT
// ============================================
export default function Header() {
  // ============================================
  // HOOKS & CONTEXT
  // ============================================
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // ============================================
  // STATE
  // ============================================
  const [searchQuery, setSearchQuery] = useState("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartQty, setCartQty] = useState(0);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [hotProducts, setHotProducts] = useState([]);
  const [loadingHotProducts, setLoadingHotProducts] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allProducts, setAllProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // ============================================
  // REFS
  // ============================================
  const userMenuRef = useRef(null);
  const searchRef = useRef(null);
  const searchExpandedRef = useRef(null);
  const hasLoadedHotProducts = useRef(false);
  const searchTimeoutRef = useRef(null);

  // ============================================
  // CART FUNCTIONS
  // ============================================
  /**
   * Đọc dữ liệu giỏ hàng từ localStorage
   */
  function readCart() {
    try {
      return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Đồng bộ số lượng sản phẩm trong giỏ hàng
   */
  function syncCartQty() {
    // Nếu có count được lưu riêng (ví dụ khi lấy từ server), ưu tiên dùng nó
    try {
      const storedCount = localStorage.getItem(CART_KEY + "_count");
      if (storedCount !== null) {
        const n = parseInt(storedCount, 10);
        if (!isNaN(n)) {
          setCartQty(n);
          return;
        }
      }
    } catch (e) {
      // ignore localStorage errors
    }

    const cart = readCart();
    const totalQty = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
    setCartQty(totalQty);
  }

  // ============================================
  // EFFECTS
  // ============================================
  /**
   * Quản lý số lượng giỏ hàng:
   * - Đọc số lượng ban đầu
   * - Lắng nghe sự kiện cập nhật từ các trang khác
   * - Đồng bộ qua localStorage khi mở nhiều tab
   */
  useEffect(() => {
    // Đọc số lượng ban đầu
    syncCartQty();

    // Request an updated count from API/local fallback
    try {
      dispatchCartUpdated();
    } catch (e) {
      // ignore
    }

    // Lắng nghe sự kiện cập nhật từ các trang (BanChay, v.v.)
    const handleCartUpdate = (e) => {
      setCartQty(e.detail?.qty ?? 0);
    };
    document.addEventListener("CART_UPDATED", handleCartUpdate);

    // Đồng bộ qua localStorage khi mở nhiều tab
    const handleStorageChange = (e) => {
      if (e.key === CART_KEY || e.key === CART_KEY + "_count") {
        syncCartQty();
      }
    };
    window.addEventListener("storage", handleStorageChange);

    // Cleanup
    return () => {
      document.removeEventListener("CART_UPDATED", handleCartUpdate);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // Khi user thay đổi (đăng nhập/đăng xuất), lấy lại số lượng giỏ hàng
  useEffect(() => {
    try {
      dispatchCartUpdated();
    } catch (e) {
      // ignore
    }
  }, [user]);

  /**
   * Đóng menu user khi click ra ngoài
   */
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isUserMenuOpen]);

  /**
   * Đóng giao diện tìm kiếm khi click ra ngoài
   */
  useEffect(() => {
    if (!isSearchExpanded) return;

    const handleClickOutside = (e) => {
      if (
        searchExpandedRef.current &&
        !searchExpandedRef.current.contains(e.target) &&
        searchRef.current &&
        !searchRef.current.contains(e.target)
      ) {
        setIsSearchExpanded(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchExpanded]);

  /**
   * Load tất cả sản phẩm từ API khi component mount
   */
  useEffect(() => {
    async function loadAllProducts() {
      setLoadingProducts(true);
      try {
        // Load tất cả sản phẩm từ API
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
      } catch (error) {
        console.error("Error loading products from API:", error);
        setAllProducts([]);
      } finally {
        setLoadingProducts(false);
      }
    }

    loadAllProducts();
  }, []);

  /**
   * Load sản phẩm hot khi mở giao diện tìm kiếm
   */
  useEffect(() => {
    if (
      isSearchExpanded &&
      !hasLoadedHotProducts.current &&
      !searchQuery.trim()
    ) {
      hasLoadedHotProducts.current = true;
      async function loadHotProducts() {
        setLoadingHotProducts(true);
        try {
          const data = await getSaleProducts(3);
          setHotProducts(data || []);
        } catch (error) {
          console.error("Error loading hot products:", error);
          setHotProducts([]);
        } finally {
          setLoadingHotProducts(false);
        }
      }
      loadHotProducts();
    }

    // Reset flag khi đóng giao diện tìm kiếm
    if (!isSearchExpanded) {
      hasLoadedHotProducts.current = false;
      setSearchSuggestions([]);
      setSearchResults([]);
    }
  }, [isSearchExpanded]);

  /**
   * Tìm kiếm khi người dùng nhập (với debounce)
   */
  useEffect(() => {
    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Nếu không có query, reset
    if (!searchQuery.trim()) {
      setSearchSuggestions([]);
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Debounce search - nhanh hơn khi chỉ có 1 ký tự
    setIsSearching(true);
    const debounceTime = searchQuery.trim().length === 1 ? 150 : 300;

    searchTimeoutRef.current = setTimeout(() => {
      try {
        const query = searchQuery.trim();

        // Chỉ tìm kiếm nếu đã có dữ liệu sản phẩm từ API
        if (allProducts.length === 0 && !loadingProducts) {
          setSearchSuggestions([]);
          setSearchResults([]);
          setIsSearching(false);
          return;
        }

        // Get suggestions - hiển thị ngay từ ký tự đầu tiên (từ API)
        const suggestions = getSearchSuggestionsFromArray(
          allProducts,
          query,
          8
        );
        setSearchSuggestions(suggestions);

        // Get search results (limit 5 for preview) - chỉ khi có ít nhất 2 ký tự
        if (query.length >= 2) {
          const results = searchProductsInArray(allProducts, query, 5);
          setSearchResults(results);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error("Error in search:", error);
        setSearchSuggestions([]);
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, debounceTime);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, allProducts, loadingProducts]);

  // ============================================
  // FUNCTIONS
  // ============================================

  /**
   * Format giá tiền
   */
  function formatPrice(price) {
    if (!price || isNaN(price)) return "0₫";
    return new Intl.NumberFormat("vi-VN").format(Number(price)) + "₫";
  }

  /**
   * Tính phần trăm giảm giá
   */
  function calculateDiscount(oldPrice, price) {
    if (!oldPrice || oldPrice <= price) return 0;
    return Math.round(((oldPrice - price) / oldPrice) * 100);
  }

  // ============================================
  // EVENT HANDLERS
  // ============================================
  /**
   * Xử lý khi click vào thanh tìm kiếm
   */
  function handleSearchFocus() {
    setIsSearchExpanded(true);
  }

  /**
   * Xử lý tìm kiếm - khi nhấn Enter hoặc nút Tìm
   */
  function handleSearch(e) {
    e.preventDefault();
    e.stopPropagation();
    const query = searchQuery.trim();
    console.log("handleSearch called with query:", query);
    if (query) {
      // Đóng giao diện tìm kiếm mở rộng
      setIsSearchExpanded(false);
      // Điều hướng đến trang kết quả tìm kiếm
      const searchUrl = `/search?q=${encodeURIComponent(query)}&type=products`;
      console.log("Navigating to:", searchUrl);
      navigate(searchUrl);
    } else {
      // Nếu không có query, chỉ đóng giao diện
      setIsSearchExpanded(false);
    }
  }

  /**
   * Xử lý đăng xuất
   */
  function handleLogout() {
    setIsUserMenuOpen(false);
    logout();
    navigate("/");
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <header className="lc-header">
      {/* ========================================== */}
      {/* TOPBAR - Thông tin liên hệ và khuyến mãi */}
      {/* ========================================== */}
      <div className="topbar">
        <div className="container">
          <div className="topbar__wrap">
            {/* Bên trái - Khuyến mãi */}
            <div className="topbar__left">
              <div className="topbar__promo">
                <i className="ri-fire-line"></i>
                <span>
                  <strong>FLASHSALE</strong> - Giảm đến 42% cho đơn hàng đầu
                  tiên
                </span>
              </div>
            </div>

            {/* Bên phải - Thông tin hỗ trợ */}
            <div className="topbar__right">
              <a
                href="tel:1900123456"
                className="topbar__link"
                title="Gọi ngay"
              >
                <i className="ri-phone-line"></i>
                <span>
                  Hotline: <strong>1900 123 456</strong>
                </span>
              </a>
              <a
                href="mailto:hotro@hieuthuocviet.vn"
                className="topbar__link"
                title="Gửi email"
              >
                <i className="ri-mail-line"></i>
                <span>hotro@hieuthuocviet.vn</span>
              </a>
              <div className="topbar__link" title="Giờ làm việc">
                <i className="ri-time-line"></i>
                <span>8:00 - 22:00</span>
              </div>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="topbar__link"
                title="Facebook"
              >
                <i className="ri-facebook-fill"></i>
              </a>
              <a
                href="https://zalo.me"
                target="_blank"
                rel="noopener noreferrer"
                className="topbar__link"
                title="Zalo"
              >
                <i className="ri-chat-3-line"></i>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* MAIN BAR - Logo, Search, Account, Cart */}
      {/* ========================================== */}
      <div className="lc-bar">
        <div className="container lc-bar__wrap">
          {/* Logo */}
          <Link to="/" className="lc-logo">
            <img
              src="/Logo/logo1.png"
              alt="Hiệu thuốc Việt"
              className="lc-logo__image"
              style={{
                height: "100px",
                width: "auto",
                maxWidth: "320px",
                objectFit: "contain",
              }}
            />
          </Link>

          {/* Search Form */}
          <div className="lc-search-wrapper" ref={searchRef}>
            <form
              className="lc-search"
              onSubmit={handleSearch}
              onClick={(e) => {
                // Đảm bảo click vào form không đóng giao diện mở rộng
                e.stopPropagation();
              }}
            >
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                placeholder="Tìm tên thuốc, bệnh lý, TPCN…"
                autoComplete="off"
              />

              <button
                type="button"
                className="icon-btn"
                title="Nói"
                aria-label="Tìm kiếm bằng giọng nói"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <i className="ri-mic-line"></i>
              </button>

              <button
                type="button"
                className="icon-btn"
                title="Quét"
                aria-label="Quét mã sản phẩm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <i className="ri-scan-line"></i>
              </button>

              <button
                className="lc-search__btn"
                type="submit"
                onClick={(e) => {
                  // Đảm bảo click vào nút không bị chặn
                  e.stopPropagation();
                }}
              >
                Tìm
              </button>
            </form>

            {/* Giao diện tìm kiếm mở rộng */}
            {isSearchExpanded && (
              <div className="lc-search-expanded" ref={searchExpandedRef}>
                {/* Banner Flashsale */}
                {SEARCH_BANNER_IMAGE_URL ? (
                  <Link
                    to="/khuyen-mai"
                    className="search-banner"
                    onClick={() => setIsSearchExpanded(false)}
                  >
                    <img
                      src={SEARCH_BANNER_IMAGE_URL}
                      alt="Flashsale"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  </Link>
                ) : (
                  <div className="search-banner">
                    <div className="search-banner__content">
                      <div className="search-banner__left">
                        <div className="search-banner__discount">
                          <span className="discount-text">GIẢM ĐẾN 42%</span>
                          <div className="zalo-pay-logo">Zalo pay</div>
                        </div>
                      </div>
                      <div className="search-banner__center">
                        <h3 className="search-banner__title">
                          FLASHSALE GIÁ TỐT
                        </h3>
                      </div>
                      <div className="search-banner__right">
                        <Link
                          to="/khuyen-mai"
                          className="search-banner__btn"
                          onClick={() => setIsSearchExpanded(false)}
                        >
                          Mua ngay <i className="ri-arrow-right-line"></i>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Nội dung tìm kiếm - hiển thị khi có query */}
                {searchQuery.trim() ? (
                  <>
                    {/* Gợi ý tìm kiếm */}
                    {searchSuggestions.length > 0 && (
                      <div className="search-suggestions">
                        <h4 className="search-section-title">
                          <i className="ri-search-line"></i> Gợi ý tìm kiếm
                        </h4>
                        <div className="search-suggestions__list">
                          {searchSuggestions.map((suggestion, index) => {
                            // Xử lý text để hiển thị và tìm kiếm
                            let displayText = suggestion;
                            let searchText = suggestion;

                            // Nếu là danh mục, loại bỏ prefix khi search
                            if (suggestion.startsWith("Danh mục ")) {
                              searchText = suggestion.replace("Danh mục ", "");
                            }

                            return (
                              <button
                                key={index}
                                className="search-suggestion-item"
                                onClick={() => {
                                  setSearchQuery(searchText);
                                  // Tự động tìm kiếm và điều hướng
                                  navigate(
                                    `/search?q=${encodeURIComponent(
                                      searchText
                                    )}`
                                  );
                                  setIsSearchExpanded(false);
                                }}
                              >
                                <i className="ri-search-line"></i>
                                <span>{displayText}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Kết quả tìm kiếm */}
                    <div className="search-results-preview">
                      <div className="search-results-preview__header">
                        <h4 className="search-section-title">
                          <i className="ri-fire-line"></i> Kết quả tìm kiếm
                        </h4>
                        {searchResults.length > 0 && (
                          <Link
                            to={`/search?q=${encodeURIComponent(searchQuery)}`}
                            className="search-view-all"
                            onClick={() => setIsSearchExpanded(false)}
                          >
                            Xem tất cả <i className="ri-arrow-right-line"></i>
                          </Link>
                        )}
                      </div>
                      <div className="search-results-preview__content">
                        {isSearching ? (
                          <div className="search-loading">Đang tìm kiếm...</div>
                        ) : searchResults.length > 0 ? (
                          searchResults.map((product) => {
                            const discount = calculateDiscount(
                              product.oldPrice || product.old,
                              product.price
                            );
                            return (
                              <Link
                                key={product.id}
                                to={`/san-pham/${product.id}`}
                                className="search-product-item"
                                onClick={() => setIsSearchExpanded(false)}
                              >
                                <div className="search-product-item__image">
                                  <img
                                    src={
                                      product.cover ||
                                      product.img ||
                                      "/img/placeholder.jpg"
                                    }
                                    alt={product.name}
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "/img/placeholder.jpg";
                                    }}
                                  />
                                  {discount > 0 && (
                                    <span className="search-product-item__discount">
                                      -{discount}%
                                    </span>
                                  )}
                                </div>
                                <div className="search-product-item__info">
                                  <h5 className="search-product-item__name">
                                    {product.name}
                                  </h5>
                                  <div className="search-product-item__price">
                                    <span className="price-current">
                                      {formatPrice(product.price)} / Hộp
                                    </span>
                                    {(product.oldPrice || product.old) && (
                                      <span className="price-old">
                                        {formatPrice(
                                          product.oldPrice || product.old
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            );
                          })
                        ) : (
                          <div className="search-empty">
                            Không tìm thấy sản phẩm nào
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Tra cứu hàng đầu - chỉ hiển thị khi không có query */}
                    <div className="search-top-searches">
                      <h4 className="search-section-title">Tra cứu hàng đầu</h4>
                      <div className="search-tags">
                        <button
                          className="search-tag"
                          onClick={() => {
                            setSearchQuery("Omega 3");
                            handleSearchFocus();
                          }}
                        >
                          Omega 3
                        </button>
                        <button
                          className="search-tag"
                          onClick={() => {
                            setSearchQuery("Canxi");
                            handleSearchFocus();
                          }}
                        >
                          Canxi
                        </button>
                        <button
                          className="search-tag"
                          onClick={() => {
                            setSearchQuery("Dung dịch vệ sinh");
                            handleSearchFocus();
                          }}
                        >
                          Dung dịch vệ sinh
                        </button>
                        <button
                          className="search-tag"
                          onClick={() => {
                            setSearchQuery("Sữa rửa mặt");
                            handleSearchFocus();
                          }}
                        >
                          Sữa rửa mặt
                        </button>
                        <button
                          className="search-tag"
                          onClick={() => {
                            setSearchQuery("Thuốc nhỏ mắt");
                            handleSearchFocus();
                          }}
                        >
                          Thuốc nhỏ mắt
                        </button>
                        <button
                          className="search-tag"
                          onClick={() => {
                            setSearchQuery("Kẽm");
                            handleSearchFocus();
                          }}
                        >
                          Kẽm
                        </button>
                        <button
                          className="search-tag"
                          onClick={() => {
                            setSearchQuery("Kem chống nắng");
                            handleSearchFocus();
                          }}
                        >
                          Kem chống nắng
                        </button>
                        <button
                          className="search-tag"
                          onClick={() => {
                            setSearchQuery("Men vi sinh");
                            handleSearchFocus();
                          }}
                        >
                          Men vi sinh
                        </button>
                      </div>
                    </div>

                    {/* Ưu đãi hot hôm nay - chỉ hiển thị khi không có query */}
                    <div className="search-hot-deals">
                      <div className="search-hot-deals__header">
                        <h4 className="search-section-title">
                          <i className="ri-fire-line"></i> Ưu đãi hot hôm nay
                        </h4>
                      </div>
                      <div className="search-hot-deals__content">
                        {loadingHotProducts ? (
                          <div className="search-loading">Đang tải...</div>
                        ) : hotProducts.length > 0 ? (
                          hotProducts.map((product) => {
                            const discount = calculateDiscount(
                              product.oldPrice || product.old,
                              product.price
                            );
                            return (
                              <Link
                                key={product.id}
                                to={`/san-pham/${product.id}`}
                                className="search-product-item"
                                onClick={() => setIsSearchExpanded(false)}
                              >
                                <div className="search-product-item__image">
                                  <img
                                    src={
                                      product.cover ||
                                      product.img ||
                                      "/img/placeholder.jpg"
                                    }
                                    alt={product.name}
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "/img/placeholder.jpg";
                                    }}
                                  />
                                  {discount > 0 && (
                                    <span className="search-product-item__discount">
                                      -{discount}%
                                    </span>
                                  )}
                                </div>
                                <div className="search-product-item__info">
                                  <h5 className="search-product-item__name">
                                    {product.name}
                                  </h5>
                                  <div className="search-product-item__price">
                                    <span className="price-current">
                                      {formatPrice(product.price)} / Hộp
                                    </span>
                                    {(product.oldPrice || product.old) && (
                                      <span className="price-old">
                                        {formatPrice(
                                          product.oldPrice || product.old
                                        )}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </Link>
                            );
                          })
                        ) : (
                          <div className="search-empty">
                            Không có sản phẩm khuyến mãi
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Account & Cart */}
          <div className="lc-quick">
            {/* Account Button / User Menu */}
            {!user ? (
              <button
                type="button"
                className="lc-account"
                onClick={() => setIsAuthModalOpen(true)}
              >
                <i className="ri-user-line"></i>
                <span>Đăng nhập</span>
              </button>
            ) : (
              <div
                className="lc-account user"
                ref={userMenuRef}
                aria-expanded={isUserMenuOpen}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsUserMenuOpen((prev) => !prev);
                }}
              >
                <div className="avatar">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name || "User"}
                      key={user.avatar.substring(0, 50)}
                    />
                  ) : (
                    <span>{user.name?.[0]?.toUpperCase() || "U"}</span>
                  )}
                </div>
                <span className="name">{user.name}</span>
                <i className="ri-arrow-down-s-line"></i>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div
                    className="lc-user-menu"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      to="/account"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Tài khoản của tôi
                    </Link>

                    <button type="button" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Cart Button */}
            <button
              type="button"
              className="lc-cart"
              aria-label="Giỏ hàng"
              onClick={() => setIsCartOpen(true)}
            >
              <i className="ri-shopping-cart-2-line"></i>
              <span className="badge">{cartQty}</span>
              <span className="text">Giỏ hàng</span>
            </button>
          </div>
        </div>

        {/* ========================================== */}
        {/* NAVIGATION TAGS - Danh mục nhanh */}
        {/* ========================================== */}
        <div className="container lc-tags">
          <NavLink
            to="/bai-viet"
            className={({ isActive }) => "tag" + (isActive ? " active" : "")}
          >
            Bài viết
          </NavLink>

          <NavLink
            to="/ban-chay"
            className={({ isActive }) => "tag" + (isActive ? " active" : "")}
          >
            Bán chạy
          </NavLink>

          <NavLink
            to="/hang-moi"
            className={({ isActive }) => "tag" + (isActive ? " active" : "")}
          >
            Hàng mới
          </NavLink>

          <NavLink
            to="/dich-vu"
            className={({ isActive }) => "tag" + (isActive ? " active" : "")}
          >
            Dịch vụ
          </NavLink>

          <NavLink
            to="/khuyen-mai"
            className={({ isActive }) => "tag" + (isActive ? " active" : "")}
          >
            Khuyến mãi
          </NavLink>

          <NavLink
            to="/thuoc"
            className={({ isActive }) => "tag" + (isActive ? " active" : "")}
          >
            Thuốc
          </NavLink>
        </div>
      </div>

      {/* ========================================== */}
      {/* MODALS & SIDEBARS */}
      {/* ========================================== */}
      <AuthModal
        open={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />

      <CartSidebar open={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </header>
  );
}
