// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";
import * as adminApi from "../services/adminApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import "../assets/css/admin.css";
import * as XLSX from "xlsx";

const PRODUCT_FORM_TEMPLATE = {
  name: "",
  price: "",
  oldPrice: "",
  categoryId: "",
  brand: "",
  img: "",
  cover: "",
  saleLabel: "",
  rating: "0",
  sold: "0",
  desc: "",
  shortDescription: "",
  status: "active",
};

// Component Pagination tái sử dụng
function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="admin-pagination">
      <button
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        ← Trước
      </button>

      <div className="pagination-pages">
        {Array.from({ length: totalPages }, (_, i) => i + 1)
          .filter((page) => {
            return (
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1)
            );
          })
          .map((page, index, array) => {
            const prevPage = array[index - 1];
            const showEllipsis = prevPage && page - prevPage > 1;

            return (
              <span key={page}>
                {showEllipsis && (
                  <span className="pagination-ellipsis">...</span>
                )}
                <button
                  className={`pagination-page ${
                    currentPage === page ? "active" : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              </span>
            );
          })}
      </div>

      <button
        className="pagination-btn"
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Sau →
      </button>
    </div>
  );
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Kiểm tra quyền admin
  useEffect(() => {
    if (!user || user.role !== "admin") {
      navigate("/");
    }
  }, [user, navigate]);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !event.target.closest(".admin-header__user") &&
        !event.target.closest(".admin-header__user-dropdown-menu")
      ) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleGoHome = () => {
    // Chuyển về trang chủ
    navigate("/");
  };

  const tabs = [
    { id: "dashboard", label: "Tổng quan", icon: "ri-dashboard-line" },
    { id: "users", label: "Quản lý người dùng", icon: "ri-user-line" },
    { id: "employees", label: "Quản lý nhân viên", icon: "ri-team-line" },
    { id: "categories", label: "Quản lý danh mục", icon: "ri-folder-line" },
    {
      id: "products",
      label: "Quản lý sản phẩm",
      icon: "ri-shopping-cart-line",
    },
    { id: "orders", label: "Quản lý đơn hàng", icon: "ri-shopping-bag-line" },
    { id: "promotions", label: "Quản lý khuyến mãi", icon: "ri-coupon-line" },
    { id: "services", label: "Quản lý dịch vụ", icon: "ri-hand-heart-line" },
    {
      id: "appointments",
      label: "Lịch hẹn dịch vụ",
      icon: "ri-calendar-check-line",
    },
    { id: "posts", label: "Quản lý tin tức", icon: "ri-article-line" },
    { id: "reports", label: "Báo cáo thống kê", icon: "ri-bar-chart-line" },
  ];

  return (
    <div className="admin-page">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__logo">
            <div className="admin-sidebar__logo-icon">
              <i className="ri-admin-line"></i>
            </div>
            <div className="admin-sidebar__logo-text">
              <h2>Quản trị viên</h2>
              <span>Admin Dashboard</span>
            </div>
          </div>
        </div>
        <nav className="admin-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`admin-nav__item ${
                activeTab === tab.id ? "active" : ""
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <i className={tab.icon}></i>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
        <div className="admin-sidebar__footer">
          <button className="admin-nav__item" onClick={handleGoHome}>
            <i className="ri-home-line"></i>
            <span>Về trang chủ</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <header className="admin-header">
          <div className="admin-header__left">
            <div className="admin-header__title-section">
              <h1>
                <i
                  className={
                    tabs.find((t) => t.id === activeTab)?.icon ||
                    "ri-dashboard-line"
                  }
                ></i>
                {tabs.find((t) => t.id === activeTab)?.label || "Dashboard"}
              </h1>
              <span className="admin-header__subtitle">Quản lý hệ thống</span>
            </div>
          </div>
          <div className="admin-header__right">
            <div className="admin-header__search">
              <i className="ri-search-line"></i>
              <input type="text" placeholder="Tìm kiếm..." />
            </div>
            <div className="admin-header__user">
              <div className="admin-header__user-avatar">
                <i className="ri-user-3-fill"></i>
              </div>
              <div className="admin-header__user-info">
                <span className="admin-header__user-name">
                  {user?.name || "Admin"}
                </span>
                <span className="admin-header__user-role">Quản trị viên</span>
              </div>
              <button
                className="admin-header__user-dropdown"
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                }}
              >
                <i className="ri-arrow-down-s-line"></i>
              </button>
              {userDropdownOpen && (
                <div className="admin-header__user-dropdown-menu">
                  <div className="admin-header__user-dropdown-header">
                    <div className="admin-header__user-dropdown-avatar">
                      <i className="ri-user-3-fill"></i>
                    </div>
                    <div className="admin-header__user-dropdown-info">
                      <span className="admin-header__user-dropdown-name">
                        {user?.name || "Admin"}
                      </span>
                      <span className="admin-header__user-dropdown-email">
                        {user?.email || "admin@example.com"}
                      </span>
                    </div>
                  </div>
                  <div className="admin-header__user-dropdown-divider"></div>
                  <button
                    className="admin-header__user-dropdown-item"
                    onClick={handleLogout}
                  >
                    <i className="ri-logout-box-line"></i>
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="admin-content">
          {activeTab === "dashboard" && (
            <DashboardOverview setActiveTab={setActiveTab} />
          )}
          {activeTab === "users" && <ManageUsers />}
          {activeTab === "employees" && <ManageEmployees />}
          {activeTab === "categories" && <ManageCategories />}
          {activeTab === "products" && <ManageProducts />}
          {activeTab === "orders" && <ManageOrders />}
          {activeTab === "promotions" && <ManagePromotions />}
          {activeTab === "services" && <ManageServicesAdmin />}
          {activeTab === "appointments" && <ManageAppointmentsAdmin />}
          {activeTab === "posts" && <ManagePosts />}
          {activeTab === "reports" && <StatisticalReports />}
        </div>
      </main>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ setActiveTab }) {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    deliveredOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    newUsersToday: 0,
    monthlyRevenue: [],
    topProducts: [],
    ordersByStatus: [],
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState("month"); // day, week, month

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      // Load data sequentially to avoid overwhelming the server
      const statsData = await adminApi.getDashboardStats();
      setStats(statsData);

      // Load orders separately
      try {
        const ordersData = await adminApi.getAllOrders("all");
        setAllOrders(ordersData);
        setRecentOrders(
          ordersData.slice(0, 10).sort((a, b) => {
            const dateA = new Date(a.createdAt || a.created_at || a.orderDate);
            const dateB = new Date(b.createdAt || b.created_at || b.orderDate);
            return dateB - dateA;
          })
        );
      } catch (ordersError) {
        console.warn("Could not load orders:", ordersError);
        setRecentOrders([]);
        setAllOrders([]);
      }

      // Load products for top products
      try {
        const productsData = await adminApi.getAllProductsAdmin();
        setAllProducts(productsData || []);
      } catch (productsError) {
        console.warn("Could not load products:", productsError);
        setAllProducts([]);
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      const errorMessage = error.message || "Không thể kết nối đến server";
      alert(
        `Lỗi khi tải dữ liệu: ${errorMessage}\n\nVui lòng kiểm tra:\n- Backend có đang chạy tại http://localhost:3000 không?\n- Database có được kết nối không?`
      );
    } finally {
      setLoading(false);
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    const num = Number(amount);
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

  // Calculate revenue chart data
  const getRevenueChartData = () => {
    const now = new Date();
    const data = [];

    if (timeFilter === "day") {
      // Last 7 days
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toLocaleDateString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
        });
        const dayOrders = allOrders.filter((order) => {
          const orderDate = new Date(
            order.createdAt || order.created_at || order.orderDate
          );
          return (
            orderDate.toDateString() === date.toDateString() &&
            ["delivered", "shipping", "confirmed"].includes(order.status)
          );
        });
        const revenue = dayOrders.reduce(
          (sum, order) => sum + parseFloat(order.finalAmount || 0),
          0
        );
        data.push({ name: dateStr, value: revenue });
      }
    } else if (timeFilter === "week") {
      // Last 4 weeks
      for (let i = 3; i >= 0; i--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (i * 7 + 6));
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const weekLabel = `Tuần ${4 - i}`;
        const weekOrders = allOrders.filter((order) => {
          const orderDate = new Date(
            order.createdAt || order.created_at || order.orderDate
          );
          return (
            orderDate >= weekStart &&
            orderDate <= weekEnd &&
            ["delivered", "shipping", "confirmed"].includes(order.status)
          );
        });
        const revenue = weekOrders.reduce(
          (sum, order) => sum + parseFloat(order.finalAmount || 0),
          0
        );
        data.push({ name: weekLabel, value: revenue });
      }
    } else {
      // Last 6 months
      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthLabel = date.toLocaleDateString("vi-VN", {
          month: "short",
          year: "numeric",
        });
        const monthOrders = allOrders.filter((order) => {
          const orderDate = new Date(
            order.createdAt || order.created_at || order.orderDate
          );
          return (
            orderDate.getMonth() === date.getMonth() &&
            orderDate.getFullYear() === date.getFullYear() &&
            ["delivered", "shipping", "confirmed"].includes(order.status)
          );
        });
        const revenue = monthOrders.reduce(
          (sum, order) => sum + parseFloat(order.finalAmount || 0),
          0
        );
        data.push({ name: monthLabel, value: revenue });
      }
    }

    return data;
  };

  // Get orders by status for pie chart
  const getOrdersByStatusData = () => {
    const statusCounts = {
      pending: allOrders.filter((o) => o.status === "pending").length,
      confirmed: allOrders.filter((o) => o.status === "confirmed").length,
      shipping: allOrders.filter((o) => o.status === "shipping").length,
      delivered: allOrders.filter((o) => o.status === "delivered").length,
      cancelled: allOrders.filter((o) => o.status === "cancelled").length,
    };

    return [
      { name: "Chờ xử lý", value: statusCounts.pending, color: "#f59e0b" },
      { name: "Đã xác nhận", value: statusCounts.confirmed, color: "#3b82f6" },
      { name: "Đang giao", value: statusCounts.shipping, color: "#8b5cf6" },
      { name: "Đã giao", value: statusCounts.delivered, color: "#10b981" },
      { name: "Đã hủy", value: statusCounts.cancelled, color: "#ef4444" },
    ].filter((item) => item.value > 0);
  };

  // Get top products
  const getTopProducts = () => {
    return [...allProducts]
      .sort((a, b) => (b.sold || 0) - (a.sold || 0))
      .slice(0, 5)
      .map((product) => ({
        ...product,
        sold: product.sold || 0,
      }));
  };

  // Calculate quick stats
  const getQuickStats = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    const todayOrders = allOrders.filter((order) => {
      const orderDate = new Date(
        order.createdAt || order.created_at || order.orderDate
      );
      return (
        orderDate >= today &&
        ["delivered", "shipping", "confirmed"].includes(order.status)
      );
    });

    const weekOrders = allOrders.filter((order) => {
      const orderDate = new Date(
        order.createdAt || order.created_at || order.orderDate
      );
      return (
        orderDate >= weekAgo &&
        ["delivered", "shipping", "confirmed"].includes(order.status)
      );
    });

    const monthOrders = allOrders.filter((order) => {
      const orderDate = new Date(
        order.createdAt || order.created_at || order.orderDate
      );
      return (
        orderDate >= monthAgo &&
        ["delivered", "shipping", "confirmed"].includes(order.status)
      );
    });

    return {
      today: {
        orders: todayOrders.length,
        revenue: todayOrders.reduce(
          (sum, o) => sum + parseFloat(o.finalAmount || 0),
          0
        ),
      },
      week: {
        orders: weekOrders.length,
        revenue: weekOrders.reduce(
          (sum, o) => sum + parseFloat(o.finalAmount || 0),
          0
        ),
      },
      month: {
        orders: monthOrders.length,
        revenue: monthOrders.reduce(
          (sum, o) => sum + parseFloat(o.finalAmount || 0),
          0
        ),
      },
    };
  };

  const quickStats = getQuickStats();
  const revenueData = getRevenueChartData();
  const ordersByStatusData = getOrdersByStatusData();
  const topProducts = getTopProducts();

  if (loading) {
    return (
      <div className="dashboard-loading">
        <i className="ri-loader-4-line"></i>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Stats Cards */}
      <div className="admin-stats">
        <div className="stat-card">
          <div
            className="stat-card__icon"
            style={{ background: "var(--primary-bg)", color: "var(--primary)" }}
          >
            <i className="ri-user-line"></i>
          </div>
          <div className="stat-card__content">
            <h3>{stats.totalUsers.toLocaleString()}</h3>
            <p>Tổng người dùng</p>
            {stats.newUsersToday > 0 && (
              <span className="stat-card__change positive">
                +{stats.newUsersToday} hôm nay
              </span>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-card__icon"
            style={{ background: "var(--success-bg)", color: "var(--success)" }}
          >
            <i className="ri-shopping-bag-line"></i>
          </div>
          <div className="stat-card__content">
            <h3>{stats.totalOrders.toLocaleString()}</h3>
            <p>Tổng đơn hàng</p>
            {stats.pendingOrders > 0 && (
              <span className="stat-card__change warning">
                {stats.pendingOrders} chờ xử lý
              </span>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-card__icon"
            style={{ background: "var(--warning-bg)", color: "var(--warning)" }}
          >
            <i className="ri-money-dollar-circle-line"></i>
          </div>
          <div className="stat-card__content">
            <h3>{formatCurrency(stats.totalRevenue)}</h3>
            <p>Tổng doanh thu</p>
            {stats.todayRevenue > 0 && (
              <span className="stat-card__change positive">
                +{formatCurrency(stats.todayRevenue)} hôm nay
              </span>
            )}
          </div>
        </div>
        <div className="stat-card">
          <div
            className="stat-card__icon"
            style={{ background: "var(--primary-bg)", color: "var(--primary)" }}
          >
            <i className="ri-box-line"></i>
          </div>
          <div className="stat-card__content">
            <h3>{stats.totalProducts.toLocaleString()}</h3>
            <p>Tổng sản phẩm</p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="admin-card">
        <div className="admin-card__header">
          <h3>Thống kê nhanh</h3>
        </div>
        <div className="quick-stats">
          <div className="quick-stat-item">
            <div className="quick-stat-header">
              <i className="ri-calendar-todo-line"></i>
              <span>Hôm nay</span>
            </div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">
                <strong>{quickStats.today.orders}</strong>
                <span>đơn hàng</span>
              </div>
              <div className="quick-stat-value">
                <strong>{formatCurrency(quickStats.today.revenue)}</strong>
                <span>doanh thu</span>
              </div>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-header">
              <i className="ri-calendar-week-line"></i>
              <span>Tuần này</span>
            </div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">
                <strong>{quickStats.week.orders}</strong>
                <span>đơn hàng</span>
              </div>
              <div className="quick-stat-value">
                <strong>{formatCurrency(quickStats.week.revenue)}</strong>
                <span>doanh thu</span>
              </div>
            </div>
          </div>
          <div className="quick-stat-item">
            <div className="quick-stat-header">
              <i className="ri-calendar-line"></i>
              <span>Tháng này</span>
            </div>
            <div className="quick-stat-content">
              <div className="quick-stat-value">
                <strong>{quickStats.month.orders}</strong>
                <span>đơn hàng</span>
              </div>
              <div className="quick-stat-value">
                <strong>{formatCurrency(quickStats.month.revenue)}</strong>
                <span>doanh thu</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <div className="admin-card__header">
          <h3>Thao tác nhanh</h3>
        </div>
        <div className="quick-actions">
          {setActiveTab && (
            <>
              <button
                className="quick-action-btn"
                onClick={() => setActiveTab("orders")}
              >
                <div
                  className="quick-action-icon"
                  style={{
                    background: "var(--warning-bg)",
                    color: "var(--warning)",
                  }}
                >
                  <i className="ri-shopping-bag-line"></i>
                </div>
                <div className="quick-action-content">
                  <h4>Quản lý đơn hàng</h4>
                  <p>Xem và xử lý đơn hàng</p>
                </div>
                <i className="ri-arrow-right-s-line"></i>
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setActiveTab("products")}
              >
                <div
                  className="quick-action-icon"
                  style={{
                    background: "var(--primary-bg)",
                    color: "var(--primary)",
                  }}
                >
                  <i className="ri-shopping-cart-line"></i>
                </div>
                <div className="quick-action-content">
                  <h4>Quản lý sản phẩm</h4>
                  <p>Thêm, sửa, xóa sản phẩm</p>
                </div>
                <i className="ri-arrow-right-s-line"></i>
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setActiveTab("users")}
              >
                <div
                  className="quick-action-icon"
                  style={{
                    background: "var(--success-bg)",
                    color: "var(--success)",
                  }}
                >
                  <i className="ri-user-line"></i>
                </div>
                <div className="quick-action-content">
                  <h4>Quản lý người dùng</h4>
                  <p>Xem danh sách người dùng</p>
                </div>
                <i className="ri-arrow-right-s-line"></i>
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setActiveTab("categories")}
              >
                <div
                  className="quick-action-icon"
                  style={{
                    background: "var(--primary-bg)",
                    color: "var(--primary)",
                  }}
                >
                  <i className="ri-folder-line"></i>
                </div>
                <div className="quick-action-content">
                  <h4>Quản lý danh mục</h4>
                  <p>Quản lý danh mục sản phẩm</p>
                </div>
                <i className="ri-arrow-right-s-line"></i>
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setActiveTab("reports")}
              >
                <div
                  className="quick-action-icon"
                  style={{
                    background: "var(--warning-bg)",
                    color: "var(--warning)",
                  }}
                >
                  <i className="ri-bar-chart-line"></i>
                </div>
                <div className="quick-action-content">
                  <h4>Báo cáo thống kê</h4>
                  <p>Xem báo cáo chi tiết</p>
                </div>
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts">
        {/* Revenue Chart */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3>Doanh thu theo thời gian</h3>
            <div className="chart-filters">
              <button
                className={`filter-chip ${
                  timeFilter === "day" ? "active" : ""
                }`}
                onClick={() => setTimeFilter("day")}
              >
                7 ngày
              </button>
              <button
                className={`filter-chip ${
                  timeFilter === "week" ? "active" : ""
                }`}
                onClick={() => setTimeFilter("week")}
              >
                4 tuần
              </button>
              <button
                className={`filter-chip ${
                  timeFilter === "month" ? "active" : ""
                }`}
                onClick={() => setTimeFilter("month")}
              >
                6 tháng
              </button>
            </div>
          </div>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart
                data={revenueData}
                margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="name"
                  stroke="#64748b"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  interval={0}
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  stroke="#64748b"
                  tickFormatter={(value) => {
                    if (value >= 1000000)
                      return `${(value / 1000000).toFixed(1)}M`;
                    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                    return value.toString();
                  }}
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "8px 12px",
                  }}
                  labelStyle={{ marginBottom: "4px", fontWeight: 600 }}
                />
                <Bar
                  dataKey="value"
                  fill="#4f46e5"
                  radius={[8, 8, 0, 0]}
                  label={{
                    position: "top",
                    formatter: (value) => {
                      if (value >= 1000000)
                        return `${(value / 1000000).toFixed(1)}M`;
                      if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                      return value > 0 ? value.toString() : "";
                    },
                    style: {
                      fontSize: "11px",
                      fill: "#64748b",
                      fontWeight: 600,
                    },
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Orders Status Pie Chart */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3>Phân bổ đơn hàng theo trạng thái</h3>
          </div>
          <div className="chart-container">
            {ordersByStatusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={ordersByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {ordersByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="chart-placeholder">
                <i className="ri-pie-chart-line"></i>
                <p>Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Products and Recent Orders Row */}
      <div className="dashboard-bottom">
        {/* Top Products */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3>Top sản phẩm bán chạy</h3>
          </div>
          <div className="top-products-list">
            {topProducts.length > 0 ? (
              topProducts.map((product, index) => (
                <div key={product.id} className="top-product-item">
                  <div className="top-product-rank">#{index + 1}</div>
                  <div className="top-product-info">
                    <h4>{product.name}</h4>
                    <p>
                      <i className="ri-shopping-cart-line"></i>
                      Đã bán: <strong>{product.sold.toLocaleString()}</strong>
                    </p>
                    <p>
                      <i className="ri-money-dollar-circle-line"></i>
                      Giá: <strong>{formatCurrency(product.price)}</strong>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">
                <i className="ri-box-line"></i>
                <p>Chưa có sản phẩm nào</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h3>Đơn hàng gần đây</h3>
            {setActiveTab && (
              <button
                className="btn btn--ghost btn-sm"
                onClick={() => setActiveTab("orders")}
              >
                Xem tất cả
              </button>
            )}
          </div>
          <div className="recent-orders-list">
            {recentOrders.length === 0 ? (
              <div className="empty-state">
                <i className="ri-shopping-bag-line"></i>
                <p>Chưa có đơn hàng nào</p>
              </div>
            ) : (
              recentOrders.slice(0, 5).map((order) => (
                <div key={order.id} className="recent-order-item">
                  <div className="recent-order-header">
                    <strong>{order.orderCode || `#${order.id}`}</strong>
                    <span className={`badge badge--${order.status}`}>
                      {order.status === "pending" && "Chờ xử lý"}
                      {order.status === "confirmed" && "Đã xác nhận"}
                      {order.status === "shipping" && "Đang giao"}
                      {order.status === "delivered" && "Đã giao"}
                      {order.status === "cancelled" && "Đã hủy"}
                    </span>
                  </div>
                  <div className="recent-order-content">
                    <p>
                      <i className="ri-user-line"></i>
                      {order.customerName || `Khách hàng #${order.userId}`}
                    </p>
                    <p>
                      <i className="ri-money-dollar-circle-line"></i>
                      {formatCurrency(order.finalAmount)}
                    </p>
                    <p>
                      <i className="ri-time-line"></i>
                      {new Date(
                        order.createdAt || order.created_at || order.orderDate
                      ).toLocaleString("vi-VN")}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Manage Users Component
function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      setLoading(true);
      const data = await adminApi.getAllUsers();
      // Ensure data is an array
      if (Array.isArray(data)) {
        // Đảm bảo mỗi user có status (mặc định là 'active' nếu không có)
        const usersWithStatus = data.map((user) => ({
          ...user,
          status: user.status || "active",
          statusText:
            user.statusText ||
            (user.status === "banned"
              ? "Đã khóa"
              : user.status === "inactive"
              ? "Không hoạt động"
              : "Hoạt động"),
          statusBadge:
            user.statusBadge ||
            (user.status === "banned"
              ? "locked"
              : user.status === "inactive"
              ? "inactive"
              : "active"),
          locked:
            user.locked !== undefined ? user.locked : user.status === "banned",
        }));
        setUsers(usersWithStatus);
        console.log(
          `✅ Đã tải ${usersWithStatus.length} người dùng từ database`,
          usersWithStatus
        );
      } else {
        console.error("Invalid data format:", data);
        setUsers([]);
        alert(
          "Lỗi: Dữ liệu không đúng định dạng. Vui lòng kiểm tra backend response."
        );
      }
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
      const errorMsg = error.message || "Không thể kết nối đến server";
      alert(
        `Lỗi khi tải danh sách người dùng: ${errorMsg}\n\nVui lòng kiểm tra:\n1. Backend có đang chạy tại http://localhost:3000 không?\n2. Đã đăng nhập với tài khoản admin chưa?\n3. Kiểm tra console để xem chi tiết lỗi.`
      );
    } finally {
      setLoading(false);
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      (user.phone && user.phone.includes(search))
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  async function handleToggleLock(userId) {
    try {
      await adminApi.toggleUserLock(userId);
      // Reload danh sách từ database sau khi khóa/mở khóa
      await loadUsers();
    } catch (error) {
      console.error("Error toggling lock:", error);
      alert("Lỗi: " + (error.message || "Không thể thay đổi trạng thái"));
    }
  }

  async function handleDelete(userId) {
    if (window.confirm("Bạn có chắc chắn muốn xóa người dùng này?")) {
      try {
        await adminApi.deleteUser(userId);
        alert("Xóa người dùng thành công!");
        // Reload danh sách từ database
        await loadUsers();
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Lỗi: " + (error.message || "Không thể xóa người dùng"));
      }
    }
  }

  return (
    <>
      <div className="admin-card manage-services-card">
        <div className="admin-card__header">
          <div className="admin-actions">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              className="admin-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
        <div className="admin-table users-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Ngày tham gia</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || "-"}</td>
                    <td>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString("vi-VN")
                        : "-"}
                    </td>
                    <td>
                      <div className="admin-actions-inline">
                        <button
                          className={`btn btn--ghost btn-sm ${
                            user.locked ? "success" : "warning"
                          }`}
                          onClick={() => handleToggleLock(user.id)}
                          title={user.locked ? "Mở khóa" : "Khóa tài khoản"}
                        >
                          <i
                            className={
                              user.locked
                                ? "ri-lock-unlock-line"
                                : "ri-lock-line"
                            }
                          ></i>
                        </button>
                        <button
                          className="btn btn--ghost btn-sm danger"
                          onClick={() => handleDelete(user.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>
    </>
  );
}

// Manage Employees Component
function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "employee",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isFormValid, setIsFormValid] = useState(false);
  const [formTouched, setFormTouched] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Validation rules
  const validators = {
    name: (value) => {
      if (!value || value.trim().length < 4) {
        return "Họ và tên phải ít nhất 4 ký tự";
      }
      // Allow letters (including accented), spaces, and Vietnamese characters
      const nameRe = /^[\p{L} ]+$/u;
      if (!nameRe.test(value.trim())) {
        return "Họ và tên không được chứa số hoặc kí tự đặc biệt";
      }
      return "";
    },
    email: (value) => {
      if (!value) return "Email là bắt buộc";
      // Gmail only
      const emailRe = /^[a-zA-Z0-9._%+-]+@gmail\.com$/i;
      if (!emailRe.test(value.trim()))
        return "Vui lòng nhập email dạng @gmail.com";
      return "";
    },
    phone: (value) => {
      if (!value) return "Số điện thoại là bắt buộc";
      const phoneRe = /^\d{10}$/;
      if (!phoneRe.test(value.trim()))
        return "Số điện thoại phải đủ 10 chữ số và không chứa ký tự khác";
      return "";
    },
    password: (value) => {
      if (!value) return "Mật khẩu là bắt buộc";
      // At least 8 chars, uppercase, lowercase, digit, special char
      const passRe = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passRe.test(value))
        return "Mật khẩu ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt";
      return "";
    },
  };

  // Validate a single field and update errors
  function validateField(field, value) {
    const validator = validators[field];
    if (!validator) return "";
    const message = validator(value || "");
    setFormErrors((prev) => ({ ...prev, [field]: message }));
    setFormTouched((prev) => ({ ...prev, [field]: true }));
    return message === "";
  }

  // Validate the entire form whenever formData changes
  useEffect(() => {
    const newErrors = {};
    Object.keys(validators).forEach((field) => {
      const msg = validators[field](formData[field]);
      if (msg) newErrors[field] = msg;
    });
    setFormErrors(newErrors);
    setIsFormValid(Object.keys(newErrors).length === 0);
  }, [formData]);

  useEffect(() => {
    loadEmployees();
  }, []);

  async function loadEmployees() {
    try {
      setLoading(true);
      const data = await adminApi.getAllEmployees();
      // Ensure data is an array
      if (Array.isArray(data)) {
        // Đảm bảo mỗi employee có status (mặc định là 'active' nếu không có)
        const employeesWithStatus = data.map((emp) => ({
          ...emp,
          status: emp.status || "active",
          statusText:
            emp.statusText ||
            (emp.status === "banned"
              ? "Đã khóa"
              : emp.status === "inactive"
              ? "Không hoạt động"
              : "Hoạt động"),
          statusBadge:
            emp.statusBadge ||
            (emp.status === "banned"
              ? "locked"
              : emp.status === "inactive"
              ? "inactive"
              : "active"),
          locked:
            emp.locked !== undefined ? emp.locked : emp.status === "banned",
        }));
        setEmployees(employeesWithStatus);
        console.log(
          `✅ Đã tải ${employeesWithStatus.length} nhân viên từ database`,
          employeesWithStatus
        );
      } else {
        console.error("Invalid data format:", data);
        setEmployees([]);
        alert(
          "Lỗi: Dữ liệu không đúng định dạng. Vui lòng kiểm tra backend response."
        );
      }
    } catch (error) {
      console.error("Error loading employees:", error);
      setEmployees([]);
      const errorMsg = error.message || "Không thể kết nối đến server";
      alert(
        `Lỗi khi tải danh sách nhân viên: ${errorMsg}\n\nVui lòng kiểm tra:\n1. Backend có đang chạy tại http://localhost:3000 không?\n2. Đã đăng nhập với tài khoản admin chưa?\n3. Kiểm tra console để xem chi tiết lỗi.`
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleLock(employeeId) {
    try {
      await adminApi.toggleUserLock(employeeId);
      // Reload danh sách từ database sau khi khóa/mở khóa
      await loadEmployees();
    } catch (error) {
      console.error("Error toggling lock:", error);
      alert("Lỗi: " + (error.message || "Không thể thay đổi trạng thái"));
    }
  }

  async function handleDelete(employeeId) {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này?")) {
      try {
        await adminApi.deleteUser(employeeId);
        alert("Xóa nhân viên thành công!");
        // Reload danh sách từ database
        await loadEmployees();
      } catch (error) {
        console.error("Error deleting employee:", error);
        alert("Lỗi: " + (error.message || "Không thể xóa nhân viên"));
      }
    }
  }

  const handleAdd = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      role: "employee",
    });
    setFormErrors({});
    setFormTouched({});
    setIsFormValid(false);
    setShowPassword(false);
    setShowAddModal(true);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    // Final validation before submit
    if (!isFormValid) {
      alert(
        "Không thể thêm: vui lòng sửa các lỗi trong form trước khi tiếp tục."
      );
      return;
    }

    try {
      await adminApi.createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password || "123456",
        role: "employee",
      });
      alert("Thêm nhân viên thành công!");
      setShowAddModal(false);
      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        password: "",
        role: "employee",
      });
      setFormErrors({});
      setFormTouched({});
      setIsFormValid(false);
      setShowPassword(false);
      // Reload danh sách từ database
      await loadEmployees();
    } catch (error) {
      console.error("Error creating employee:", error);
      alert("Lỗi: " + (error.message || "Không thể lưu dữ liệu"));
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedEmployees = employees.slice(startIndex, endIndex);

  // Debug log: show normalized status values for current page
  console.log(
    "🔍 ManageEmployees - paginatedEmployees statuses:",
    paginatedEmployees.map((e) => ({
      id: e.id,
      status: e.status,
      statusText: e.statusText,
      statusBadge: e.statusBadge,
      locked: e.locked,
    }))
  );

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__header">
          <button className="btn" onClick={handleAdd}>
            Thêm nhân viên
          </button>
        </div>
        <div className="admin-table employees-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan="5"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Chưa có nhân viên nào
                  </td>
                </tr>
              ) : (
                paginatedEmployees.map((emp) => {
                  return (
                    <tr key={emp.id}>
                      <td>{emp.id}</td>
                      <td>
                        <strong>{emp.name}</strong>
                      </td>
                      <td>{emp.email}</td>
                      <td>
                        {emp.role === "employee"
                          ? "Nhân viên"
                          : emp.role === "admin"
                          ? "Quản trị viên"
                          : emp.role || "Nhân viên"}
                      </td>
                      <td>
                        <div className="admin-actions-inline">
                          <button
                            className={`btn btn--ghost btn-sm ${
                              emp.locked ? "success" : "warning"
                            }`}
                            onClick={() => handleToggleLock(emp.id)}
                            g
                            title={emp.locked ? "Mở khóa" : "Khóa tài khoản"}
                          >
                            <i
                              className={
                                emp.locked
                                  ? "ri-lock-unlock-line"
                                  : "ri-lock-line"
                              }
                            ></i>
                          </button>
                          <button
                            className="btn btn--ghost btn-sm danger"
                            onClick={() => handleDelete(emp.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowAddModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>Thêm nhân viên</h3>
              <button
                className="admin-modal__close"
                onClick={() => setShowAddModal(false)}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__body">
              <div className="form-group">
                <label>Họ tên *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData({ ...formData, name: v });
                    validateField("name", v);
                    setFormTouched((prev) => ({ ...prev, name: true }));
                  }}
                />
                {formTouched.name &&
                  (formErrors.name ? (
                    <small className="form-error" style={{ color: "red" }}>
                      {formErrors.name}
                    </small>
                  ) : (
                    <small className="form-success" style={{ color: "green" }}>
                      Hợp lệ
                    </small>
                  ))}
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData({ ...formData, email: v });
                    validateField("email", v);
                    setFormTouched((prev) => ({ ...prev, email: true }));
                  }}
                />
                {formTouched.email &&
                  (formErrors.email ? (
                    <small className="form-error" style={{ color: "red" }}>
                      {formErrors.email}
                    </small>
                  ) : (
                    <small className="form-success" style={{ color: "green" }}>
                      Hợp lệ
                    </small>
                  ))}
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    const v = e.target.value;
                    setFormData({ ...formData, phone: v });
                    validateField("phone", v);
                    setFormTouched((prev) => ({ ...prev, phone: true }));
                  }}
                />
                {formTouched.phone &&
                  (formErrors.phone ? (
                    <small className="form-error" style={{ color: "red" }}>
                      {formErrors.phone}
                    </small>
                  ) : (
                    <small className="form-success" style={{ color: "green" }}>
                      Hợp lệ
                    </small>
                  ))}
              </div>
              <div className="form-group">
                <label>Vai trò *</label>
                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({ ...formData, role: e.target.value })
                  }
                >
                  <option value="employee">Nhân viên</option>
                </select>
                <small
                  style={{
                    color: "var(--muted)",
                    display: "block",
                    marginTop: "4px",
                  }}
                >
                  Vai trò mặc định: Nhân viên
                </small>
              </div>
              <div className="form-group">
                <label>Mật khẩu *</label>
                <div
                  className="password-input-wrapper"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={formData.password}
                    onChange={(e) => {
                      const v = e.target.value;
                      setFormData({ ...formData, password: v });
                      validateField("password", v);
                    }}
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    className="btn btn--icon"
                    onClick={() => setShowPassword((s) => !s)}
                    style={{ marginLeft: "8px" }}
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  >
                    <i
                      className={
                        showPassword ? "ri-eye-off-line" : "ri-eye-line"
                      }
                    ></i>
                  </button>
                </div>
                {formTouched.password &&
                  (formErrors.password ? (
                    <small className="form-error" style={{ color: "red" }}>
                      {formErrors.password}
                    </small>
                  ) : (
                    <small className="form-success" style={{ color: "green" }}>
                      Hợp lệ
                    </small>
                  ))}
              </div>
              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn"
                  disabled={!isFormValid}
                  title={
                    !isFormValid ? "Vui lòng sửa lỗi trước khi thêm" : "Thêm"
                  }
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Manage Categories Component
function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "active",
  });
  const [showProductsModal, setShowProductsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [productSort, setProductSort] = useState("newest");

  useEffect(() => {
    loadCategories();
  }, []);

  async function loadCategories() {
    try {
      setLoading(true);
      const data = await adminApi.getAllCategoriesAdmin();
      setCategories(data);
    } catch (error) {
      alert("Lỗi khi tải danh sách danh mục: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleAdd = () => {
    setEditingCategory(null);
    setFormData({ name: "", description: "", status: "active" });
    setShowAddModal(true);
  };

  async function handleEdit(category) {
    try {
      // Load latest data from API to ensure we have the most up-to-date information
      const latestCategory = await adminApi.getCategoryByIdAdmin(category.id);
      setEditingCategory(latestCategory);
      setFormData({
        name: latestCategory.name || "",
        description: latestCategory.description || "",
        status: latestCategory.status || "active",
      });
      setShowAddModal(true);
    } catch (error) {
      console.error("Error loading category:", error);
      // Fallback to using the category from the list
      setEditingCategory(category);
      setFormData({
        name: category.name,
        description: category.description || "",
        status: category.status || "active",
      });
      setShowAddModal(true);
    }
  }

  async function handleDelete(categoryId) {
    if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
      try {
        const response = await adminApi.deleteCategory(categoryId);
        alert(response.message || "Xóa danh mục thành công!");
        // Reload danh sách từ database
        await loadCategories();
      } catch (error) {
        console.error("Error deleting category:", error);
        alert("Lỗi: " + (error.message || "Không thể xóa danh mục"));
      }
    }
  }

  async function handleViewProducts(category) {
    try {
      setSelectedCategory(category);
      setShowProductsModal(true);
      setProductsLoading(true);
      setCategoryProducts([]);

      const data = await adminApi.getCategoryProducts(
        category.id,
        productSearch,
        productSort
      );
      setCategoryProducts(data.products || []);
    } catch (error) {
      console.error("Error loading category products:", error);
      alert(
        "Lỗi khi tải danh sách sản phẩm: " +
          (error.message || "Không thể kết nối đến server")
      );
      setShowProductsModal(false);
    } finally {
      setProductsLoading(false);
    }
  }

  async function loadCategoryProducts() {
    if (!selectedCategory) return;
    try {
      setProductsLoading(true);
      const data = await adminApi.getCategoryProducts(
        selectedCategory.id,
        productSearch,
        productSort
      );
      setCategoryProducts(data.products || []);
    } catch (error) {
      console.error("Error loading category products:", error);
      alert(
        "Lỗi khi tải danh sách sản phẩm: " +
          (error.message || "Không thể kết nối đến server")
      );
    } finally {
      setProductsLoading(false);
    }
  }

  // Load products when search or sort changes
  useEffect(() => {
    if (showProductsModal && selectedCategory) {
      const timer = setTimeout(() => {
        loadCategoryProducts();
      }, 300); // Debounce search
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productSearch, productSort]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminApi.updateCategory(editingCategory.id, formData);
        alert("Cập nhật danh mục thành công!");
      } else {
        await adminApi.createCategory(formData);
        alert("Thêm danh mục thành công!");
      }
      setShowAddModal(false);
      // Reload danh sách từ database
      await loadCategories();
    } catch (error) {
      console.error("Error saving category:", error);
      alert("Lỗi: " + (error.message || "Không thể lưu danh mục"));
    }
  }

  // Pagination logic
  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCategories = categories.slice(startIndex, endIndex);

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__header">
          <button className="btn" onClick={handleAdd}>
            Thêm danh mục
          </button>
        </div>
        <div className="admin-grid">
          {loading ? (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              Đang tải...
            </div>
          ) : categories.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                textAlign: "center",
                padding: "2rem",
              }}
            >
              Chưa có danh mục nào
            </div>
          ) : (
            paginatedCategories.map((cat) => (
              <div key={cat.id} className="category-card">
                <div className="category-card__content">
                  <h4 className="category-card__title">{cat.name}</h4>
                  {cat.description && (
                    <p className="category-card__description">
                      {cat.description}
                    </p>
                  )}
                  <div className="category-card__actions">
                    <button
                      className="btn btn--ghost btn-sm"
                      onClick={() => handleEdit(cat)}
                    >
                      Sửa
                    </button>
                    <button
                      className="btn btn--ghost btn-sm"
                      onClick={() => handleViewProducts(cat)}
                    >
                      Xem sản phẩm
                    </button>
                    <button
                      className="btn btn--ghost btn-sm danger"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="admin-modal category-form-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3>
                <i className="ri-folder-line"></i>
                {editingCategory ? "Sửa danh mục" : "Thêm danh mục"}
              </h3>
              <button
                className="admin-modal__close"
                onClick={() => setShowAddModal(false)}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__body">
              <div className="form-group">
                <label>
                  <i className="ri-text"></i>
                  Tên danh mục *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nhập tên danh mục"
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="ri-file-text-line"></i>
                  Mô tả
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Nhập mô tả danh mục (tùy chọn)"
                  rows="4"
                  className="form-textarea"
                />
              </div>
              <div className="form-group">
                <label>
                  <i className="ri-toggle-line"></i>
                  Trạng thái *
                </label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                  className="form-select"
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                </select>
              </div>
              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  <i className="ri-close-line"></i>
                  Hủy
                </button>
                <button type="submit" className="btn btn--primary">
                  <i
                    className={editingCategory ? "ri-save-line" : "ri-add-line"}
                  ></i>
                  {editingCategory ? "Cập nhật" : "Thêm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products Modal */}
      {showProductsModal && selectedCategory && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setShowProductsModal(false);
            setSelectedCategory(null);
            setCategoryProducts([]);
            setProductSearch("");
            setProductSort("newest");
          }}
        >
          <div
            className="admin-modal products-view-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3>
                <i className="ri-shopping-bag-line"></i>
                Sản phẩm của danh mục:{" "}
                <span className="category-name">{selectedCategory.name}</span>
              </h3>
              <button
                className="admin-modal__close"
                onClick={() => {
                  setShowProductsModal(false);
                  setSelectedCategory(null);
                  setCategoryProducts([]);
                  setProductSearch("");
                  setProductSort("newest");
                }}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="admin-modal__body">
              {/* Filters */}
              <div className="products-filters">
                <div className="filter-search">
                  <i className="ri-search-line"></i>
                  <input
                    type="text"
                    placeholder="Tìm kiếm sản phẩm..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="filter-input"
                  />
                </div>
                <div className="filter-sort">
                  <i className="ri-sort-desc"></i>
                  <select
                    value={productSort}
                    onChange={(e) => setProductSort(e.target.value)}
                    className="filter-select"
                  >
                    <option value="newest">Mới nhất</option>
                    <option value="name-asc">Tên A-Z</option>
                    <option value="price-asc">Giá tăng dần</option>
                    <option value="price-desc">Giá giảm dần</option>
                    <option value="sold-desc">Bán chạy</option>
                  </select>
                </div>
              </div>

              {/* Products Table */}
              {productsLoading ? (
                <div className="products-loading">
                  <i className="ri-loader-4-line"></i>
                  <p>Đang tải sản phẩm...</p>
                </div>
              ) : categoryProducts.length === 0 ? (
                <div className="products-empty">
                  <i className="ri-inbox-line"></i>
                  <p>
                    {productSearch
                      ? "Không tìm thấy sản phẩm phù hợp"
                      : "Danh mục này chưa có sản phẩm nào"}
                  </p>
                </div>
              ) : (
                <div className="products-table-wrapper">
                  <div className="admin-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Ảnh</th>
                          <th>Tên sản phẩm</th>
                          <th>Thương hiệu</th>
                          <th>Giá bán</th>
                          <th>Đã bán</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {categoryProducts.map((product) => (
                          <tr key={product.id}>
                            <td>
                              <div className="product-image">
                                <img
                                  src={product.img || "/img/placeholder.jpg"}
                                  alt={product.name}
                                  onError={(e) => {
                                    e.currentTarget.src =
                                      "/img/placeholder.jpg";
                                  }}
                                />
                              </div>
                            </td>
                            <td>
                              <div className="product-name">
                                <strong>{product.name}</strong>
                                {product.shortDescription && (
                                  <small>
                                    {product.shortDescription.length > 50
                                      ? `${product.shortDescription.substring(
                                          0,
                                          50
                                        )}...`
                                      : product.shortDescription}
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="product-brand">
                                {product.brand || "-"}
                              </span>
                            </td>
                            <td>
                              <div className="product-price">
                                <strong>
                                  {Number(product.price).toLocaleString(
                                    "vi-VN"
                                  )}
                                  đ
                                </strong>
                                {product.oldPrice && (
                                  <small>
                                    {Number(product.oldPrice).toLocaleString(
                                      "vi-VN"
                                    )}
                                    đ
                                  </small>
                                )}
                              </div>
                            </td>
                            <td>
                              <span className="product-sold">
                                {product.sold?.toLocaleString() || 0}
                              </span>
                            </td>
                            <td>{/* status badge removed for modal view */}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="products-summary">
                    <i className="ri-file-list-line"></i>
                    <span>
                      Tổng: <strong>{categoryProducts.length}</strong> sản phẩm
                    </span>
                  </div>
                </div>
              )}
            </div>
            <div className="admin-modal__footer">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setShowProductsModal(false);
                  setSelectedCategory(null);
                  setCategoryProducts([]);
                  setProductSearch("");
                  setProductSort("newest");
                }}
              >
                <i className="ri-close-line"></i>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Manage Products Component
function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(() => ({
    ...PRODUCT_FORM_TEMPLATE,
  }));
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [imageUploadMethod, setImageUploadMethod] = useState({
    img: "url",
    cover: "url",
  }); // "url" or "file"
  const [imagePreview, setImagePreview] = useState({ img: "", cover: "" });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, [searchQuery, categoryFilter, sortBy]);

  async function loadCategories() {
    try {
      const data = await adminApi.getAllCategoriesAdmin();
      setCategories(data);
      if (data.length > 0 && !formData.categoryId) {
        setFormData((prev) => ({
          ...prev,
          categoryId: data[0].id,
        }));
      }
    } catch (error) {
      console.error("Error loading categories:", error);
    }
  }

  async function loadProducts() {
    try {
      setLoading(true);
      const data = await adminApi.getAllProductsAdmin(
        searchQuery,
        categoryFilter,
        sortBy
      );
      setProducts(data);
    } catch (error) {
      alert("Lỗi khi tải danh sách sản phẩm: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true);
    // Reset tất cả filters về trạng thái ban đầu
    setSearchQuery("");
    setCategoryFilter("all");
    setSortBy("newest");
    // Reload cả categories và products để đảm bảo dữ liệu mới nhất
    try {
      await Promise.all([loadCategories(), loadProducts()]);
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      // Đợi một chút để hiển thị animation refresh
      setTimeout(() => {
        setRefreshing(false);
      }, 300);
    }
  };

  const categoryNames = categories.map((cat) => cat.name);

  // Products are already filtered and sorted by API
  const sortedProducts = products;

  // Pagination logic
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = sortedProducts.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, categoryFilter, sortBy]);

  const totalValue = products.reduce(
    (sum, product) => sum + (Number(product.price) || 0),
    0
  );
  const avgPrice = products.length
    ? Math.round(totalValue / products.length)
    : 0;
  const bestSeller = products.reduce((best, product) => {
    if (!best) return product;
    return (product.sold || 0) > (best.sold || 0) ? product : best;
  }, null);

  const handleAdd = () => {
    setEditingProduct(null);
    setFormData({
      ...PRODUCT_FORM_TEMPLATE,
      categoryId: categories[0]?.id || "",
    });
    setImageUploadMethod({ img: "url", cover: "url" });
    setImagePreview({ img: "", cover: "" });
    setShowModal(true);
  };

  async function handleEdit(product) {
    try {
      const latestProduct = await adminApi.getProductByIdAdmin(product.id);
      setEditingProduct(latestProduct);
      const imgValue = latestProduct.img || "";
      const coverValue = latestProduct.cover || "";
      setFormData({
        name: latestProduct.name || "",
        price:
          latestProduct.price !== undefined ? String(latestProduct.price) : "",
        oldPrice: latestProduct.oldPrice ? String(latestProduct.oldPrice) : "",
        categoryId: latestProduct.categoryId || categories[0]?.id || "",
        brand: latestProduct.brand || "",
        img: imgValue,
        cover: coverValue,
        saleLabel: latestProduct.saleLabel || "",
        rating:
          latestProduct.rating !== undefined
            ? String(latestProduct.rating)
            : "0",
        sold:
          latestProduct.sold !== undefined ? String(latestProduct.sold) : "0",
        desc: latestProduct.description || "",
        shortDescription: latestProduct.shortDescription || "",
        status: latestProduct.status || "active",
      });
      // Xác định method upload dựa trên giá trị (base64 hoặc URL)
      setImageUploadMethod({
        img: imgValue.startsWith("data:") ? "file" : "url",
        cover: coverValue.startsWith("data:") ? "file" : "url",
      });
      setImagePreview({ img: imgValue, cover: coverValue });
      setShowModal(true);
    } catch (error) {
      alert("Lỗi khi tải thông tin sản phẩm: " + error.message);
    }
  }

  async function handleDelete(productId) {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        const response = await adminApi.deleteProduct(productId);
        alert(response.message || "Xóa sản phẩm thành công!");
        // Reload danh sách từ database
        await loadProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
        alert("Lỗi: " + (error.message || "Không thể xóa sản phẩm"));
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      ...PRODUCT_FORM_TEMPLATE,
      categoryId: categories[0]?.id || "",
    });
    setImageUploadMethod({ img: "url", cover: "url" });
    setImagePreview({ img: "", cover: "" });
  };

  const handleImageFileChange = (type) => (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh hợp lệ");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview((prev) => ({ ...prev, [type]: base64String }));
        setFormData((prev) => ({ ...prev, [type]: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (type) => (e) => {
    const url = e.target.value;
    setFormData((prev) => ({ ...prev, [type]: url }));
    setImagePreview((prev) => ({ ...prev, [type]: url }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      alert("Tên sản phẩm là bắt buộc");
      return false;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      alert("Giá bán phải lớn hơn 0");
      return false;
    }
    if (!formData.categoryId) {
      alert("Vui lòng chọn danh mục");
      return false;
    }
    return true;
  };

  const buildPayload = () => ({
    name: formData.name.trim(),
    price: Number(formData.price),
    oldPrice: formData.oldPrice ? Number(formData.oldPrice) : null,
    categoryId: Number(formData.categoryId),
    brand: formData.brand ? formData.brand.trim() : "",
    img: formData.img ? formData.img.trim() : "",
    cover: formData.cover ? formData.cover.trim() : "",
    saleLabel: formData.saleLabel ? formData.saleLabel.trim() : "",
    rating: formData.rating ? Number(formData.rating) : 0,
    sold: formData.sold ? Number(formData.sold) : 0,
    desc: formData.desc ? formData.desc.trim() : "",
    shortDescription: formData.shortDescription
      ? formData.shortDescription.trim()
      : "",
    status: formData.status || "active",
  });

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = buildPayload();
      if (editingProduct) {
        await adminApi.updateProduct(editingProduct.id, payload);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await adminApi.createProduct(payload);
        alert("Thêm sản phẩm thành công!");
      }
      // Reload danh sách từ database
      await loadProducts();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving product:", error);
      alert("Lỗi: " + (error.message || "Không thể lưu sản phẩm"));
    }
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return `${Number(value).toLocaleString("vi-VN")}đ`;
  };

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-actions">
            <button
              className="btn btn--ghost"
              onClick={handleRefresh}
              disabled={refreshing}
            >
              <i className="ri-refresh-line"></i>{" "}
              {refreshing ? "Đang tải..." : "Tải lại"}
            </button>
            <button className="btn" onClick={handleAdd}>
              <i className="ri-add-line"></i> Thêm sản phẩm
            </button>
          </div>
        </div>

        <div
          className="admin-stats"
          style={{ marginBottom: "var(--space-lg)" }}
        >
          <div className="stat-card">
            <div
              className="stat-card__icon"
              style={{
                background: "var(--primary-bg)",
                color: "var(--primary)",
              }}
            >
              <i className="ri-box-3-line"></i>
            </div>
            <div className="stat-card__content">
              <h3>{products.length}</h3>
              <p>Tổng sản phẩm</p>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-card__icon"
              style={{
                background: "var(--success-bg)",
                color: "var(--success)",
              }}
            >
              <i className="ri-stack-line"></i>
            </div>
            <div className="stat-card__content">
              <h3>{categoryNames.length}</h3>
              <p>Danh mục đang có</p>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-card__icon"
              style={{
                background: "var(--warning-bg)",
                color: "var(--warning)",
              }}
            >
              <i className="ri-price-tag-3-line"></i>
            </div>
            <div className="stat-card__content">
              <h3>{formatCurrency(avgPrice)}</h3>
              <p>Giá trung bình</p>
            </div>
          </div>
          <div className="stat-card">
            <div
              className="stat-card__icon"
              style={{ background: "var(--error-bg)", color: "var(--error)" }}
            >
              <i className="ri-fire-line"></i>
            </div>
            <div className="stat-card__content">
              <h3>{bestSeller ? bestSeller.name : "-"}</h3>
              <p>
                Bán chạy nhất{" "}
                {bestSeller
                  ? `(${bestSeller.sold?.toLocaleString() || 0})`
                  : ""}
              </p>
            </div>
          </div>
        </div>

        <div className="admin-table__filters">
          <form
            className="admin-search-form"
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div className="admin-search-wrapper">
              <input
                type="text"
                placeholder="Tìm theo tên, danh mục, thương hiệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
              <button type="submit" className="admin-search-btn">
                <i className="ri-search-line"></i> Tìm
              </button>
            </div>
          </form>
          <div className="admin-product-filters">
            <label className="admin-filter-label">Danh mục:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="admin-filter-select"
            >
              <option value="all">Tất cả danh mục</option>
              {categoryNames.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            <label className="admin-filter-label">Sắp xếp:</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="admin-filter-select"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
              <option value="sold-desc">Bán chạy</option>
            </select>
          </div>
        </div>

        <div className="admin-table">
          {sortedProducts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              {searchQuery || categoryFilter !== "all"
                ? "Không tìm thấy sản phẩm phù hợp"
                : "Chưa có sản phẩm nào"}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá bán</th>
                  <th>Đã bán</th>
                  <th>Đánh giá</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedProducts.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img
                        src={product.img || "/img/placeholder.jpg"}
                        alt={product.name}
                        style={{
                          width: "56px",
                          height: "56px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid var(--line)",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/img/placeholder.jpg";
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ maxWidth: "260px" }}>
                        <strong>{product.name}</strong>
                        <br />
                        <small style={{ color: "var(--muted)" }}>
                          {product.brand || "Chưa có thương hiệu"}
                        </small>
                        {product.sale && (
                          <span
                            className="badge badge--info"
                            style={{ marginLeft: 8 }}
                          >
                            {product.sale}
                          </span>
                        )}
                        {product.desc && (
                          <>
                            <br />
                            <small style={{ color: "var(--muted)" }}>
                              {product.desc.length > 60
                                ? `${product.desc.substring(0, 60)}...`
                                : product.desc}
                            </small>
                          </>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge--info">
                        {product.categoryName || product.cat}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <strong>{formatCurrency(product.price)}</strong>
                        {product.oldPrice && (
                          <small
                            style={{
                              textDecoration: "line-through",
                              color: "var(--muted)",
                            }}
                          >
                            {formatCurrency(product.oldPrice)}
                          </small>
                        )}
                      </div>
                    </td>
                    <td>{product.sold?.toLocaleString() || 0}</td>
                    <td>
                      {product.rating
                        ? Number(product.rating).toFixed(1)
                        : "0.0"}
                    </td>
                    <td>
                      <span
                        className={`badge badge--${
                          product.status === "active" ? "active" : "inactive"
                        }`}
                      >
                        {product.status === "active"
                          ? "Hoạt động"
                          : product.status === "inactive"
                          ? "Không hoạt động"
                          : product.status === "draft"
                          ? "Bản nháp"
                          : "Không xác định"}
                      </span>
                    </td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          className="btn btn--ghost btn-sm"
                          onClick={() => handleEdit(product)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn--ghost btn-sm danger"
                          onClick={() => handleDelete(product.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {showModal && (
        <div className="admin-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="admin-modal product-form-modal"
            style={{ maxWidth: "900px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3>{editingProduct ? "Sửa sản phẩm" : "Thêm sản phẩm"}</h3>
              <button className="admin-modal__close" onClick={handleCloseModal}>
                <i className="ri-close-line"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal__body">
              <div className="form-group">
                <label>Tên sản phẩm *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ví dụ: Vitamin C 1000mg"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label>Danh mục *</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) =>
                      setFormData({ ...formData, categoryId: e.target.value })
                    }
                  >
                    {categories.length === 0 ? (
                      <option value="">Chưa có danh mục</option>
                    ) : (
                      categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))
                    )}
                  </select>
                  {categories.length === 0 && (
                    <small style={{ color: "var(--muted)" }}>
                      Vui lòng thêm danh mục trước ở tab Danh mục
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Thương hiệu</label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) =>
                      setFormData({ ...formData, brand: e.target.value })
                    }
                    placeholder="Ví dụ: Hiệu thuốc Việt"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label>Giá bán *</label>
                  <input
                    type="number"
                    min="1000"
                    step="1000"
                    required
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="Ví dụ: 150000"
                  />
                </div>
                <div className="form-group">
                  <label>Giá gốc</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.oldPrice}
                    onChange={(e) =>
                      setFormData({ ...formData, oldPrice: e.target.value })
                    }
                    placeholder="Nếu có"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Nhãn hiển thị (Sale/NEW)</label>
                <input
                  type="text"
                  value={formData.saleLabel}
                  onChange={(e) =>
                    setFormData({ ...formData, saleLabel: e.target.value })
                  }
                  placeholder="-25% hoặc NEW"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label>Ảnh sản phẩm</label>
                  <div className="image-upload-tabs">
                    <button
                      type="button"
                      className={`upload-tab ${
                        imageUploadMethod.img === "url" ? "active" : ""
                      }`}
                      onClick={() =>
                        setImageUploadMethod((prev) => ({
                          ...prev,
                          img: "url",
                        }))
                      }
                    >
                      <i className="ri-link"></i> Link URL
                    </button>
                    <button
                      type="button"
                      className={`upload-tab ${
                        imageUploadMethod.img === "file" ? "active" : ""
                      }`}
                      onClick={() =>
                        setImageUploadMethod((prev) => ({
                          ...prev,
                          img: "file",
                        }))
                      }
                    >
                      <i className="ri-upload-2-line"></i> Tải lên
                    </button>
                  </div>
                  {imageUploadMethod.img === "url" ? (
                    <input
                      type="text"
                      value={formData.img}
                      onChange={handleImageUrlChange("img")}
                      placeholder="/img/product.png hoặc https://..."
                    />
                  ) : (
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange("img")}
                        style={{ marginBottom: "8px" }}
                      />
                      <small
                        style={{ color: "var(--muted)", display: "block" }}
                      >
                        JPG, PNG hoặc GIF. Tối đa 5MB
                      </small>
                    </div>
                  )}
                  {(imagePreview.img || formData.img) && (
                    <div className="image-preview" style={{ marginTop: "8px" }}>
                      <img
                        src={imagePreview.img || formData.img}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: "180px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid var(--line)",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/img/placeholder.jpg";
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Ảnh banner</label>
                  <div className="image-upload-tabs">
                    <button
                      type="button"
                      className={`upload-tab ${
                        imageUploadMethod.cover === "url" ? "active" : ""
                      }`}
                      onClick={() =>
                        setImageUploadMethod((prev) => ({
                          ...prev,
                          cover: "url",
                        }))
                      }
                    >
                      <i className="ri-link"></i> Link URL
                    </button>
                    <button
                      type="button"
                      className={`upload-tab ${
                        imageUploadMethod.cover === "file" ? "active" : ""
                      }`}
                      onClick={() =>
                        setImageUploadMethod((prev) => ({
                          ...prev,
                          cover: "file",
                        }))
                      }
                    >
                      <i className="ri-upload-2-line"></i> Tải lên
                    </button>
                  </div>
                  {imageUploadMethod.cover === "url" ? (
                    <input
                      type="text"
                      value={formData.cover}
                      onChange={handleImageUrlChange("cover")}
                      placeholder="/banners/product.jpg hoặc https://..."
                    />
                  ) : (
                    <div className="file-upload-wrapper">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange("cover")}
                        style={{ marginBottom: "8px" }}
                      />
                      <small
                        style={{ color: "var(--muted)", display: "block" }}
                      >
                        JPG, PNG hoặc GIF. Tối đa 5MB
                      </small>
                    </div>
                  )}
                  {(imagePreview.cover || formData.cover) && (
                    <div className="image-preview" style={{ marginTop: "8px" }}>
                      <img
                        src={imagePreview.cover || formData.cover}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: "180px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid var(--line)",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/img/placeholder.jpg";
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label>Đánh giá (0 - 5)</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Lượt bán</label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={formData.sold}
                    onChange={(e) =>
                      setFormData({ ...formData, sold: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Mô tả ngắn</label>
                <input
                  type="text"
                  value={formData.shortDescription}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      shortDescription: e.target.value,
                    })
                  }
                  placeholder="Mô tả ngắn gọn về sản phẩm (hiển thị trên danh sách)"
                  maxLength={200}
                />
              </div>

              <div className="form-group">
                <label>Mô tả chi tiết</label>
                <textarea
                  rows="4"
                  value={formData.desc}
                  onChange={(e) =>
                    setFormData({ ...formData, desc: e.target.value })
                  }
                  placeholder="Thông tin mô tả chi tiết về sản phẩm"
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className="form-group">
                <label>Trạng thái *</label>
                <select
                  value={formData.status || "active"}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Không hoạt động</option>
                  <option value="draft">Bản nháp</option>
                </select>
              </div>

              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn">
                  {editingProduct ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Manage Orders Component
function ManageOrders() {
  const [orders, setOrders] = useState([]);
  const [allOrders, setAllOrders] = useState([]);
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadOrders();
  }, [filter]);

  // Load full orders list once to provide stable counts for filter chips
  useEffect(() => {
    async function loadAll() {
      try {
        const data = await adminApi.getAllOrders("all");
        if (Array.isArray(data)) setAllOrders(data);
      } catch (err) {
        console.error("Failed to load all orders for counts:", err);
      }
    }

    loadAll();
  }, []);

  async function loadOrders() {
    try {
      setLoading(true);
      const filterValue = filter === "all" ? "all" : filter;
      console.log("🔄 Loading orders with filter:", filterValue);

      const data = await adminApi.getAllOrders(filterValue);

      console.log("✅ Orders loaded:", data?.length || 0, "orders");
      if (data && data.length > 0) {
        console.log("📦 First order sample:", {
          id: data[0].id,
          orderCode: data[0].orderCode,
          status: data[0].status,
          customerName: data[0].customerName,
          createdAt: data[0].createdAt,
        });
      }

      // Đảm bảo data là array
      if (Array.isArray(data)) {
        console.log("✅ Setting orders state with", data.length, "orders");
        setOrders(data);
      } else {
        console.warn("⚠️ Orders data is not an array:", data);
        setOrders([]);
      }
    } catch (error) {
      console.error("❌ Error loading orders:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
      });
      alert("Lỗi khi tải danh sách đơn hàng: " + error.message);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  // Backend đã filter theo status rồi, nên không cần filter lại ở đây
  const filteredOrders = orders;

  // Pagination logic
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  console.log("📊 Current orders state:", {
    count: orders.length,
    filter: filter,
    filteredCount: filteredOrders.length,
    sampleOrder:
      orders.length > 0
        ? {
            id: orders[0].id,
            orderCode: orders[0].orderCode,
            status: orders[0].status,
          }
        : null,
  });

  async function handleStatusChange(orderId, newStatus) {
    try {
      const statusLabels = {
        pending: "Chờ xử lý",
        confirmed: "Đã xác nhận",
        processing: "Đang chuẩn bị",
        shipping: "Đang giao",
        delivered: "Đã giao",
        cancelled: "Đã hủy",
      };
      await adminApi.updateOrderStatus(
        orderId,
        newStatus,
        statusLabels[newStatus] || newStatus,
        `Trạng thái đơn hàng đã được cập nhật thành ${
          statusLabels[newStatus] || newStatus
        }`
      );
      loadOrders();
    } catch (error) {
      alert(error.message);
    }
  }

  async function handleViewDetail(orderId) {
    try {
      const order = await adminApi.getOrderById(orderId);
      // Đảm bảo dữ liệu status được lấy đúng từ Database
      console.log("Order data from API:", {
        status: order.status,
        paymentStatus: order.paymentStatus,
        shippingStatus: order.shippingStatus,
        note: order.note,
        hasNote: !!order.note,
        noteType: typeof order.note,
        noteValue: order.note,
        noteLength: order.note?.length,
        fullOrder: order,
      });

      // Đảm bảo các field status có giá trị mặc định nếu null/undefined
      const orderWithDefaults = {
        ...order,
        status: order.status || "pending",
        paymentStatus: order.paymentStatus || "pending",
        shippingStatus: order.shippingStatus || "pending",
      };

      setSelectedOrder(orderWithDefaults);
      setShowDetailModal(true);
    } catch (error) {
      alert("Lỗi khi tải thông tin đơn hàng: " + error.message);
    }
  }

  // Helper function để hiển thị text status
  function getOrderStatusText(status) {
    const statusMap = {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      processing: "Đang xử lý",
      shipping: "Đang giao hàng",
      delivered: "Đã giao hàng",
      cancelled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    return statusMap[status] || status || "Chờ xử lý";
  }

  function getPaymentStatusText(status) {
    const statusMap = {
      pending: "Chờ thanh toán",
      paid: "Đã thanh toán",
      failed: "Thanh toán thất bại",
      refunded: "Đã hoàn tiền",
    };
    return statusMap[status] || "Chờ thanh toán";
  }

  function getShippingStatusText(status) {
    const statusMap = {
      pending: "Chờ xử lý",
      confirmed: "Đã xác nhận",
      shipping: "Đang giao hàng",
      delivered: "Đã giao hàng",
      cancelled: "Đã hủy",
    };
    return statusMap[status] || "Chờ xử lý";
  }

  async function handlePrintInvoice(orderId) {
    try {
      const order = await adminApi.getOrderById(orderId);
      if (order) {
        // Create print window
        const printWindow = window.open("", "_blank");
        const total =
          order.finalAmount ||
          order.items.reduce((sum, item) => sum + item.price * item.qty, 0);

        printWindow.document.write(`
        <html>
          <head>
            <title>Hóa đơn ${order.id}</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; }
              h1 { color: #333; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; }
              .total { font-weight: bold; font-size: 18px; }
            </style>
          </head>
          <body>
            <h1>HÓA ĐƠN BÁN HÀNG</h1>
            <p><strong>Mã đơn:</strong> ${order.orderCode || order.id}</p>
            <p><strong>Ngày đặt:</strong> ${new Date(
              order.createdAt
            ).toLocaleString("vi-VN")}</p>
            <p><strong>Địa chỉ:</strong> ${order.address || "N/A"}</p>
            <p><strong>Phương thức vận chuyển:</strong> ${
              order.shippingMethod || "N/A"
            }</p>
            <p><strong>Phương thức thanh toán:</strong> ${
              order.paymentMethod || "N/A"
            }</p>
            <table>
              <thead>
                <tr>
                  <th>Sản phẩm</th>
                  <th>Số lượng</th>
                  <th>Đơn giá</th>
                  <th>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                ${order.items
                  .map(
                    (item) => `
                  <tr>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${item.price.toLocaleString()}đ</td>
                    <td>${(item.price * item.qty).toLocaleString()}đ</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <p class="total">Tổng tiền: ${total.toLocaleString()}đ</p>
          </body>
        </html>
      `);
        printWindow.document.close();
        printWindow.print();
      }
    } catch (error) {
      alert("Lỗi khi in hóa đơn: " + error.message);
    }
  }

  async function handleDelete(orderId) {
    if (window.confirm("Bạn có chắc chắn muốn xóa đơn hàng này?")) {
      try {
        await adminApi.deleteOrder(orderId);
        loadOrders();
      } catch (error) {
        alert(error.message);
      }
    }
  }

  return (
    <>
      <div className="admin-card">
        <div
          className="admin-card__header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <button
              onClick={loadOrders}
              disabled={loading}
              className="btn btn--ghost btn-sm"
              title="Làm mới danh sách đơn hàng"
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <i
                className="ri-refresh-line"
                style={{
                  animation: loading ? "spin 1s linear infinite" : "none",
                }}
              ></i>
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
            <div className="admin-filters">
              <button
                className={`filter-chip ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                Tất cả ({allOrders.length || 0})
              </button>
              <button
                className={`filter-chip ${
                  filter === "pending" ? "active" : ""
                }`}
                onClick={() => setFilter("pending")}
              >
                Chờ xử lý (
                {(allOrders.filter((o) => o.status === "pending") || []).length}
                )
              </button>
              <button
                className={`filter-chip ${
                  filter === "shipping" ? "active" : ""
                }`}
                onClick={() => setFilter("shipping")}
              >
                Đang giao (
                {
                  (allOrders.filter((o) => o.status === "shipping") || [])
                    .length
                }
                )
              </button>
              <button
                className={`filter-chip ${
                  filter === "delivered" ? "active" : ""
                }`}
                onClick={() => setFilter("delivered")}
              >
                Đã giao (
                {
                  (allOrders.filter((o) => o.status === "delivered") || [])
                    .length
                }
                )
              </button>
              <button
                className={`filter-chip ${
                  filter === "cancelled" ? "active" : ""
                }`}
                onClick={() => setFilter("cancelled")}
              >
                Đã hủy (
                {
                  (allOrders.filter((o) => o.status === "cancelled") || [])
                    .length
                }
                )
              </button>
            </div>
          </div>
        </div>
        <div className="admin-table orders-table">
          <table>
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Không có đơn hàng nào
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <strong>{order.orderCode || order.id}</strong>
                    </td>
                    <td>{order.customerName || `User ${order.userId}`}</td>
                    <td>
                      {parseFloat(
                        order.finalAmount || order.totalAmount || 0
                      ).toLocaleString()}
                      đ
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={order.status}
                        onChange={(e) =>
                          handleStatusChange(order.id, e.target.value)
                        }
                      >
                        <option value="pending">Chờ xử lý</option>
                        <option value="shipping">Đang giao</option>
                        <option value="delivered">Đã giao</option>
                        <option value="cancelled">Đã hủy</option>
                      </select>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleString("vi-VN")}</td>
                    <td>
                      <div className="admin-actions-inline">
                        <button
                          className="btn btn--ghost btn-sm"
                          onClick={() => handleViewDetail(order.id)}
                        >
                          Chi tiết
                        </button>
                        <button
                          className="btn btn--ghost btn-sm"
                          onClick={() => handlePrintInvoice(order.id)}
                        >
                          In hóa đơn
                        </button>
                        <button
                          className="btn btn--ghost btn-sm danger"
                          onClick={() => handleDelete(order.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Order Detail Modal */}
      {showDetailModal && selectedOrder && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowDetailModal(false)}
        >
          <div
            className="admin-modal order-detail-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3>
                Chi tiết đơn hàng {selectedOrder.orderCode || selectedOrder.id}
              </h3>
              <button
                className="admin-modal__close"
                onClick={() => setShowDetailModal(false)}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="admin-modal__body">
              {/* Thông tin đơn hàng */}
              <div className="order-detail-section">
                <h4>
                  <i className="ri-file-list-line"></i>
                  Thông tin đơn hàng
                </h4>
                <div className="order-detail-card order-detail-grid">
                  <div>
                    <div className="order-detail-info-item">
                      <strong>Mã đơn hàng</strong>
                      <span
                        style={{
                          color: "var(--primary)",
                          fontSize: "16px",
                          fontWeight: "700",
                        }}
                      >
                        {selectedOrder.orderCode || selectedOrder.id}
                      </span>
                    </div>
                    <div className="order-detail-info-item">
                      <strong>Ngày đặt hàng</strong>
                      <span>
                        {selectedOrder.createdAt
                          ? new Date(selectedOrder.createdAt).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </div>
                    <div className="order-detail-info-item">
                      <strong>Cập nhật lần cuối</strong>
                      <span>
                        {selectedOrder.updatedAt
                          ? new Date(selectedOrder.updatedAt).toLocaleString(
                              "vi-VN"
                            )
                          : "N/A"}
                      </span>
                    </div>
                  </div>
                  <div>
                    <div className="order-detail-info-item">
                      <strong>Trạng thái đơn hàng</strong>
                      <div>
                        <span
                          className={`badge badge--${
                            selectedOrder.status || "pending"
                          } order-detail-badge`}
                        >
                          {getOrderStatusText(selectedOrder.status)}
                        </span>
                        {selectedOrder.status && (
                          <span className="order-detail-status-text">
                            ({selectedOrder.status})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="order-detail-info-item">
                      <strong>Trạng thái thanh toán</strong>
                      <div>
                        <span
                          className={`badge badge--${
                            selectedOrder.paymentStatus || "pending"
                          } order-detail-badge`}
                        >
                          {getPaymentStatusText(selectedOrder.paymentStatus)}
                        </span>
                        {selectedOrder.paymentStatus && (
                          <span className="order-detail-status-text">
                            ({selectedOrder.paymentStatus})
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="order-detail-info-item">
                      <strong>Trạng thái vận chuyển</strong>
                      <div>
                        <span
                          className={`badge badge--${
                            selectedOrder.shippingStatus || "pending"
                          } order-detail-badge`}
                        >
                          {getShippingStatusText(selectedOrder.shippingStatus)}
                        </span>
                        {selectedOrder.shippingStatus && (
                          <span className="order-detail-status-text">
                            ({selectedOrder.shippingStatus})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                {selectedOrder.summary && (
                  <div
                    className="order-detail-stats"
                    style={{ marginTop: "20px" }}
                  >
                    <strong>Thống kê:</strong>
                    <div style={{ marginTop: "6px" }}>
                      {selectedOrder.summary.totalItems} sản phẩm •{" "}
                      {selectedOrder.summary.totalQuantity} sản phẩm
                      {selectedOrder.summary.couponsCount > 0 &&
                        ` • ${selectedOrder.summary.couponsCount} mã giảm giá`}
                      {selectedOrder.summary.timelineCount > 0 &&
                        ` • ${selectedOrder.summary.timelineCount} mốc thời gian`}
                    </div>
                  </div>
                )}
              </div>

              {/* Thông tin khách hàng */}
              {(selectedOrder.customer || selectedOrder.customerName) && (
                <div className="order-detail-section">
                  <h4>
                    <i className="ri-user-line"></i>
                    Thông tin khách hàng
                  </h4>
                  <div className="order-detail-card">
                    {selectedOrder.customer ? (
                      <>
                        <div className="order-detail-info-item">
                          <strong>Họ tên</strong>
                          <span>
                            {selectedOrder.customer.name ||
                              selectedOrder.customerName}
                          </span>
                        </div>
                        <div className="order-detail-info-item">
                          <strong>Email</strong>
                          <span>{selectedOrder.customer.email || "N/A"}</span>
                        </div>
                        <div className="order-detail-info-item">
                          <strong>Số điện thoại</strong>
                          <span>
                            {selectedOrder.customer.phone ||
                              selectedOrder.customerPhone ||
                              "N/A"}
                          </span>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="order-detail-info-item">
                          <strong>Họ tên</strong>
                          <span>{selectedOrder.customerName || "N/A"}</span>
                        </div>
                        <div className="order-detail-info-item">
                          <strong>Số điện thoại</strong>
                          <span>{selectedOrder.customerPhone || "N/A"}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Địa chỉ giao hàng */}
              <div className="order-detail-section">
                <h4>
                  <i className="ri-map-pin-line"></i>
                  Địa chỉ giao hàng
                </h4>
                <div className="order-detail-card">
                  {selectedOrder.address ? (
                    <div style={{ lineHeight: "1.8" }}>
                      {selectedOrder.customerName && (
                        <div style={{ marginBottom: "8px" }}>
                          <strong
                            style={{ fontSize: "15px", color: "#1e293b" }}
                          >
                            {selectedOrder.customerName}
                          </strong>
                        </div>
                      )}
                      {selectedOrder.customerPhone && (
                        <div
                          style={{
                            marginBottom: "8px",
                            color: "#64748b",
                            fontSize: "14px",
                          }}
                        >
                          {selectedOrder.customerPhone}
                        </div>
                      )}
                      <div
                        style={{
                          marginBottom: "8px",
                          fontSize: "14px",
                          color: "#1e293b",
                        }}
                      >
                        {selectedOrder.address}
                      </div>
                      {selectedOrder.streetAddress && (
                        <div
                          style={{
                            marginBottom: "4px",
                            fontSize: "14px",
                            color: "#475569",
                          }}
                        >
                          {selectedOrder.streetAddress}
                          {selectedOrder.ward && `, ${selectedOrder.ward}`}
                          {selectedOrder.district &&
                            `, ${selectedOrder.district}`}
                          {selectedOrder.province &&
                            `, ${selectedOrder.province}`}
                        </div>
                      )}
                      {selectedOrder.postalCode && (
                        <div
                          style={{
                            fontSize: "13px",
                            color: "#64748b",
                            marginTop: "8px",
                          }}
                        >
                          <strong>Mã bưu điện:</strong>{" "}
                          {selectedOrder.postalCode}
                        </div>
                      )}
                    </div>
                  ) : (
                    <p style={{ color: "#64748b", margin: 0 }}>
                      Chưa có thông tin địa chỉ
                    </p>
                  )}
                </div>
              </div>

              {/* Thông tin thanh toán và vận chuyển */}
              <div className="order-detail-section">
                <h4>
                  <i className="ri-shopping-bag-line"></i>
                  Phương thức thanh toán & vận chuyển
                </h4>
                <div className="order-detail-card order-detail-grid">
                  <div className="order-detail-info-item">
                    <strong>Phương thức thanh toán</strong>
                    <span>
                      {selectedOrder.paymentMethod === "COD" &&
                        "Thanh toán khi nhận hàng (COD)"}
                      {selectedOrder.paymentMethod === "bank_transfer" &&
                        "Chuyển khoản ngân hàng"}
                      {selectedOrder.paymentMethod === "credit_card" &&
                        "Thẻ tín dụng"}
                      {selectedOrder.paymentMethod === "e_wallet" &&
                        "Ví điện tử"}
                      {![
                        "COD",
                        "bank_transfer",
                        "credit_card",
                        "e_wallet",
                      ].includes(selectedOrder.paymentMethod) &&
                        (selectedOrder.paymentMethod || "N/A")}
                    </span>
                  </div>
                  <div className="order-detail-info-item">
                    <strong>Phương thức vận chuyển</strong>
                    <span>
                      {selectedOrder.shippingMethod || "Chưa cập nhật"}
                    </span>
                  </div>
                </div>
                {selectedOrder.note && (
                  <div style={{ marginTop: "16px" }}>
                    <div
                      className="order-detail-info-item"
                      style={{ marginBottom: "0" }}
                    >
                      <strong>Ghi chú</strong>
                    </div>
                    <div
                      style={{
                        background: "#fff",
                        padding: "16px",
                        borderRadius: "10px",
                        border: "1px solid #e2e8f0",
                        fontStyle: "italic",
                        fontSize: "14px",
                        color: "#475569",
                        lineHeight: "1.6",
                        marginTop: "8px",
                      }}
                    >
                      {selectedOrder.note}
                    </div>
                  </div>
                )}
              </div>

              {/* Danh sách sản phẩm */}
              <div className="order-detail-section">
                <h4>
                  <i className="ri-shopping-cart-line"></i>
                  Danh sách sản phẩm
                </h4>
                <div style={{ overflowX: "auto", marginTop: "16px" }}>
                  <table className="order-detail-table">
                    <thead>
                      <tr>
                        <th style={{ width: "50px", textAlign: "center" }}>
                          STT
                        </th>
                        <th>Sản phẩm</th>
                        <th style={{ width: "100px", textAlign: "center" }}>
                          Số lượng
                        </th>
                        <th style={{ width: "140px", textAlign: "right" }}>
                          Đơn giá
                        </th>
                        <th style={{ width: "160px", textAlign: "right" }}>
                          Thành tiền
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items && selectedOrder.items.length > 0 ? (
                        selectedOrder.items.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td
                              style={{
                                textAlign: "center",
                                color: "#64748b",
                                fontWeight: "600",
                              }}
                            >
                              {idx + 1}
                            </td>
                            <td>
                              <div className="order-detail-product-info">
                                {item.image && (
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="order-detail-product-image"
                                    onError={(e) => {
                                      e.currentTarget.src =
                                        "/img/placeholder.jpg";
                                    }}
                                  />
                                )}
                                <div>
                                  <div className="order-detail-product-name">
                                    {item.name}
                                  </div>
                                  {item.productId && (
                                    <div className="order-detail-product-id">
                                      ID: {item.productId}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td
                              style={{
                                textAlign: "center",
                                fontWeight: "600",
                                color: "#1e293b",
                              }}
                            >
                              {item.qty || item.quantity || 0}
                            </td>
                            <td
                              style={{ textAlign: "right", color: "#475569" }}
                            >
                              {parseFloat(item.price || 0).toLocaleString(
                                "vi-VN"
                              )}
                              đ
                            </td>
                            <td
                              style={{
                                textAlign: "right",
                                fontWeight: "600",
                                color: "#1e293b",
                              }}
                            >
                              {parseFloat(
                                item.subtotal ||
                                  (item.price || 0) *
                                    (item.qty || item.quantity || 0)
                              ).toLocaleString("vi-VN")}
                              đ
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            style={{
                              padding: "32px",
                              textAlign: "center",
                              color: "#64748b",
                              fontSize: "14px",
                            }}
                          >
                            Không có sản phẩm nào
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td colSpan="4" style={{ textAlign: "right" }}>
                          Tổng tiền sản phẩm:
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {parseFloat(
                            selectedOrder.totalAmount || 0
                          ).toLocaleString("vi-VN")}
                          đ
                        </td>
                      </tr>
                      {selectedOrder.shippingFee &&
                        parseFloat(selectedOrder.shippingFee) > 0 && (
                          <tr>
                            <td colSpan="4" style={{ textAlign: "right" }}>
                              Phí vận chuyển:
                            </td>
                            <td style={{ textAlign: "right" }}>
                              {parseFloat(
                                selectedOrder.shippingFee
                              ).toLocaleString("vi-VN")}
                              đ
                            </td>
                          </tr>
                        )}
                      {selectedOrder.discountAmount &&
                        parseFloat(selectedOrder.discountAmount) > 0 && (
                          <tr>
                            <td
                              colSpan="4"
                              style={{ textAlign: "right", color: "#10b981" }}
                            >
                              Giảm giá:
                            </td>
                            <td
                              style={{ textAlign: "right", color: "#10b981" }}
                            >
                              -
                              {parseFloat(
                                selectedOrder.discountAmount
                              ).toLocaleString("vi-VN")}
                              đ
                            </td>
                          </tr>
                        )}
                      <tr style={{ borderTop: "2px solid #cbd5e1" }}>
                        <td
                          colSpan="4"
                          style={{ textAlign: "right", fontSize: "16px" }}
                        >
                          Tổng thanh toán:
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            fontSize: "18px",
                            color: "var(--primary)",
                            fontWeight: "700",
                          }}
                        >
                          {parseFloat(
                            selectedOrder.finalAmount ||
                              selectedOrder.totalAmount ||
                              0
                          ).toLocaleString("vi-VN")}
                          đ
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Ghi chú của khách hàng */}
              <div className="order-detail-section">
                <h4>
                  <i className="ri-file-text-line"></i>
                  Ghi chú của khách hàng
                </h4>
                <div className="order-detail-card">
                  {(() => {
                    const note = selectedOrder.note;
                    const hasNote =
                      note !== null &&
                      note !== undefined &&
                      String(note).trim() !== "";

                    if (hasNote) {
                      return (
                        <div
                          style={{
                            background: "#f8fafc",
                            padding: "16px",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                            fontSize: "14px",
                            color: "#475569",
                            lineHeight: "1.6",
                            whiteSpace: "pre-wrap",
                            wordBreak: "break-word",
                          }}
                        >
                          {String(note)}
                        </div>
                      );
                    } else {
                      return (
                        <div
                          style={{
                            padding: "16px",
                            fontSize: "14px",
                            color: "#94a3b8",
                            fontStyle: "italic",
                            textAlign: "center",
                          }}
                        >
                          Không có ghi chú
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Thông tin mã giảm giá (Coupons) */}
              {selectedOrder.coupons && selectedOrder.coupons.length > 0 && (
                <div className="order-detail-section">
                  <h4>
                    <i className="ri-coupon-line"></i>
                    Mã giảm giá đã sử dụng
                  </h4>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    {selectedOrder.coupons.map((coupon, idx) => (
                      <div
                        key={coupon.id || idx}
                        className="order-detail-coupon-card"
                      >
                        <div className="order-detail-coupon-header">
                          <div>
                            <div className="order-detail-coupon-code">
                              {coupon.couponCode || "N/A"}
                            </div>
                            {coupon.couponName && (
                              <div className="order-detail-coupon-name">
                                {coupon.couponName}
                              </div>
                            )}
                          </div>
                          <span className="order-detail-coupon-amount">
                            -
                            {parseFloat(
                              coupon.discountAmount || 0
                            ).toLocaleString("vi-VN")}
                            đ
                          </span>
                        </div>
                        {coupon.couponDescription && (
                          <p
                            style={{
                              margin: "0 0 8px 0",
                              fontSize: "13px",
                              color: "#64748b",
                              lineHeight: "1.6",
                            }}
                          >
                            {coupon.couponDescription}
                          </p>
                        )}
                        {coupon.couponDiscountType && (
                          <div
                            style={{
                              fontSize: "12px",
                              color: "#64748b",
                              marginTop: "8px",
                            }}
                          >
                            Loại:{" "}
                            {coupon.couponDiscountType === "percentage"
                              ? "Phần trăm"
                              : "Số tiền cố định"}
                            {coupon.couponDiscountValue &&
                              ` - Giá trị: ${coupon.couponDiscountValue}${
                                coupon.couponDiscountType === "percentage"
                                  ? "%"
                                  : "đ"
                              }`}
                          </div>
                        )}
                      </div>
                    ))}
                    {selectedOrder.summary &&
                      selectedOrder.summary.discountFromCoupons > 0 && (
                        <div
                          style={{
                            background: "#d1fae5",
                            padding: "16px",
                            borderRadius: "10px",
                            border: "1px solid #10b981",
                            marginTop: "8px",
                          }}
                        >
                          <strong
                            style={{ fontSize: "15px", color: "#065f46" }}
                          >
                            Tổng giảm giá từ mã giảm giá: -
                            {parseFloat(
                              selectedOrder.summary.discountFromCoupons || 0
                            ).toLocaleString("vi-VN")}
                            đ
                          </strong>
                        </div>
                      )}
                  </div>
                </div>
              )}

              {/* Lịch sử đơn hàng (Timeline) */}
              {selectedOrder.timeline && selectedOrder.timeline.length > 0 && (
                <div className="order-detail-section">
                  <h4>
                    <i className="ri-time-line"></i>
                    Lịch sử đơn hàng ({selectedOrder.timeline.length} mục)
                  </h4>
                  <div className="order-detail-timeline">
                    <div className="order-detail-timeline-line"></div>
                    {selectedOrder.timeline.map((timeline, idx) => {
                      const isActive =
                        idx === selectedOrder.timeline.length - 1;
                      return (
                        <div
                          key={timeline.id || idx}
                          className="order-detail-timeline-item"
                        >
                          <div
                            className={`order-detail-timeline-dot ${
                              isActive ? "active" : ""
                            }`}
                          ></div>
                          <div
                            className={`order-detail-timeline-card ${
                              isActive ? "active" : ""
                            }`}
                          >
                            <div className="order-detail-timeline-header">
                              <strong className="order-detail-timeline-label">
                                {timeline.label || timeline.status}
                              </strong>
                              <span className="order-detail-timeline-time">
                                {timeline.at
                                  ? new Date(timeline.at).toLocaleString(
                                      "vi-VN"
                                    )
                                  : "N/A"}
                              </span>
                            </div>
                            {timeline.description && (
                              <p className="order-detail-timeline-description">
                                {timeline.description}
                              </p>
                            )}
                            {timeline.status && (
                              <span
                                className={`badge badge--${timeline.status}`}
                                style={{
                                  marginTop: "10px",
                                  display: "inline-block",
                                }}
                              >
                                {timeline.status}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="admin-modal__footer">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => setShowDetailModal(false)}
              >
                Đóng
              </button>
              <button
                type="button"
                className="btn"
                onClick={() => {
                  handlePrintInvoice(
                    selectedOrder.id || selectedOrder.orderCode
                  );
                  setShowDetailModal(false);
                }}
              >
                <i
                  className="ri-printer-line"
                  style={{ marginRight: "8px" }}
                ></i>
                In hóa đơn
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Manage Promotions Component
function ManagePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    description: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase: "0",
    max_discount: "",
    usage_limit: "",
    valid_from: "",
    valid_until: "",
    status: "active",
  });

  useEffect(() => {
    loadPromotions();
  }, [searchQuery, statusFilter]);

  async function loadPromotions() {
    try {
      setLoading(true);
      const data = await adminApi.getAllPromotions();
      const promotionsList = Array.isArray(data) ? data : [];

      // Debug: Log dữ liệu để kiểm tra
      console.log("📊 Promotions loaded:", promotionsList.length);
      if (promotionsList.length > 0) {
        console.log("📊 First promotion sample:", {
          id: promotionsList[0].id,
          code: promotionsList[0].code,
          discount_type: promotionsList[0].discount_type,
          status: promotionsList[0].status,
          fullData: promotionsList[0],
        });
      }

      setPromotions(promotionsList);
    } catch (error) {
      console.error("Error loading promotions:", error);
      alert("Lỗi khi tải danh sách khuyến mãi: " + error.message);
      setPromotions([]);
    } finally {
      setLoading(false);
    }
  }

  const filteredPromotions = promotions.filter((promo) => {
    const matchesSearch =
      promo.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || promo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredPromotions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPromotions = filteredPromotions.slice(startIndex, endIndex);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const handleAdd = () => {
    setEditingPromotion(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    setFormData({
      code: "",
      name: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      min_purchase: "0",
      max_discount: "",
      usage_limit: "",
      valid_from: tomorrow.toISOString().split("T")[0],
      valid_until: nextMonth.toISOString().split("T")[0],
      status: "active",
    });
    setShowModal(true);
  };

  async function handleEdit(promotion) {
    try {
      const latestPromotion = await adminApi.getPromotionById(promotion.id);
      setEditingPromotion(latestPromotion);
      setFormData({
        code: latestPromotion.code || "",
        name: latestPromotion.name || "",
        description: latestPromotion.description || "",
        discount_type: latestPromotion.discount_type || "percentage",
        discount_value: String(latestPromotion.discount_value || ""),
        min_purchase: String(latestPromotion.min_purchase || "0"),
        max_discount: latestPromotion.max_discount
          ? String(latestPromotion.max_discount)
          : "",
        usage_limit: latestPromotion.usage_limit
          ? String(latestPromotion.usage_limit)
          : "",
        valid_from: latestPromotion.valid_from
          ? new Date(latestPromotion.valid_from).toISOString().split("T")[0]
          : "",
        valid_until: latestPromotion.valid_until
          ? new Date(latestPromotion.valid_until).toISOString().split("T")[0]
          : "",
        status: latestPromotion.status || "active",
      });
      setShowModal(true);
    } catch (error) {
      alert("Lỗi khi tải thông tin khuyến mãi: " + error.message);
    }
  }

  async function handleDelete(promotionId) {
    if (window.confirm("Bạn có chắc chắn muốn xóa khuyến mãi này?")) {
      try {
        await adminApi.deletePromotion(promotionId);
        alert("Xóa khuyến mãi thành công!");
        await loadPromotions();
      } catch (error) {
        console.error("Error deleting promotion:", error);
        alert("Lỗi: " + (error.message || "Không thể xóa khuyến mãi"));
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPromotion(null);
  };

  const validateForm = () => {
    if (!formData.code.trim()) {
      alert("Mã khuyến mãi là bắt buộc");
      return false;
    }
    if (!formData.name.trim()) {
      alert("Tên khuyến mãi là bắt buộc");
      return false;
    }
    if (!formData.discount_value || Number(formData.discount_value) <= 0) {
      alert("Giá trị giảm giá phải lớn hơn 0");
      return false;
    }
    if (formData.discount_type === "percentage") {
      const value = Number(formData.discount_value);
      if (value <= 0 || value > 100) {
        alert("Phần trăm giảm giá phải từ 1% đến 100%");
        return false;
      }
    }
    if (!formData.valid_from || !formData.valid_until) {
      alert("Vui lòng chọn thời gian hiệu lực");
      return false;
    }
    const fromDate = new Date(formData.valid_from);
    const untilDate = new Date(formData.valid_until);
    if (untilDate <= fromDate) {
      alert("Ngày kết thúc phải sau ngày bắt đầu");
      return false;
    }
    return true;
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const payload = {
        code: formData.code.trim().toUpperCase(),
        name: formData.name.trim(),
        description: formData.description.trim() || null,
        discount_type: formData.discount_type,
        discount_value: Number(formData.discount_value),
        min_purchase: Number(formData.min_purchase) || 0,
        max_discount: formData.max_discount
          ? Number(formData.max_discount)
          : null,
        usage_limit: formData.usage_limit ? Number(formData.usage_limit) : null,
        valid_from: new Date(formData.valid_from).toISOString(),
        valid_until: new Date(formData.valid_until).toISOString(),
        status: formData.status,
      };

      if (editingPromotion) {
        await adminApi.updatePromotion(editingPromotion.id, payload);
        alert("Cập nhật khuyến mãi thành công!");
      } else {
        await adminApi.createPromotion(payload);
        alert("Thêm khuyến mãi thành công!");
      }
      await loadPromotions();
      handleCloseModal();
    } catch (error) {
      console.error("Error saving promotion:", error);
      alert("Lỗi: " + (error.message || "Không thể lưu khuyến mãi"));
    }
  }

  const formatCurrency = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    return `${Number(value).toLocaleString("vi-VN")}đ`;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      return dateStr;
    }
  };

  const getStatusBadge = (status) => {
    // Chuẩn hóa status về lowercase để so sánh
    const normalizedStatus = status ? String(status).toLowerCase().trim() : "";

    const statusMap = {
      active: { text: "Hoạt động", class: "active" },
      inactive: { text: "Không hoạt động", class: "inactive" },
      expired: { text: "Hết hạn", class: "warning" },
      "chờ xử lý": { text: "Chờ xử lý", class: "warning" },
      pending: { text: "Chờ xử lý", class: "warning" },
    };

    // Kiểm tra trong statusMap
    if (normalizedStatus && statusMap[normalizedStatus]) {
      return statusMap[normalizedStatus];
    }

    // Nếu không tìm thấy, trả về status gốc hoặc mặc định
    if (!status || normalizedStatus === "") {
      return { text: "Chưa xác định", class: "inactive" };
    }

    // Trả về status gốc với format đẹp hơn
    return {
      text:
        String(status).charAt(0).toUpperCase() +
        String(status).slice(1).toLowerCase(),
      class: "inactive",
    };
  };

  const isExpired = (validUntil) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-actions">
            <input
              type="text"
              placeholder="Tìm kiếm mã, tên khuyến mãi..."
              className="admin-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-filter-select"
              style={{ marginLeft: "1rem" }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Hoạt động</option>
              <option value="inactive">Không hoạt động</option>
              <option value="expired">Hết hạn</option>
            </select>
            <button className="btn" onClick={handleAdd}>
              <i className="ri-add-line"></i> Thêm khuyến mãi
            </button>
          </div>
        </div>

        <div className="admin-table">
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Đang tải...
            </div>
          ) : filteredPromotions.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              {searchQuery || statusFilter !== "all"
                ? "Không tìm thấy khuyến mãi phù hợp"
                : "Chưa có khuyến mãi nào"}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên khuyến mãi</th>
                  <th>Giá trị</th>
                  <th>Đơn tối thiểu</th>
                  <th>Đã dùng</th>
                  <th>Hiệu lực</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPromotions.map((promo) => {
                  // Debug: Log từng promotion để kiểm tra dữ liệu
                  if (promo.id === promotions[0]?.id) {
                    console.log("🔍 Rendering promotion:", {
                      id: promo.id,
                      code: promo.code,
                      discount_type: promo.discount_type,
                      status: promo.status,
                      allKeys: Object.keys(promo),
                    });
                  }

                  const expired = isExpired(
                    promo.valid_until || promo.validUntil
                  );

                  // Lấy discount_type, hỗ trợ cả snake_case và camelCase, chuẩn hóa về lowercase
                  const discountTypeRaw =
                    promo.discount_type || promo.discountType || "";
                  const discountType = discountTypeRaw
                    ? String(discountTypeRaw).toLowerCase().trim()
                    : "";

                  // Lấy status, hỗ trợ cả snake_case và camelCase, chuẩn hóa về lowercase
                  const promoStatusRaw = promo.status || "";
                  const promoStatus = promoStatusRaw
                    ? String(promoStatusRaw).toLowerCase().trim()
                    : "";

                  // Tự động cập nhật trạng thái nếu đã hết hạn
                  const actualStatus =
                    expired && promoStatus === "active"
                      ? "expired"
                      : promoStatus || "inactive";
                  const statusInfo = getStatusBadge(actualStatus);

                  return (
                    <tr key={promo.id}>
                      <td>
                        <strong style={{ color: "var(--primary)" }}>
                          {promo.code || `#${promo.id}`}
                        </strong>
                      </td>
                      <td>
                        <div style={{ maxWidth: "200px" }}>
                          <strong>{promo.name || "Chưa có tên"}</strong>
                          {promo.description && (
                            <>
                              <br />
                              <small style={{ color: "var(--muted)" }}>
                                {promo.description.length > 50
                                  ? `${promo.description.substring(0, 50)}...`
                                  : promo.description}
                              </small>
                            </>
                          )}
                        </div>
                      </td>
                      <td>
                        {discountType === "percentage"
                          ? `${
                              promo.discount_value || promo.discountValue || 0
                            }%`
                          : formatCurrency(
                              promo.discount_value || promo.discountValue || 0
                            )}
                        {promo.max_discount &&
                          discountType === "percentage" && (
                            <>
                              <br />
                              <small style={{ color: "var(--muted)" }}>
                                Tối đa:{" "}
                                {formatCurrency(
                                  promo.max_discount || promo.maxDiscount || 0
                                )}
                              </small>
                            </>
                          )}
                      </td>
                      <td>
                        {formatCurrency(
                          promo.min_purchase || promo.minPurchase || 0
                        )}
                      </td>
                      <td>
                        {promo.used_count || promo.usedCount || 0}
                        {promo.usage_limit && ` / ${promo.usage_limit}`}
                      </td>
                      <td>
                        <div style={{ fontSize: "13px" }}>
                          <div>
                            <strong>Từ:</strong>{" "}
                            {formatDate(promo.valid_from || promo.validFrom)}
                          </div>
                          <div>
                            <strong>Đến:</strong>{" "}
                            {formatDate(promo.valid_until || promo.validUntil)}
                          </div>
                          {expired && (
                            <span
                              className="badge badge--warning"
                              style={{
                                marginTop: "4px",
                                display: "inline-block",
                              }}
                            >
                              Hết hạn
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div>
                          <span
                            className={`badge badge--${
                              statusInfo.class || "inactive"
                            }`}
                            style={{
                              display: "inline-block",
                              minWidth: "120px",
                            }}
                          >
                            {statusInfo.text || "Chưa xác định"}
                          </span>
                          {expired && (
                            <div
                              style={{
                                fontSize: "11px",
                                color: "var(--warning)",
                                marginTop: "4px",
                              }}
                            >
                              <i className="ri-time-line"></i> Đã hết hạn
                            </div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="admin-actions-inline">
                          <button
                            className="btn btn--ghost btn-sm"
                            onClick={() => handleEdit(promo)}
                          >
                            Sửa
                          </button>
                          <button
                            className="btn btn--ghost btn-sm danger"
                            onClick={() => handleDelete(promo.id)}
                          >
                            Xóa
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="admin-modal-backdrop" onClick={handleCloseModal}>
          <div
            className="admin-modal"
            style={{ maxWidth: "700px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3>
                {editingPromotion ? "Sửa khuyến mãi" : "Thêm khuyến mãi mới"}
              </h3>
              <button className="admin-modal__close" onClick={handleCloseModal}>
                <i className="ri-close-line"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="admin-modal__body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label>Mã khuyến mãi *</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder="Ví dụ: SALE2024"
                    disabled={!!editingPromotion}
                    style={{
                      textTransform: "uppercase",
                      ...(editingPromotion && { opacity: 0.6 }),
                    }}
                  />
                  {editingPromotion && (
                    <small style={{ color: "var(--muted)" }}>
                      Không thể thay đổi mã khuyến mãi
                    </small>
                  )}
                </div>
                <div className="form-group">
                  <label>Trạng thái *</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                  >
                    <option value="active">Hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                    <option value="expired">Hết hạn</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Tên khuyến mãi *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Ví dụ: Giảm giá 20% cho đơn hàng đầu tiên"
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Mô tả chi tiết về khuyến mãi (tùy chọn)"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label>Loại giảm giá *</label>
                  <select
                    value={formData.discount_type}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_type: e.target.value,
                      })
                    }
                  >
                    <option value="percentage">Phần trăm (%)</option>
                    <option value="fixed">Số tiền cố định (đ)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>
                    Giá trị giảm giá *{" "}
                    {formData.discount_type === "percentage"
                      ? "(1-100%)"
                      : "(đ)"}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max={formData.discount_type === "percentage" ? "100" : ""}
                    step={
                      formData.discount_type === "percentage" ? "0.1" : "1000"
                    }
                    value={formData.discount_value}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        discount_value: e.target.value,
                      })
                    }
                    placeholder={
                      formData.discount_type === "percentage"
                        ? "Ví dụ: 20"
                        : "Ví dụ: 50000"
                    }
                  />
                </div>
              </div>

              {formData.discount_type === "percentage" && (
                <div className="form-group">
                  <label>Giảm giá tối đa (đ) - Tùy chọn</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.max_discount}
                    onChange={(e) =>
                      setFormData({ ...formData, max_discount: e.target.value })
                    }
                    placeholder="Ví dụ: 100000 (để trống = không giới hạn)"
                  />
                  <small style={{ color: "var(--muted)" }}>
                    Giới hạn số tiền giảm tối đa khi dùng phần trăm
                  </small>
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label>Đơn hàng tối thiểu (đ)</label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={formData.min_purchase}
                    onChange={(e) =>
                      setFormData({ ...formData, min_purchase: e.target.value })
                    }
                    placeholder="Ví dụ: 200000"
                  />
                </div>
                <div className="form-group">
                  <label>Số lượt sử dụng tối đa - Tùy chọn</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={formData.usage_limit}
                    onChange={(e) =>
                      setFormData({ ...formData, usage_limit: e.target.value })
                    }
                    placeholder="Để trống = không giới hạn"
                  />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label>Ngày bắt đầu *</label>
                  <input
                    type="date"
                    required
                    value={formData.valid_from}
                    onChange={(e) =>
                      setFormData({ ...formData, valid_from: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Ngày kết thúc *</label>
                  <input
                    type="date"
                    required
                    value={formData.valid_until}
                    onChange={(e) =>
                      setFormData({ ...formData, valid_until: e.target.value })
                    }
                    min={formData.valid_from}
                  />
                </div>
              </div>

              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn">
                  {editingPromotion ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Manage Services Component
function ManageServicesAdmin() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    serviceCode: "",
    name: "",
    description: "",
    duration: "",
    price: "",
    icon: "",
    status: "active",
    sortOrder: 0,
  });

  useEffect(() => {
    loadServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadServices() {
    try {
      setLoading(true);
      const data = await adminApi.getAllServicesAdmin("all", search);
      setServices(data || []);
    } catch (error) {
      alert(error.message || "Không thể tải danh sách dịch vụ");
    } finally {
      setLoading(false);
    }
  }

  function openModal(service = null) {
    if (service) {
      setEditingService(service);
      setFormData({
        serviceCode: service.serviceCode,
        name: service.name,
        description: service.description || "",
        duration: service.duration || "",
        price: service.price || "",
        icon: service.icon || "",
        status: service.status || "active",
        sortOrder: service.sortOrder || 0,
      });
    } else {
      setEditingService(null);
      setFormData({
        serviceCode: "",
        name: "",
        description: "",
        duration: "",
        price: "",
        icon: "",
        status: "active",
        sortOrder: 0,
      });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingService(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      if (editingService) {
        await adminApi.updateServiceAdmin(editingService.id, formData);
        alert("Đã cập nhật dịch vụ!");
      } else {
        await adminApi.createServiceAdmin(formData);
        alert("Đã thêm dịch vụ!");
      }
      closeModal();
      loadServices();
    } catch (error) {
      alert(error.message || "Không thể lưu dịch vụ");
    }
  }

  async function handleDelete(service) {
    if (
      !window.confirm(
        `Vô hiệu hóa dịch vụ "${service.name}"? Dịch vụ sẽ không hiển thị cho khách hàng.`
      )
    )
      return;
    try {
      await adminApi.deleteServiceAdmin(service.id);
      loadServices();
    } catch (error) {
      alert(error.message || "Không thể vô hiệu hóa dịch vụ");
    }
  }

  // Restore a previously disabled service (set status back to active)
  async function handleRestore(serviceId) {
    if (!window.confirm("Mở lại dịch vụ này và hiển thị cho khách hàng?"))
      return;
    try {
      await adminApi.updateServiceAdmin(serviceId, { status: "active" });
      loadServices();
    } catch (error) {
      alert(error.message || "Không thể mở lại dịch vụ");
    }
  }

  const filteredServices = search
    ? services.filter((s) =>
        (s.name + s.serviceCode).toLowerCase().includes(search.toLowerCase())
      )
    : services;

  // Pagination logic
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedServices = filteredServices.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-actions">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                loadServices();
              }}
              className="admin-search-form"
            >
              <input
                type="text"
                placeholder="Tìm theo tên hoặc mã..."
                className="admin-search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn--ghost btn-sm">
                <i className="ri-search-line"></i> Tìm
              </button>
            </form>
            <button className="btn" onClick={() => openModal()}>
              <i className="ri-add-line"></i> Thêm dịch vụ
            </button>
          </div>
        </div>
        <div className="admin-table">
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Đang tải...
            </div>
          ) : filteredServices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Không có dịch vụ nào
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Mã</th>
                  <th>Tên</th>
                  <th>Thời lượng</th>
                  <th>Giá</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedServices.map((service) => {
                  const isDisabled =
                    service.status && service.status !== "active";
                  return (
                    <tr
                      key={service.id}
                      style={
                        isDisabled
                          ? {
                              background: "#fff5f5" /* light red */,
                              borderLeft: "4px solid #f87171",
                            }
                          : undefined
                      }
                    >
                      <td style={isDisabled ? { color: "#b91c1c" } : undefined}>
                        {service.serviceCode}
                      </td>
                      <td style={isDisabled ? { color: "#b91c1c" } : undefined}>
                        <strong>{service.name}</strong>
                        <br />
                        <small className="muted">
                          {service.description?.slice(0, 60) || "—"}
                        </small>
                      </td>
                      <td style={isDisabled ? { color: "#b91c1c" } : undefined}>
                        {service.duration || "—"}
                      </td>
                      <td style={isDisabled ? { color: "#b91c1c" } : undefined}>
                        {service.price || "Liên hệ"}
                      </td>
                      <td>
                        <div className="admin-actions-inline">
                          <button
                            className="btn btn--ghost btn-sm"
                            onClick={() => openModal(service)}
                            disabled={isDisabled}
                            title={
                              isDisabled
                                ? "Không thể sửa dịch vụ đã vô hiệu"
                                : "Sửa"
                            }
                          >
                            Sửa
                          </button>

                          {!isDisabled ? (
                            <button
                              className="btn btn--ghost btn-sm danger"
                              onClick={() => handleDelete(service)}
                            >
                              Vô hiệu hóa
                            </button>
                          ) : (
                            <button
                              className="btn btn--ghost btn-sm success"
                              onClick={() => handleRestore(service.id)}
                            >
                              Mở dịch vụ
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      </div>

      {showModal && (
        <div className="admin-modal-backdrop" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>{editingService ? "Sửa dịch vụ" : "Thêm dịch vụ"}</h3>
              <button className="admin-modal__close" onClick={closeModal}>
                <i className="ri-close-line"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__body">
              <div className="form-group">
                <label>Mã dịch vụ *</label>
                <input
                  required
                  value={formData.serviceCode}
                  onChange={(e) =>
                    setFormData({ ...formData, serviceCode: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Tên dịch vụ *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Thời lượng</label>
                <input
                  value={formData.duration}
                  onChange={(e) =>
                    setFormData({ ...formData, duration: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Giá hiển thị</label>
                <input
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Icon lớp CSS</label>
                <input
                  value={formData.icon}
                  onChange={(e) =>
                    setFormData({ ...formData, icon: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Thứ tự hiển thị</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      sortOrder: Number(e.target.value),
                    })
                  }
                />
              </div>
              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={closeModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn">
                  {editingService ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// Manage Appointments Component
function ManageAppointmentsAdmin() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [detail, setDetail] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    loadAppointments();
  }, [statusFilter]);

  async function loadAppointments() {
    try {
      setLoading(true);
      const data = await adminApi.getAllAppointmentsAdmin({
        status: statusFilter,
      });
      setAppointments(data || []);
    } catch (error) {
      alert(error.message || "Không thể tải lịch hẹn");
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(appointmentId, newStatus) {
    try {
      await adminApi.updateAppointmentStatusAdmin(appointmentId, newStatus);
      loadAppointments();
    } catch (error) {
      alert(error.message || "Không thể cập nhật trạng thái");
    }
  }

  async function openDetail(appointmentId) {
    try {
      const data = await adminApi.getAppointmentByIdAdmin(appointmentId);
      setDetail(data);
      setShowDetail(true);
    } catch (error) {
      alert(error.message || "Không thể xem chi tiết");
    }
  }

  async function handleDelete(appointmentId) {
    if (!window.confirm("Xóa lịch hẹn này?")) return;
    try {
      await adminApi.deleteAppointmentAdmin(appointmentId);
      loadAppointments();
    } catch (error) {
      alert(error.message || "Không thể xóa lịch hẹn");
    }
  }

  const statusLabelMap = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    no_show: "Không đến",
  };

  // Pagination logic
  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedAppointments = appointments.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <>
      <div className="admin-card__header">
        <div className="admin-filters">
          {["all", "pending", "confirmed", "completed", "cancelled"].map(
            (status) => (
              <button
                key={status}
                className={`filter-chip ${
                  statusFilter === status ? "active" : ""
                }`}
                onClick={() => setStatusFilter(status)}
              >
                {statusLabelMap[status] || "Tất cả"}
              </button>
            )
          )}
          <button className="btn btn--ghost btn-sm" onClick={loadAppointments}>
            <i className="ri-refresh-line"></i> Làm mới
          </button>
        </div>
      </div>
      <div className="admin-table">
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Đang tải...
          </div>
        ) : appointments.length === 0 ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Không có lịch hẹn nào
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Mã</th>
                <th>Dịch vụ</th>
                <th>Khách hàng</th>
                <th>Thời gian</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.map((appointment) => {
                const scheduled = appointment.scheduledAt
                  ? new Date(appointment.scheduledAt)
                  : new Date(
                      `${appointment.appointmentDate}T${appointment.appointmentTime}`
                    );
                return (
                  <tr key={appointment.id}>
                    <td>{appointment.appointmentCode || appointment.id}</td>
                    <td>{appointment.serviceName}</td>
                    <td>{appointment.customerName}</td>
                    <td>{scheduled.toLocaleString("vi-VN")}</td>
                    <td>
                      <select
                        className="status-select"
                        value={appointment.status}
                        onChange={(e) =>
                          handleStatusChange(appointment.id, e.target.value)
                        }
                      >
                        {Object.keys(statusLabelMap)
                          .filter((s) => s !== "all")
                          .map((status) => (
                            <option key={status} value={status}>
                              {statusLabelMap[status]}
                            </option>
                          ))}
                      </select>
                    </td>
                    <td>
                      <div className="admin-actions-inline">
                        <button
                          className="btn btn--ghost btn-sm"
                          onClick={() => openDetail(appointment.id)}
                        >
                          Chi tiết
                        </button>
                        <button
                          className="btn btn--ghost btn-sm danger"
                          onClick={() => handleDelete(appointment.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {showDetail && detail && (
        <div
          className="admin-modal-backdrop"
          onClick={() => {
            setShowDetail(false);
            setDetail(null);
          }}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>Chi tiết lịch hẹn</h3>
              <button
                className="admin-modal__close"
                onClick={() => {
                  setShowDetail(false);
                  setDetail(null);
                }}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="admin-modal__body">
              <p>
                <strong>Dịch vụ:</strong> {detail.serviceName}
              </p>
              <p>
                <strong>Khách hàng:</strong> {detail.customerName} (
                {detail.customerPhone})
              </p>
              <p>
                <strong>Thời gian:</strong>{" "}
                {new Date(
                  `${detail.appointmentDate}T${detail.appointmentTime}`
                ).toLocaleString("vi-VN")}
              </p>
              <p>
                <strong>Trạng thái:</strong>{" "}
                {statusLabelMap[detail.status] || detail.status}
              </p>
              {detail.note && (
                <p>
                  <strong>Ghi chú:</strong> {detail.note}
                </p>
              )}
            </div>
            <div className="admin-modal__footer">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => {
                  setShowDetail(false);
                  setDetail(null);
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Manage Posts Component
function ManagePosts() {
  const [posts, setPosts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [formData, setFormData] = useState({
    title: "",
    cat: "Tin tức",
    cover: "",
    excerpt: "",
    content: "",
    author: "",
    readMin: 5,
    tags: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [imagePreview, setImagePreview] = useState("");
  const [imageUploadMethod, setImageUploadMethod] = useState("url"); // "url" or "file"

  const CATEGORIES = [
    "Tin tức",
    "Dinh dưỡng",
    "Bệnh lý",
    "Thuốc",
    "Mẹo sống khỏe",
  ];

  useEffect(() => {
    loadPosts();
  }, [searchQuery]);

  async function loadPosts() {
    try {
      setLoading(true);
      const data = await adminApi.getAllPostsAdmin(searchQuery);
      setPosts(data);
    } catch (error) {
      alert("Lỗi khi tải danh sách bài viết: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Posts are already filtered by API
  const filteredPosts = posts;

  // Pagination logic
  const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPosts = filteredPosts.slice(startIndex, endIndex);

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleAdd = () => {
    setEditingPost(null);
    setFormData({
      title: "",
      cat: "Tin tức",
      cover: "",
      excerpt: "",
      content: "",
      author: "",
      readMin: 5,
      tags: "",
      date: new Date().toISOString().split("T")[0],
    });
    setImagePreview("");
    setImageUploadMethod("url");
    setShowAddModal(true);
  };

  // Helper function to format date to yyyy-MM-dd
  const formatDateForInput = (dateValue) => {
    if (!dateValue) return new Date().toISOString().split("T")[0];

    // If it's already in yyyy-MM-dd format
    if (
      typeof dateValue === "string" &&
      dateValue.match(/^\d{4}-\d{2}-\d{2}$/)
    ) {
      return dateValue;
    }

    // If it's an ISO string or Date object
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split("T")[0];
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      return new Date().toISOString().split("T")[0];
    }
  };

  const handleEdit = async (post) => {
    try {
      // Load latest data from API to ensure we have the most up-to-date information
      const latestPost = await adminApi.getPostByIdAdmin(post.id);
      setEditingPost(latestPost);
      setFormData({
        title: latestPost.title || "",
        cat: latestPost.cat || latestPost.category || "Tin tức",
        cover: latestPost.cover || latestPost.coverImage || "",
        excerpt: latestPost.excerpt || "",
        content: latestPost.content || "",
        author: latestPost.author || "",
        readMin: latestPost.readMin || latestPost.readMinutes || 5,
        tags: Array.isArray(latestPost.tags)
          ? latestPost.tags.join(", ")
          : (typeof latestPost.tags === "string" ? latestPost.tags : "") || "",
        date: formatDateForInput(latestPost.date || latestPost.publishedAt),
      });
      setImagePreview(latestPost.cover || latestPost.coverImage || "");
      setImageUploadMethod(
        latestPost.cover || latestPost.coverImage
          ? (latestPost.cover || latestPost.coverImage).startsWith("data:")
            ? "file"
            : "url"
          : "url"
      );
      setShowAddModal(true);
    } catch (error) {
      console.error("Error loading post:", error);
      // Fallback to using the post from the list
      setEditingPost(post);
      setFormData({
        title: post.title || "",
        cat: post.cat || post.category || "Tin tức",
        cover: post.cover || post.coverImage || "",
        excerpt: post.excerpt || "",
        content: post.content || "",
        author: post.author || "",
        readMin: post.readMin || post.readMinutes || 5,
        tags: Array.isArray(post.tags)
          ? post.tags.join(", ")
          : (typeof post.tags === "string" ? post.tags : "") || "",
        date: formatDateForInput(post.date || post.publishedAt),
      });
      setImagePreview(post.cover || post.coverImage || "");
      setImageUploadMethod(
        post.cover || post.coverImage
          ? (post.cover || post.coverImage).startsWith("data:")
            ? "file"
            : "url"
          : "url"
      );
      setShowAddModal(true);
    }
  };

  async function handleDelete(postId) {
    if (window.confirm("Bạn có chắc chắn muốn xóa bài viết này?")) {
      try {
        await adminApi.deletePost(postId);
        alert("Xóa bài viết thành công!");
        // Reload danh sách từ database
        await loadPosts();
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("Lỗi: " + (error.message || "Không thể xóa bài viết"));
      }
    }
  }

  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file ảnh hợp lệ");
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setImagePreview(base64String);
        setFormData({ ...formData, cover: base64String });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e) => {
    const url = e.target.value;
    setFormData({ ...formData, cover: url });
    setImagePreview(url);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      const tagsArray = formData.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      // Ensure date is in yyyy-MM-dd format
      const formattedDate = formatDateForInput(formData.date);

      const postData = {
        title: formData.title || "",
        cat: formData.cat || "Tin tức",
        cover: formData.cover || "",
        excerpt: formData.excerpt || "",
        content: formData.content || "",
        author: formData.author || "",
        readMin: formData.readMin || 5,
        tags: tagsArray,
        date: formattedDate,
        status: "published", // Default status
      };

      console.log("📝 Submitting post data:", {
        isEditing: !!editingPost,
        postId: editingPost?.id,
        postData,
      });

      if (editingPost) {
        // Ensure postId is a number, not a string with colons
        const postId =
          typeof editingPost.id === "string"
            ? parseInt(editingPost.id.split(":")[0])
            : editingPost.id;

        console.log("🔄 Updating post with ID:", postId);
        await adminApi.updatePost(postId, postData);
        alert("Cập nhật bài viết thành công!");
      } else {
        await adminApi.createPost(postData);
        alert("Thêm bài viết thành công!");
      }
      setShowAddModal(false);
      // Reload danh sách từ database
      await loadPosts();
    } catch (error) {
      console.error("Error saving post:", error);
      alert("Lỗi: " + (error.message || "Không thể lưu bài viết"));
    }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        // If dateStr is in format YYYY-MM-DD, parse it manually
        if (
          typeof dateStr === "string" &&
          dateStr.match(/^\d{4}-\d{2}-\d{2}/)
        ) {
          const [year, month, day] = dateStr.split("-");
          return `${day}/${month}/${year}`;
        }
        return dateStr;
      }
      return date.toLocaleDateString("vi-VN");
    } catch (error) {
      return dateStr;
    }
  };

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__header">
          <button className="btn" onClick={handleAdd}>
            <i className="ri-add-line"></i> Thêm bài viết
          </button>
        </div>

        <div className="admin-table__filters">
          <form
            className="admin-search-form"
            onSubmit={(e) => {
              e.preventDefault();
              // Search is already handled by searchQuery state
            }}
          >
            <div className="admin-search-wrapper">
              <input
                type="text"
                placeholder="Tìm kiếm bài viết..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="admin-search-input"
              />
              <button type="submit" className="admin-search-btn">
                <i className="ri-search-line"></i> Tìm
              </button>
            </div>
          </form>
        </div>

        <div className="admin-table">
          {loading ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              Đang tải...
            </div>
          ) : filteredPosts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "2rem" }}>
              {searchQuery ? "Không tìm thấy bài viết" : "Chưa có bài viết nào"}
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Ảnh</th>
                  <th>Tiêu đề</th>
                  <th>Danh mục</th>
                  <th>Tác giả</th>
                  <th>Ngày đăng</th>
                  <th>Lượt xem</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {paginatedPosts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <img
                        src={post.cover || "/img/placeholder.jpg"}
                        alt={post.title}
                        style={{
                          width: "60px",
                          height: "40px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                        onError={(e) => {
                          e.currentTarget.src = "/img/placeholder.jpg";
                        }}
                      />
                    </td>
                    <td>
                      <div style={{ maxWidth: "300px" }}>
                        <strong>{post.title}</strong>
                        <br />
                        <small style={{ color: "var(--muted)" }}>
                          {post.excerpt.length > 60
                            ? post.excerpt.substring(0, 60) + "..."
                            : post.excerpt}
                        </small>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge--info">{post.cat}</span>
                    </td>
                    <td>{post.author}</td>
                    <td>{formatDate(post.date)}</td>
                    <td>{post.views || 0}</td>
                    <td>
                      <div className="admin-table__actions">
                        <button
                          className="btn btn--ghost btn-sm"
                          onClick={() => handleEdit(post)}
                        >
                          Sửa
                        </button>
                        <button
                          className="btn btn--ghost btn-sm danger"
                          onClick={() => handleDelete(post.id)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="admin-modal"
            style={{ maxWidth: "700px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal__header">
              <h3>{editingPost ? "Sửa bài viết" : "Thêm bài viết mới"}</h3>
              <button
                className="admin-modal__close"
                onClick={() => setShowAddModal(false)}
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit} className="admin-modal__body">
              <div className="form-group">
                <label>Tiêu đề *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  placeholder="Nhập tiêu đề bài viết"
                />
              </div>

              <div className="form-group">
                <label>Danh mục *</label>
                <select
                  required
                  value={formData.cat}
                  onChange={(e) =>
                    setFormData({ ...formData, cat: e.target.value })
                  }
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Ảnh bìa</label>
                <div className="image-upload-tabs">
                  <button
                    type="button"
                    className={`upload-tab ${
                      imageUploadMethod === "url" ? "active" : ""
                    }`}
                    onClick={() => setImageUploadMethod("url")}
                  >
                    <i className="ri-link"></i> Link URL
                  </button>
                  <button
                    type="button"
                    className={`upload-tab ${
                      imageUploadMethod === "file" ? "active" : ""
                    }`}
                    onClick={() => setImageUploadMethod("file")}
                  >
                    <i className="ri-upload-2-line"></i> Tải lên
                  </button>
                </div>
                {imageUploadMethod === "url" ? (
                  <input
                    type="text"
                    value={formData.cover}
                    onChange={handleImageUrlChange}
                    placeholder="/blog/image.jpg hoặc https://example.com/image.jpg"
                  />
                ) : (
                  <div className="file-upload-wrapper">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="file-input"
                      id="cover-image-upload"
                    />
                    <label
                      htmlFor="cover-image-upload"
                      className="file-upload-label"
                    >
                      <i className="ri-image-add-line"></i>
                      <span>Chọn ảnh từ máy tính</span>
                    </label>
                  </div>
                )}
                {imagePreview && (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Preview" />
                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={() => {
                        setImagePreview("");
                        setFormData({ ...formData, cover: "" });
                      }}
                    >
                      <i className="ri-close-line"></i>
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Tóm tắt *</label>
                <textarea
                  required
                  rows="3"
                  value={formData.excerpt}
                  onChange={(e) =>
                    setFormData({ ...formData, excerpt: e.target.value })
                  }
                  placeholder="Nhập tóm tắt bài viết"
                />
              </div>

              <div className="form-group">
                <label>Nội dung</label>
                <textarea
                  rows="8"
                  value={formData.content}
                  onChange={(e) =>
                    setFormData({ ...formData, content: e.target.value })
                  }
                  placeholder="Nhập nội dung bài viết (HTML được hỗ trợ)"
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div className="form-group">
                  <label>Tác giả</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) =>
                      setFormData({ ...formData, author: e.target.value })
                    }
                    placeholder="Tên tác giả"
                  />
                </div>

                <div className="form-group">
                  <label>Thời gian đọc (phút)</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.readMin}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        readMin: parseInt(e.target.value) || 5,
                      })
                    }
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Tags (phân cách bằng dấu phẩy)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) =>
                    setFormData({ ...formData, tags: e.target.value })
                  }
                  placeholder="Ví dụ: Vitamin, Sức khỏe, Dinh dưỡng"
                />
              </div>

              <div className="form-group">
                <label>Ngày đăng</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                />
              </div>

              <div className="admin-modal__footer">
                <button
                  type="button"
                  className="btn btn--ghost"
                  onClick={() => setShowAddModal(false)}
                >
                  Hủy
                </button>
                <button type="submit" className="btn">
                  {editingPost ? "Cập nhật" : "Thêm mới"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

function StatisticalReports() {
  const [period, setPeriod] = useState("month"); // 'week', 'month', 'year'
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEmployees: 0,
    totalOrders: 0,
    totalRevenue: 0,
    totalProducts: 0,
    pendingOrders: 0,
    shippingOrders: 0,
    deliveredOrders: 0,
    todayOrders: 0,
    todayRevenue: 0,
    newUsersToday: 0,
    monthlyRevenue: [],
    topProducts: [],
    ordersByStatus: [],
  });
  const [detailedStats, setDetailedStats] = useState({
    revenue: [],
    topSellingProducts: [],
    mostViewedProducts: [],
    favoriteProducts: [],
    categoryViews: [],
    totalViews: 0,
  });
  const [allOrders, setAllOrders] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    loadAllData();
  }, []);

  useEffect(() => {
    loadDetailedStats();
  }, [period]);

  async function loadStats() {
    try {
      setLoading(true);
      const data = await adminApi.getDashboardStats();
      setStats(data);
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setLoading(false);
    }
  }

  async function loadAllData() {
    try {
      // Load orders and products for calculations
      const [ordersData, productsData] = await Promise.all([
        adminApi.getAllOrders("all").catch(() => []),
        adminApi.getAllProductsAdmin().catch(() => []),
      ]);
      setAllOrders(ordersData || []);
      setAllProducts(productsData || []);
    } catch (error) {
      console.error("Error loading all data:", error);
    }
  }

  async function loadDetailedStats() {
    try {
      setLoading(true);
      console.log("📊 Loading detailed stats with period:", period);
      const data = await adminApi.getDetailedStatistics(period, "all");
      console.log("📊 Received detailed stats data:", {
        revenue: data?.revenue?.length || 0,
        topSellingProducts: data?.topSellingProducts?.length || 0,
        mostViewedProducts: data?.mostViewedProducts?.length || 0,
        favoriteProducts: data?.favoriteProducts?.length || 0,
        categoryViews: data?.categoryViews?.length || 0,
        totalViews: data?.totalViews,
        fullData: data,
      });

      if (data?.revenue && data.revenue.length > 0) {
        console.log("📊 Revenue data sample:", data.revenue.slice(0, 3));
      } else {
        console.warn("⚠️ No revenue data received!");
      }

      setDetailedStats(
        data || {
          revenue: [],
          topSellingProducts: [],
          mostViewedProducts: [],
          favoriteProducts: [],
          categoryViews: [],
          totalViews: 0,
        }
      );
    } catch (error) {
      console.error("❌ Error loading detailed statistics:", error);
      console.error("❌ Error details:", {
        message: error.message,
        stack: error.stack,
      });
    } finally {
      setLoading(false);
    }
  }

  // Tính toán các metrics liên quan đến web
  const calculateWebMetrics = () => {
    const totalOrders = allOrders.length;
    const totalRevenue = allOrders.reduce(
      (sum, order) => sum + parseFloat(order.finalAmount || 0),
      0
    );
    const totalViews = detailedStats.totalViews || 0;
    const totalProducts = allProducts.length;
    const deliveredOrders = allOrders.filter(
      (o) => o.status === "delivered"
    ).length;

    // Conversion Rate: Tỷ lệ chuyển đổi (đơn hàng / lượt xem sản phẩm)
    const conversionRate =
      totalViews > 0 ? ((totalOrders / totalViews) * 100).toFixed(2) : 0;

    // Average Order Value (AOV)
    const averageOrderValue =
      totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0;

    // Order Completion Rate
    const orderCompletionRate =
      totalOrders > 0 ? ((deliveredOrders / totalOrders) * 100).toFixed(1) : 0;

    // Revenue per Product View
    const revenuePerView =
      totalViews > 0 ? Math.round(totalRevenue / totalViews) : 0;

    // Products per Order (trung bình số sản phẩm mỗi đơn)
    const totalItems = allOrders.reduce(
      (sum, order) => sum + (order.items?.length || 0),
      0
    );
    const avgProductsPerOrder =
      totalOrders > 0 ? (totalItems / totalOrders).toFixed(1) : 0;

    // Top performing category (dựa trên doanh thu)
    const categoryRevenue = {};
    allOrders.forEach((order) => {
      if (order.items) {
        order.items.forEach((item) => {
          const category = item.categoryName || "Khác";
          const revenue = (item.price || 0) * (item.qty || 0);
          categoryRevenue[category] =
            (categoryRevenue[category] || 0) + revenue;
        });
      }
    });
    const topCategory = Object.entries(categoryRevenue).sort(
      (a, b) => b[1] - a[1]
    )[0];

    return {
      conversionRate: parseFloat(conversionRate),
      averageOrderValue,
      orderCompletionRate: parseFloat(orderCompletionRate),
      revenuePerView,
      avgProductsPerOrder: parseFloat(avgProductsPerOrder),
      topCategory: topCategory
        ? { name: topCategory[0], revenue: topCategory[1] }
        : null,
      totalOrders,
      totalRevenue,
      totalViews,
      deliveredOrders,
    };
  };

  // Tính toán xu hướng doanh thu
  const calculateRevenueTrend = () => {
    if (!detailedStats.revenue || detailedStats.revenue.length < 2) {
      return { trend: "stable", percentage: 0 };
    }
    const revenue = detailedStats.revenue;
    const latest = parseFloat(revenue[revenue.length - 1]?.revenue || 0);
    const previous = parseFloat(revenue[revenue.length - 2]?.revenue || 0);
    if (previous === 0) return { trend: "stable", percentage: 0 };
    const percentage = (((latest - previous) / previous) * 100).toFixed(1);
    return {
      trend: latest > previous ? "up" : latest < previous ? "down" : "stable",
      percentage: Math.abs(parseFloat(percentage)),
    };
  };

  const webMetrics = calculateWebMetrics();
  const revenueTrend = calculateRevenueTrend();

  // Export current statistics to Excel (.xlsx) with Vietnamese labels and VND formatting
  const exportToExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Summary sheet (Tổng quan)
      const summary = [
        ["Chỉ số", "Giá trị"],
        ["Tổng đơn hàng", webMetrics.totalOrders || 0],
        ["Tổng doanh thu", formatCurrency(webMetrics.totalRevenue)],
        ["Tổng lượt xem", (webMetrics.totalViews || 0).toLocaleString("vi-VN")],
        ["Tỷ lệ chuyển đổi (%)", `${webMetrics.conversionRate || 0}%`],
        [
          "Giá trị đơn trung bình",
          formatCurrency(webMetrics.averageOrderValue),
        ],
        ["Tỷ lệ hoàn thành (%)", `${webMetrics.orderCompletionRate || 0}%`],
        ["Sản phẩm trung bình / đơn", webMetrics.avgProductsPerOrder || 0],
        [
          "Danh mục hàng đầu",
          webMetrics.topCategory
            ? `${webMetrics.topCategory.name} (${formatCurrency(
                webMetrics.topCategory.revenue
              )})`
            : "-",
        ],
      ];
      const wsSummary = XLSX.utils.aoa_to_sheet(summary);
      XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng quan");

      // Revenue sheet (Doanh thu)
      const revenueRows = [["Kỳ", "Doanh thu"]];
      (detailedStats.revenue || []).forEach((r) => {
        const label = r.period || r.label || "";
        revenueRows.push([formatPeriod(label), formatCurrency(r.revenue || 0)]);
      });
      const wsRevenue = XLSX.utils.aoa_to_sheet(revenueRows);
      XLSX.utils.book_append_sheet(wb, wsRevenue, "Doanh thu");

      // Top selling products (Top bán chạy)
      const topProductsRows = [["Sản phẩm", "Số đã bán", "Doanh thu"]];
      (detailedStats.topSellingProducts || []).forEach((p) => {
        topProductsRows.push([
          p.name || "-",
          p.totalSold || p.sold || 0,
          formatCurrency(p.revenue || 0),
        ]);
      });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(topProductsRows),
        "Top bán chạy"
      );

      // Orders by status (Đơn theo trạng thái)
      const ordersByStatusRows = [["Trạng thái", "Số lượng"]];
      (stats.ordersByStatus || []).forEach((s) => {
        ordersByStatusRows.push([
          s.status || s.label || "-",
          s.count || s.total || 0,
        ]);
      });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(ordersByStatusRows),
        "Đơn theo trạng thái"
      );

      // Recent orders (Đơn (mẫu)) - include basic fields, amount formatted as VND
      const ordersRows = [
        ["Mã đơn", "Ngày", "Khách hàng", "Số tiền", "Trạng thái"],
      ];
      (allOrders || []).slice(0, 1000).forEach((o) => {
        ordersRows.push([
          o.id || o.orderId || "-",
          o.createdAt || o.date || o.orderDate || "",
          o.customerName ||
            (o.customer && (o.customer.name || o.customer.fullName)) ||
            "-",
          formatCurrency(o.finalAmount || o.total || 0),
          o.status || "",
        ]);
      });
      XLSX.utils.book_append_sheet(
        wb,
        XLSX.utils.aoa_to_sheet(ordersRows),
        "Đơn (mẫu)"
      );

      // Generate file and trigger download
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safePeriod = period || "period";
      a.download = `thongke_${safePeriod}_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error exporting Excel:", err);
      alert("Lỗi khi xuất file Excel: " + (err.message || err));
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "4rem",
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <i
          className="ri-loader-4-line"
          style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }}
        ></i>
        <p style={{ fontSize: "1.1rem", color: "var(--muted)" }}>
          Đang tải dữ liệu thống kê...
        </p>
      </div>
    );
  }

  const formatCurrency = (value) => {
    if (!value && value !== 0) return "0đ";
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M đ`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K đ`;
    }
    return `${parseFloat(value).toLocaleString("vi-VN")} đ`;
  };

  const formatPeriod = (periodStr) => {
    if (!periodStr) return "";
    if (period === "week") {
      const [year, week] = periodStr.split("-");
      return `T${week}/${year}`;
    } else if (period === "month") {
      const [year, month] = periodStr.split("-");
      const monthNames = [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
      ];
      return `${monthNames[parseInt(month) - 1]}/${year}`;
    } else if (period === "year") {
      return `Năm ${periodStr}`;
    }
    return periodStr;
  };

  return (
    <div className="admin-reports" style={{ padding: "0" }}>
      {/* Header với Filter */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div
          className="admin-card__header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
          }}
        >
          <div>
            <h2 style={{ margin: 0, fontSize: "1.5rem", fontWeight: "700" }}>
              <i
                className="ri-bar-chart-box-line"
                style={{ marginRight: "0.5rem" }}
              ></i>
              Báo cáo thống kê
            </h2>
            <p
              style={{
                margin: "0.5rem 0 0 0",
                color: "var(--muted)",
                fontSize: "0.9rem",
              }}
            >
              Phân tích dữ liệu và hiệu suất kinh doanh
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "1rem",
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <label style={{ fontWeight: "600", fontSize: "0.9rem" }}>
              Kỳ báo cáo:
            </label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="admin-filter-select"
              style={{
                padding: "0.6rem 1.2rem",
                border: "2px solid var(--line)",
                borderRadius: "8px",
                fontSize: "0.9rem",
                cursor: "pointer",
                background: "white",
                fontWeight: "500",
              }}
            >
              <option value="week">Theo tuần</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
            <button
              className="btn btn--ghost btn-sm"
              onClick={() => {
                loadStats();
                loadDetailedStats();
                loadAllData();
              }}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <i className="ri-refresh-line"></i>
              Làm mới
            </button>
            <button
              className="btn btn--ghost btn-sm"
              onClick={exportToExcel}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <i className="ri-file-excel-2-line"></i>
              Tải xuống Excel
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <MetricCard
          title="Tổng doanh thu"
          value={formatCurrency(webMetrics.totalRevenue)}
          icon="ri-money-dollar-circle-line"
          trend={revenueTrend}
          color="#10b981"
          bgColor="#d1fae5"
        />
        <MetricCard
          title="Tổng đơn hàng"
          value={webMetrics.totalOrders.toLocaleString("vi-VN")}
          icon="ri-shopping-bag-line"
          subtitle={`${webMetrics.deliveredOrders} đã giao`}
          color="#3b82f6"
          bgColor="#dbeafe"
        />
        <MetricCard
          title="Tỷ lệ chuyển đổi"
          value={`${webMetrics.conversionRate}%`}
          icon="ri-line-chart-line"
          subtitle={`${webMetrics.totalViews.toLocaleString("vi-VN")} lượt xem`}
          color="#f59e0b"
          bgColor="#fef3c7"
        />
        <MetricCard
          title="Giá trị đơn trung bình"
          value={formatCurrency(webMetrics.averageOrderValue)}
          icon="ri-price-tag-3-line"
          subtitle={`${webMetrics.avgProductsPerOrder} sản phẩm/đơn`}
          color="#8b5cf6"
          bgColor="#e9d5ff"
        />
        <MetricCard
          title="Tỷ lệ hoàn thành"
          value={`${webMetrics.orderCompletionRate}%`}
          icon="ri-checkbox-circle-line"
          subtitle={`${webMetrics.deliveredOrders}/${webMetrics.totalOrders} đơn`}
          color="#10b981"
          bgColor="#d1fae5"
        />
        <MetricCard
          title="Doanh thu/lượt xem"
          value={formatCurrency(webMetrics.revenuePerView)}
          icon="ri-eye-line"
          subtitle="Hiệu quả marketing"
          color="#ef4444"
          bgColor="#fee2e2"
        />
      </div>

      {/* Revenue & Orders Trend Chart */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-card__header">
          <h3>
            <i
              className="ri-line-chart-line"
              style={{ marginRight: "0.5rem" }}
            ></i>
            Xu hướng doanh thu & đơn hàng
            {period === "week"
              ? " (theo tuần)"
              : period === "month"
              ? " (theo tháng)"
              : " (theo năm)"}
          </h3>
        </div>
        <div style={{ padding: "1.5rem" }}>
          {detailedStats.revenue &&
          Array.isArray(detailedStats.revenue) &&
          detailedStats.revenue.length > 0 ? (
            <RevenueTrendChart data={detailedStats.revenue} period={period} />
          ) : (
            <div className="chart-placeholder">
              <i className="ri-line-chart-line"></i>
              <p>Chưa có dữ liệu doanh thu</p>
            </div>
          )}
        </div>
      </div>

      {/* Revenue Bar Chart */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-card__header">
          <h3>
            <i
              className="ri-bar-chart-2-line"
              style={{ marginRight: "0.5rem" }}
            ></i>
            Biểu đồ doanh thu chi tiết
          </h3>
        </div>
        <div style={{ padding: "1.5rem" }}>
          {detailedStats.revenue &&
          Array.isArray(detailedStats.revenue) &&
          detailedStats.revenue.length > 0 ? (
            <RevenueBarChart data={detailedStats.revenue} period={period} />
          ) : (
            <div className="chart-placeholder">
              <i className="ri-bar-chart-line"></i>
              <p>Chưa có dữ liệu doanh thu</p>
            </div>
          )}
        </div>
      </div>

      {/* Products Analysis Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "1.5rem",
          marginBottom: "1.5rem",
        }}
      >
        {/* Top Selling Products */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h4>
              <i
                className="ri-fire-line"
                style={{ marginRight: "0.5rem", color: "#ef4444" }}
              ></i>
              Top sản phẩm bán chạy
            </h4>
          </div>
          <div style={{ padding: "1.25rem" }}>
            {detailedStats.topSellingProducts &&
            detailedStats.topSellingProducts.length > 0 ? (
              <ProductsPieChart
                data={detailedStats.topSellingProducts}
                dataKey="totalSold"
                nameKey="name"
                title="Top sản phẩm bán chạy"
              />
            ) : (
              <div className="chart-placeholder">
                <i className="ri-pie-chart-line"></i>
                <p>Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* Most Viewed Products */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h4>
              <i
                className="ri-eye-line"
                style={{ marginRight: "0.5rem", color: "#3b82f6" }}
              ></i>
              Sản phẩm được xem nhiều
            </h4>
          </div>
          <div style={{ padding: "1.25rem" }}>
            {detailedStats.mostViewedProducts &&
            detailedStats.mostViewedProducts.length > 0 ? (
              <ProductsPieChart
                data={detailedStats.mostViewedProducts}
                dataKey="viewCount"
                nameKey="name"
                title="Top sản phẩm được xem nhiều"
              />
            ) : (
              <div className="chart-placeholder">
                <i className="ri-pie-chart-line"></i>
                <p>Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* Favorite Products */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h4>
              <i
                className="ri-heart-line"
                style={{ marginRight: "0.5rem", color: "#ef4444" }}
              ></i>
              Sản phẩm yêu thích
            </h4>
          </div>
          <div style={{ padding: "1.25rem" }}>
            {detailedStats.favoriteProducts &&
            detailedStats.favoriteProducts.length > 0 ? (
              <ProductsPieChart
                data={detailedStats.favoriteProducts}
                dataKey="cartCount"
                nameKey="name"
                title="Top sản phẩm yêu thích"
              />
            ) : (
              <div className="chart-placeholder">
                <i className="ri-pie-chart-line"></i>
                <p>Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>

        {/* Category Views */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h4>
              <i
                className="ri-folder-chart-line"
                style={{ marginRight: "0.5rem", color: "#10b981" }}
              ></i>
              Lượt truy cập theo danh mục
            </h4>
          </div>
          <div style={{ padding: "1.25rem" }}>
            {detailedStats.categoryViews &&
            detailedStats.categoryViews.length > 0 ? (
              <ProductsPieChart
                data={detailedStats.categoryViews}
                dataKey="totalViews"
                nameKey="name"
                title="Lượt truy cập theo danh mục"
              />
            ) : (
              <div className="chart-placeholder">
                <i className="ri-pie-chart-line"></i>
                <p>Chưa có dữ liệu</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "1.5rem",
        }}
      >
        {/* Orders by Status */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h4>
              <i
                className="ri-file-list-3-line"
                style={{ marginRight: "0.5rem" }}
              ></i>
              Đơn hàng theo trạng thái
            </h4>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <div className="stat-list">
              <div className="stat-item">
                <span>
                  <i
                    className="ri-time-line"
                    style={{ marginRight: "0.5rem", color: "#f59e0b" }}
                  ></i>
                  Chờ xử lý
                </span>
                <strong>{stats.pendingOrders || 0}</strong>
              </div>
              <div className="stat-item">
                <span>
                  <i
                    className="ri-truck-line"
                    style={{ marginRight: "0.5rem", color: "#3b82f6" }}
                  ></i>
                  Đang giao
                </span>
                <strong>{stats.shippingOrders || 0}</strong>
              </div>
              <div className="stat-item">
                <span>
                  <i
                    className="ri-checkbox-circle-line"
                    style={{ marginRight: "0.5rem", color: "#10b981" }}
                  ></i>
                  Đã giao
                </span>
                <strong>{stats.deliveredOrders || 0}</strong>
              </div>
              <div className="stat-item">
                <span>
                  <i
                    className="ri-close-circle-line"
                    style={{ marginRight: "0.5rem", color: "#ef4444" }}
                  ></i>
                  Đã hủy
                </span>
                <strong>
                  {allOrders.filter((o) => o.status === "cancelled").length}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Activity */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h4>
              <i
                className="ri-calendar-todo-line"
                style={{ marginRight: "0.5rem" }}
              ></i>
              Hoạt động hôm nay
            </h4>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <div className="stat-list">
              <div className="stat-item">
                <span>
                  <i
                    className="ri-shopping-bag-line"
                    style={{ marginRight: "0.5rem" }}
                  ></i>
                  Đơn hàng mới
                </span>
                <strong>{stats.todayOrders || 0}</strong>
              </div>
              <div className="stat-item">
                <span>
                  <i
                    className="ri-user-add-line"
                    style={{ marginRight: "0.5rem" }}
                  ></i>
                  Người dùng mới
                </span>
                <strong>{stats.newUsersToday || 0}</strong>
              </div>
              <div className="stat-item">
                <span>
                  <i
                    className="ri-money-dollar-circle-line"
                    style={{ marginRight: "0.5rem" }}
                  ></i>
                  Doanh thu
                </span>
                <strong>{formatCurrency(stats.todayRevenue || 0)}</strong>
              </div>
              <div className="stat-item">
                <span>
                  <i
                    className="ri-eye-line"
                    style={{ marginRight: "0.5rem" }}
                  ></i>
                  Tổng lượt xem
                </span>
                <strong>
                  {detailedStats.totalViews?.toLocaleString("vi-VN") || 0}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h4>
              <i
                className="ri-dashboard-line"
                style={{ marginRight: "0.5rem" }}
              ></i>
              Chỉ số hiệu suất
            </h4>
          </div>
          <div style={{ padding: "1.5rem" }}>
            <div className="stat-list">
              <div className="stat-item">
                <span>Tỷ lệ chuyển đổi</span>
                <strong style={{ color: "#10b981" }}>
                  {webMetrics.conversionRate}%
                </strong>
              </div>
              <div className="stat-item">
                <span>Giá trị đơn trung bình</span>
                <strong style={{ color: "#3b82f6" }}>
                  {formatCurrency(webMetrics.averageOrderValue)}
                </strong>
              </div>
              <div className="stat-item">
                <span>Tỷ lệ hoàn thành</span>
                <strong style={{ color: "#10b981" }}>
                  {webMetrics.orderCompletionRate}%
                </strong>
              </div>
              {webMetrics.topCategory && (
                <div className="stat-item">
                  <span>Danh mục hàng đầu</span>
                  <strong style={{ color: "#8b5cf6" }}>
                    {webMetrics.topCategory.name}
                  </strong>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Metric Card Component
function MetricCard({ title, value, icon, subtitle, trend, color, bgColor }) {
  return (
    <div
      className="admin-card"
      style={{
        background: `linear-gradient(135deg, ${bgColor} 0%, white 100%)`,
        border: `2px solid ${color}20`,
        transition: "transform 0.2s, box-shadow 0.2s",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 8px 16px ${color}20`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ padding: "1.5rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "12px",
              background: bgColor,
              color: color,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "1.5rem",
            }}
          >
            <i className={icon}></i>
          </div>
          {trend && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                color:
                  trend.trend === "up"
                    ? "#10b981"
                    : trend.trend === "down"
                    ? "#ef4444"
                    : "#64748b",
                fontSize: "0.85rem",
                fontWeight: "600",
              }}
            >
              <i
                className={
                  trend.trend === "up"
                    ? "ri-arrow-up-line"
                    : trend.trend === "down"
                    ? "ri-arrow-down-line"
                    : "ri-subtract-line"
                }
              ></i>
              {trend.percentage}%
            </div>
          )}
        </div>
        <h3
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "1.8rem",
            fontWeight: "700",
            color: "#1e293b",
          }}
        >
          {value}
        </h3>
        <p
          style={{
            margin: "0 0 0.25rem 0",
            fontSize: "0.9rem",
            fontWeight: "600",
            color: "#475569",
          }}
        >
          {title}
        </p>
        {subtitle && (
          <p
            style={{
              margin: "0",
              fontSize: "0.8rem",
              color: "var(--muted)",
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

// Revenue Trend Chart Component (Line + Area)
function RevenueTrendChart({ data, period }) {
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M đ`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K đ`;
    }
    return `${value.toLocaleString("vi-VN")} đ`;
  };

  const formatPeriod = (periodStr) => {
    if (!periodStr) return "";
    if (period === "week") {
      const [year, week] = periodStr.split("-");
      return `T${week}`;
    } else if (period === "month") {
      const [year, month] = periodStr.split("-");
      const monthNames = [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
      ];
      return monthNames[parseInt(month) - 1];
    } else if (period === "year") {
      return periodStr;
    }
    return periodStr;
  };

  const chartData = data.map((item) => ({
    period: formatPeriod(item.period),
    doanhThu: parseFloat(item.revenue || 0),
    soDon: parseInt(item.orderCount || 0),
  }));

  if (!chartData || chartData.length === 0) {
    return (
      <div
        style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}
      >
        <p>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="period"
            angle={-45}
            textAnchor="end"
            height={80}
            style={{ fontSize: "12px" }}
            stroke="#64748b"
          />
          <YAxis
            yAxisId="left"
            stroke="#64748b"
            tickFormatter={formatCurrency}
            style={{ fontSize: "12px" }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="#64748b"
            style={{ fontSize: "12px" }}
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "doanhThu") {
                return [formatCurrency(value), "Doanh thu"];
              }
              return [value, "Số đơn"];
            }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            labelStyle={{ marginBottom: "4px", fontWeight: 600 }}
          />
          <Legend />
          <Area
            yAxisId="left"
            type="monotone"
            dataKey="doanhThu"
            fill="url(#colorRevenue)"
            stroke="#3b82f6"
            strokeWidth={2}
            name="Doanh thu"
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="soDon"
            stroke="#10b981"
            strokeWidth={3}
            dot={{ fill: "#10b981", r: 4 }}
            activeDot={{ r: 6 }}
            name="Số đơn hàng"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}

// Revenue Bar Chart Component
function RevenueBarChart({ data, period }) {
  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M đ`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K đ`;
    }
    return `${value.toLocaleString("vi-VN")} đ`;
  };

  const formatPeriod = (periodStr) => {
    if (!periodStr) return "";
    if (period === "week") {
      const [year, week] = periodStr.split("-");
      return `T${week}`;
    } else if (period === "month") {
      const [year, month] = periodStr.split("-");
      const monthNames = [
        "T1",
        "T2",
        "T3",
        "T4",
        "T5",
        "T6",
        "T7",
        "T8",
        "T9",
        "T10",
        "T11",
        "T12",
      ];
      return monthNames[parseInt(month) - 1];
    } else if (period === "year") {
      return periodStr;
    }
    return periodStr;
  };

  const chartData = data.map((item) => ({
    period: formatPeriod(item.period),
    doanhThu: parseFloat(item.revenue || 0),
    soDon: parseInt(item.orderCount || 0),
  }));

  if (!chartData || chartData.length === 0) {
    return (
      <div
        style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}
      >
        <p>Không có dữ liệu để hiển thị</p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: "400px" }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="period"
            angle={-45}
            textAnchor="end"
            height={80}
            style={{ fontSize: "12px" }}
            stroke="#64748b"
          />
          <YAxis
            tickFormatter={formatCurrency}
            style={{ fontSize: "12px" }}
            stroke="#64748b"
          />
          <Tooltip
            formatter={(value, name) => {
              if (name === "doanhThu") {
                return [formatCurrency(value), "Doanh thu"];
              }
              return [value, "Số đơn"];
            }}
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "8px 12px",
            }}
            labelStyle={{ marginBottom: "4px", fontWeight: 600 }}
          />
          <Legend />
          <Bar
            dataKey="doanhThu"
            fill="#3b82f6"
            name="Doanh thu"
            radius={[8, 8, 0, 0]}
          />
          <Bar
            dataKey="soDon"
            fill="#10b981"
            name="Số đơn hàng"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Products Pie Chart Component
function ProductsPieChart({ data, dataKey, nameKey, title }) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div
        style={{
          padding: "3rem 2rem",
          textAlign: "center",
          color: "var(--muted)",
        }}
      >
        <i
          className="ri-pie-chart-line"
          style={{ fontSize: "3rem", opacity: 0.3 }}
        ></i>
        <p style={{ marginTop: "1rem" }}>Chưa có dữ liệu để hiển thị</p>
      </div>
    );
  }

  // Take top 5 for better visualization
  const topData = data.slice(0, 5);
  const total = topData.reduce(
    (sum, item) => sum + parseFloat(item[dataKey] || 0),
    0
  );

  if (total === 0) {
    return (
      <div
        style={{
          padding: "3rem 2rem",
          textAlign: "center",
          color: "var(--muted)",
        }}
      >
        <i
          className="ri-bar-chart-line"
          style={{ fontSize: "3rem", opacity: 0.3 }}
        ></i>
        <p style={{ marginTop: "1rem" }}>Tất cả giá trị đều bằng 0</p>
      </div>
    );
  }

  const chartData = topData.map((item, index) => ({
    name: (item[nameKey] || "N/A").substring(0, 25),
    fullName: item[nameKey] || "N/A",
    value: parseFloat(item[dataKey] || 0),
    percentage:
      total > 0
        ? ((parseFloat(item[dataKey] || 0) / total) * 100).toFixed(1)
        : 0,
    index,
  }));

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const formatValue = (value) => {
    if (dataKey === "totalSold" || dataKey === "cartCount") {
      return value.toLocaleString("vi-VN");
    }
    return value.toLocaleString("vi-VN");
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Biểu đồ tròn - gọn gàng hơn, không có label trên biểu đồ */}
      <div style={{ width: "100%", height: "280px", marginBottom: "1rem" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={false} // Ẩn label trên biểu đồ để gọn hơn
              outerRadius={90}
              innerRadius={45}
              fill="#8884d8"
              dataKey="value"
              paddingAngle={3}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="#fff"
                  strokeWidth={2.5}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name, props) => [
                `${formatValue(value)} (${props.payload.percentage}%)`,
                props.payload.fullName,
              ]}
              contentStyle={{
                backgroundColor: "#fff",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 14px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{
                fontWeight: 600,
                marginBottom: "6px",
                fontSize: "0.9rem",
                color: "#1e293b",
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend và thông tin - layout gọn gàng hơn */}
      <div
        style={{
          padding: "1rem",
          background: "linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)",
          borderRadius: "10px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
        }}
      >
        {/* Tổng cộng */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: "0.75rem",
            marginBottom: "0.75rem",
            borderBottom: "1px solid #e2e8f0",
          }}
        >
          <span
            style={{
              fontSize: "0.875rem",
              color: "#64748b",
              fontWeight: "500",
            }}
          >
            Tổng cộng:
          </span>
          <strong
            style={{
              fontSize: "1.125rem",
              color: "#1e293b",
              fontWeight: "700",
            }}
          >
            {formatValue(total)}
          </strong>
        </div>

        {/* Danh sách items - layout gọn gàng, dạng grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {chartData.map((item, index) => (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem",
                borderRadius: "6px",
                background: index < 3 ? "#f1f5f9" : "transparent",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#e2e8f0";
                e.currentTarget.style.transform = "translateX(2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background =
                  index < 3 ? "#f1f5f9" : "transparent";
                e.currentTarget.style.transform = "translateX(0)";
              }}
            >
              <div
                style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "4px",
                  background: COLORS[index % COLORS.length],
                  flexShrink: 0,
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                }}
              ></div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#1e293b",
                    fontWeight: "500",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                  title={item.fullName}
                >
                  {item.name}
                </div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#64748b",
                    marginTop: "2px",
                  }}
                >
                  {item.percentage}%
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
