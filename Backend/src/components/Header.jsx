// src/components/Header.jsx
import { useState, useRef, useEffect } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

import { useAuth } from "../utils/AuthContext";
import AuthModal from "./AuthModal";
import CartSidebar from "./CartSidebar";

// ============================================
// CONSTANTS
// ============================================
const CART_KEY = "demo_cart";

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

  // ============================================
  // REFS
  // ============================================
  const userMenuRef = useRef(null);

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

    // Lắng nghe sự kiện cập nhật từ các trang (BanChay, v.v.)
    const handleCartUpdate = (e) => {
      setCartQty(e.detail?.qty ?? 0);
    };
    document.addEventListener("CART_UPDATED", handleCartUpdate);

    // Đồng bộ qua localStorage khi mở nhiều tab
    const handleStorageChange = (e) => {
      if (e.key === CART_KEY) {
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

  // ============================================
  // EVENT HANDLERS
  // ============================================
  /**
   * Xử lý tìm kiếm
   */
  function handleSearch(e) {
    e.preventDefault();
    const query = searchQuery.trim();
    if (query) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
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
      {/* MAIN BAR - Logo, Search, Account, Cart */}
      {/* ========================================== */}
      <div className="lc-bar">
        <div className="container lc-bar__wrap">
          {/* Logo */}
          <Link to="/" className="lc-logo">
            <img 
              src="/Logo/logo_hieuthuoc.png" 
              alt="Hiệu thuốc Việt" 
              className="lc-logo__image"
              style={{ 
                height: '80px', 
                width: 'auto', 
                maxWidth: '280px',
                objectFit: 'contain'
              }}
            />
          </Link>

          {/* Search Form */}
          <form className="lc-search" onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm tên thuốc, bệnh lý, TPCN…"
            />

            <button
              type="button"
              className="icon-btn"
              title="Nói"
              aria-label="Tìm kiếm bằng giọng nói"
            >
              <i className="ri-mic-line"></i>
            </button>

            <button
              type="button"
              className="icon-btn"
              title="Quét"
              aria-label="Quét mã sản phẩm"
            >
              <i className="ri-scan-line"></i>
            </button>

            <button className="lc-search__btn" type="submit">
              Tìm
            </button>
          </form>

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
                  {user.name?.[0]?.toUpperCase() || "U"}
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
