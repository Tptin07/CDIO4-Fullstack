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
} from "recharts";
import "../assets/css/admin.css";

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
    if (!amount) return "0đ";
    return parseFloat(amount).toLocaleString("vi-VN") + "đ";
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
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

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

  const handleAdd = () => {
    setFormData({ name: "", email: "", phone: "", password: "" });
    setShowAddModal(true);
  };

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      await adminApi.createUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password || "123456",
        role: "customer",
      });
      alert("Thêm người dùng thành công!");
      setShowAddModal(false);
      // Reload danh sách từ database
      await loadUsers();
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Lỗi: " + (error.message || "Không thể lưu dữ liệu"));
    }
  }

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__header">
          <div className="admin-actions">
            <input
              type="text"
              placeholder="Tìm kiếm người dùng..."
              className="admin-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="btn" onClick={handleAdd}>
              Thêm người dùng
            </button>
          </div>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Trạng thái</th>
                <th>Ngày tham gia</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Đang tải...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td
                    colSpan="7"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>{user.id}</td>
                    <td>
                      <strong>{user.name}</strong>
                    </td>
                    <td>{user.email}</td>
                    <td>{user.phone || "-"}</td>
                    <td>
                      {user.status || user.statusText ? (
                        <span
                          className={`badge badge--${
                            user.statusBadge ||
                            (user.status === "banned"
                              ? "locked"
                              : user.status === "inactive"
                              ? "inactive"
                              : "active")
                          }`}
                          title={user.statusDescription || ""}
                        >
                          {user.statusText ||
                            (user.status === "banned"
                              ? "Đã khóa"
                              : user.status === "active"
                              ? "Hoạt động"
                              : user.status === "inactive"
                              ? "Không hoạt động"
                              : "Hoạt động")}
                        </span>
                      ) : (
                        <span className="badge badge--active">Hoạt động</span>
                      )}
                    </td>
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
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div
          className="admin-modal-backdrop"
          onClick={() => setShowAddModal(false)}
        >
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal__header">
              <h3>Thêm người dùng</h3>
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Mật khẩu *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
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

// Manage Employees Component
function ManageEmployees() {
  const [employees, setEmployees] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "employee",
  });

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
    setShowAddModal(true);
  };

  async function handleSubmit(e) {
    e.preventDefault();
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
      // Reload danh sách từ database
      await loadEmployees();
    } catch (error) {
      console.error("Error creating employee:", error);
      alert("Lỗi: " + (error.message || "Không thể lưu dữ liệu"));
    }
  }

  return (
    <>
      <div className="admin-card">
        <div className="admin-card__header">
          <button className="btn" onClick={handleAdd}>
            Thêm nhân viên
          </button>
        </div>
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Họ tên</th>
                <th>Email</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
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
              ) : employees.length === 0 ? (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: "center", padding: "2rem" }}
                  >
                    Chưa có nhân viên nào
                  </td>
                </tr>
              ) : (
                employees.map((emp) => (
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
                      {emp.status || emp.statusText ? (
                        <span
                          className={`badge badge--${
                            emp.statusBadge ||
                            (emp.status === "banned"
                              ? "locked"
                              : emp.status === "inactive"
                              ? "inactive"
                              : "active")
                          }`}
                          title={emp.statusDescription || ""}
                        >
                          {emp.statusText ||
                            (emp.status === "banned"
                              ? "Đã khóa"
                              : emp.status === "active"
                              ? "Hoạt động"
                              : emp.status === "inactive"
                              ? "Không hoạt động"
                              : "Hoạt động")}
                        </span>
                      ) : (
                        <span className="badge badge--active">Hoạt động</span>
                      )}
                    </td>
                    <td>
                      <div className="admin-actions-inline">
                        <button
                          className={`btn btn--ghost btn-sm ${
                            emp.locked ? "success" : "warning"
                          }`}
                          onClick={() => handleToggleLock(emp.id)}
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
                ))
              )}
            </tbody>
          </table>
        </div>
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
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
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
                  Vai trò mặc định: Nhân viên (theo cấu trúc database)
                </small>
              </div>
              <div className="form-group">
                <label>Mật khẩu *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
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
            categories.map((cat) => (
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
                            <td>
                              <span
                                className={`badge badge--${
                                  product.status === "active"
                                    ? "active"
                                    : "inactive"
                                }`}
                              >
                                {product.status === "active"
                                  ? "Hoạt động"
                                  : "Không hoạt động"}
                              </span>
                            </td>
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
                {sortedProducts.map((product) => (
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
                    placeholder="Ví dụ: PharmaCity"
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
  const [filter, setFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadOrders();
  }, [filter]);

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
                Tất cả ({orders.length})
              </button>
              <button
                className={`filter-chip ${
                  filter === "pending" ? "active" : ""
                }`}
                onClick={() => setFilter("pending")}
              >
                Chờ xử lý ({orders.filter((o) => o.status === "pending").length}
                )
              </button>
              <button
                className={`filter-chip ${
                  filter === "shipping" ? "active" : ""
                }`}
                onClick={() => setFilter("shipping")}
              >
                Đang giao (
                {orders.filter((o) => o.status === "shipping").length})
              </button>
              <button
                className={`filter-chip ${
                  filter === "delivered" ? "active" : ""
                }`}
                onClick={() => setFilter("delivered")}
              >
                Đã giao ({orders.filter((o) => o.status === "delivered").length}
                )
              </button>
              <button
                className={`filter-chip ${
                  filter === "cancelled" ? "active" : ""
                }`}
                onClick={() => setFilter("cancelled")}
              >
                Đã hủy ({orders.filter((o) => o.status === "cancelled").length})
              </button>
            </div>
          </div>
        </div>
        <div className="admin-table">
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
                filteredOrders.map((order) => (
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
      setPromotions(Array.isArray(data) ? data : []);
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
    const statusMap = {
      active: { text: "Hoạt động", class: "active" },
      inactive: { text: "Không hoạt động", class: "inactive" },
      expired: { text: "Hết hạn", class: "warning" },
    };
    return statusMap[status] || { text: status, class: "inactive" };
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
                  <th>Loại giảm giá</th>
                  <th>Giá trị</th>
                  <th>Đơn tối thiểu</th>
                  <th>Đã dùng</th>
                  <th>Hiệu lực</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredPromotions.map((promo) => {
                  const statusInfo = getStatusBadge(promo.status);
                  const expired = isExpired(promo.valid_until);
                  return (
                    <tr key={promo.id}>
                      <td>
                        <strong style={{ color: "var(--primary)" }}>
                          {promo.code}
                        </strong>
                      </td>
                      <td>
                        <div style={{ maxWidth: "200px" }}>
                          <strong>{promo.name}</strong>
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
                        <span className="badge badge--info">
                          {promo.discount_type === "percentage"
                            ? "Phần trăm"
                            : "Số tiền cố định"}
                        </span>
                      </td>
                      <td>
                        {promo.discount_type === "percentage"
                          ? `${promo.discount_value}%`
                          : formatCurrency(promo.discount_value)}
                        {promo.max_discount &&
                          promo.discount_type === "percentage" && (
                            <>
                              <br />
                              <small style={{ color: "var(--muted)" }}>
                                Tối đa: {formatCurrency(promo.max_discount)}
                              </small>
                            </>
                          )}
                      </td>
                      <td>{formatCurrency(promo.min_purchase)}</td>
                      <td>
                        {promo.used_count || 0}
                        {promo.usage_limit && ` / ${promo.usage_limit}`}
                      </td>
                      <td>
                        <div style={{ fontSize: "13px" }}>
                          <div>
                            <strong>Từ:</strong> {formatDate(promo.valid_from)}
                          </div>
                          <div>
                            <strong>Đến:</strong>{" "}
                            {formatDate(promo.valid_until)}
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
                        <span className={`badge badge--${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
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
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingService, setEditingService] = useState(null);
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
  }, [statusFilter]);

  async function loadServices() {
    try {
      setLoading(true);
      const data = await adminApi.getAllServicesAdmin(statusFilter, search);
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

  const filteredServices = search
    ? services.filter((s) =>
        (s.name + s.serviceCode).toLowerCase().includes(search.toLowerCase())
      )
    : services;

  return (
    <>
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
          <select
            className="admin-filter-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Ngưng hoạt động</option>
          </select>
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
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredServices.map((service) => (
                <tr key={service.id}>
                  <td>{service.serviceCode}</td>
                  <td>
                    <strong>{service.name}</strong>
                    <br />
                    <small className="muted">
                      {service.description?.slice(0, 60) || "—"}
                    </small>
                  </td>
                  <td>{service.duration || "—"}</td>
                  <td>{service.price || "Liên hệ"}</td>
                  <td>
                    <span
                      className={`badge badge--${
                        service.status === "active" ? "active" : "inactive"
                      }`}
                    >
                      {service.status === "active"
                        ? "Hoạt động"
                        : "Ngưng hoạt động"}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions-inline">
                      <button
                        className="btn btn--ghost btn-sm"
                        onClick={() => openModal(service)}
                      >
                        Sửa
                      </button>
                      <button
                        className="btn btn--ghost btn-sm danger"
                        onClick={() => handleDelete(service)}
                      >
                        Vô hiệu hóa
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
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
              <div className="form-group">
                <label>Trạng thái</label>
                <select
                  value={formData.status}
                  onChange={(e) =>
                    setFormData({ ...formData, status: e.target.value })
                  }
                >
                  <option value="active">Hoạt động</option>
                  <option value="inactive">Ngưng hoạt động</option>
                </select>
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
              {appointments.map((appointment) => {
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
                {filteredPosts.map((post) => (
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
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
      alert(
        "Lỗi khi tải thống kê: " +
          (error.message || "Không thể kết nối đến server")
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadDetailedStats() {
    try {
      console.log("📊 Loading detailed stats with period:", period);
      const data = await adminApi.getDetailedStatistics(period, "all");
      console.log("📊 Received data:", data);
      setDetailedStats(data);
    } catch (error) {
      console.error("❌ Error loading detailed statistics:", error);
      alert(
        "Lỗi khi tải thống kê chi tiết: " +
          (error.message || "Không thể kết nối đến server")
      );
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Đang tải thống kê...
      </div>
    );
  }

  const formatCurrency = (value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString("vi-VN");
  };

  const formatPeriod = (periodStr) => {
    if (!periodStr) return "";
    if (period === "week") {
      const [year, week] = periodStr.split("-");
      return `Tuần ${week}/${year}`;
    } else if (period === "month") {
      const [year, month] = periodStr.split("-");
      const monthNames = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ];
      return `${monthNames[parseInt(month) - 1]} ${year}`;
    } else if (period === "year") {
      return `Năm ${periodStr}`;
    }
    return periodStr;
  };

  return (
    <div className="admin-reports">
      {/* Filter Controls */}
      <div className="admin-card" style={{ marginBottom: "1.5rem" }}>
        <div className="admin-card__header">
          <h3>Bộ lọc thống kê</h3>
          <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
            <label style={{ fontWeight: "600" }}>Chọn kỳ:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              style={{
                padding: "0.5rem 1rem",
                border: "2px solid var(--line)",
                borderRadius: "var(--btn-radius)",
                fontSize: "var(--font-size-sm)",
                cursor: "pointer",
              }}
            >
              <option value="week">Theo tuần</option>
              <option value="month">Theo tháng</option>
              <option value="year">Theo năm</option>
            </select>
          </div>
        </div>
      </div>

      {/* Revenue Chart - Bar Chart */}
      <div className="admin-card">
        <div className="admin-card__header">
          <h3>
            Biểu đồ doanh thu{" "}
            {period === "week"
              ? "theo tuần"
              : period === "month"
              ? "theo tháng"
              : "theo năm"}
          </h3>
        </div>
        <div className="report-chart" style={{ padding: "1.5rem" }}>
          {detailedStats.revenue &&
          Array.isArray(detailedStats.revenue) &&
          detailedStats.revenue.length > 0 ? (
            <RevenueBarChart data={detailedStats.revenue} period={period} />
          ) : (
            <div className="chart-placeholder">
              <i className="ri-bar-chart-line"></i>
              <p>Chưa có dữ liệu doanh thu</p>
              <small>
                {detailedStats.revenue
                  ? `Dữ liệu: ${JSON.stringify(detailedStats.revenue).substring(
                      0,
                      100
                    )}...`
                  : "Đang tải dữ liệu..."}
              </small>
            </div>
          )}
        </div>
      </div>

      {/* Pie Charts Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginTop: "1.5rem",
        }}
      >
        {/* Top Selling Products Pie Chart */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h4>Sản phẩm bán chạy</h4>
          </div>
          <div style={{ padding: "1.5rem" }}>
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

        {/* Most Viewed Products Pie Chart */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h4>Sản phẩm được xem nhiều</h4>
          </div>
          <div style={{ padding: "1.5rem" }}>
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

        {/* Favorite Products Pie Chart */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h4>Sản phẩm yêu thích</h4>
          </div>
          <div style={{ padding: "1.5rem" }}>
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

        {/* Category Views Pie Chart */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h4>Lượt truy cập theo danh mục</h4>
          </div>
          <div style={{ padding: "1.5rem" }}>
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

      {/* Summary Stats */}
      <div
        className="admin-stats-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1.5rem",
          marginTop: "1.5rem",
        }}
      >
        <div className="admin-card">
          <h4>Đơn hàng theo trạng thái</h4>
          <div className="stat-list">
            <div className="stat-item">
              <span>Chờ xử lý</span>
              <strong>{stats.pendingOrders || 0}</strong>
            </div>
            <div className="stat-item">
              <span>Đang giao</span>
              <strong>{stats.shippingOrders || 0}</strong>
            </div>
            <div className="stat-item">
              <span>Đã giao</span>
              <strong>{stats.deliveredOrders || 0}</strong>
            </div>
          </div>
        </div>

        <div className="admin-card">
          <h4>Hoạt động hôm nay</h4>
          <div className="stat-list">
            <div className="stat-item">
              <span>Đơn hàng mới</span>
              <strong>{stats.todayOrders || 0}</strong>
            </div>
            <div className="stat-item">
              <span>Người dùng mới</span>
              <strong>{stats.newUsersToday || 0}</strong>
            </div>
            <div className="stat-item">
              <span>Doanh thu</span>
              <strong>{formatCurrency(stats.todayRevenue || 0)}đ</strong>
            </div>
            <div className="stat-item">
              <span>Tổng lượt xem</span>
              <strong>
                {detailedStats.totalViews?.toLocaleString("vi-VN") || 0}
              </strong>
            </div>
          </div>
        </div>
      </div>
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
      return `T${week}/${year}`;
    } else if (period === "month") {
      const [year, month] = periodStr.split("-");
      return `T${month}/${year}`;
    } else if (period === "year") {
      return `Năm ${periodStr}`;
    }
    return periodStr;
  };

  const chartData = data.map((item) => ({
    period: formatPeriod(item.period),
    doanhThu: parseFloat(item.revenue || 0),
    soDon: parseInt(item.orderCount || 0),
  }));

  console.log("📊 Chart data:", chartData);

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
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="period"
            angle={-45}
            textAnchor="end"
            height={100}
            style={{ fontSize: "12px" }}
          />
          <YAxis tickFormatter={formatCurrency} />
          <Tooltip
            formatter={(value, name) => {
              if (name === "doanhThu") {
                return [formatCurrency(value), "Doanh thu"];
              }
              return [value, "Số đơn"];
            }}
          />
          <Legend />
          <Bar dataKey="doanhThu" fill="#3b82f6" name="Doanh thu" />
          <Bar dataKey="soDon" fill="#10b981" name="Số đơn hàng" />
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
        style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}
      >
        <p>Không có dữ liệu để hiển thị</p>
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
        style={{ padding: "2rem", textAlign: "center", color: "var(--muted)" }}
      >
        <p>Tất cả giá trị đều bằng 0</p>
      </div>
    );
  }

  const chartData = topData.map((item) => ({
    name: (item[nameKey] || "N/A").substring(0, 20), // Giới hạn độ dài tên
    value: parseFloat(item[dataKey] || 0),
    percentage:
      total > 0
        ? ((parseFloat(item[dataKey] || 0) / total) * 100).toFixed(1)
        : 0,
  }));

  console.log("📊 Pie chart data:", { dataKey, nameKey, chartData, total });

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  const formatValue = (value) => {
    if (dataKey === "totalSold" || dataKey === "cartCount") {
      return value.toLocaleString("vi-VN");
    }
    return value.toLocaleString("vi-VN");
  };

  return (
    <div>
      <div style={{ width: "100%", height: "300px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => {
                // Hiển thị tên ngắn gọn hơn
                const shortName =
                  name.length > 15 ? name.substring(0, 15) + "..." : name;
                return `${shortName}: ${percentage}%`;
              }}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => formatValue(value)}
              labelStyle={{ fontWeight: "bold" }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div
        style={{
          marginTop: "1rem",
          fontSize: "0.875rem",
          color: "var(--muted)",
        }}
      >
        <strong>Tổng:</strong> {formatValue(total)}
      </div>
    </div>
  );
}
