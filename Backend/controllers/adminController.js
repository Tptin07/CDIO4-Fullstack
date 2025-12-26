import { query } from "../config/database.js";
import * as notificationModel from "../models/notificationModel.js";
import {
  getServices as getServicesModel,
  getServiceById as getServiceByIdModel,
  createService as createServiceModel,
  updateService as updateServiceModel,
  softDeleteService,
  ensureServiceCodeUnique,
} from "../models/serviceModel.js";
import {
  getAppointmentsAdmin as getAppointmentsAdminModel,
  getAppointmentById as getAppointmentByIdModel,
  updateAppointmentStatus as updateAppointmentStatusModel,
  deleteAppointmentById,
} from "../models/appointmentModel.js";

// ===== DASHBOARD STATS =====
export async function getDashboardStats(req, res) {
  try {
    // Tổng số người dùng (customer)
    const usersResult = await query(
      "SELECT COUNT(*) as total FROM users WHERE role = ?",
      ["customer"]
    );
    const totalUsers = parseInt(usersResult[0]?.total || 0);

    // Tổng số nhân viên
    const employeesResult = await query(
      "SELECT COUNT(*) as total FROM users WHERE role = ?",
      ["employee"]
    );
    const totalEmployees = parseInt(employeesResult[0]?.total || 0);

    // Tổng số đơn hàng
    const ordersResult = await query("SELECT COUNT(*) as total FROM orders");
    const totalOrders = parseInt(ordersResult[0]?.total || 0);

    // Tổng doanh thu (từ các đơn đã giao và đang giao)
    const revenueResult = await query(
      `SELECT COALESCE(SUM(final_amount), 0) as total 
       FROM orders 
       WHERE status IN ('delivered', 'shipping', 'confirmed')`
    );
    const totalRevenue = parseFloat(revenueResult[0]?.total || 0);

    // Doanh thu hôm nay
    const todayRevenueResult = await query(
      `SELECT COALESCE(SUM(final_amount), 0) as total 
       FROM orders 
       WHERE DATE(created_at) = CURDATE() 
       AND status IN ('delivered', 'shipping', 'confirmed')`
    );
    const todayRevenue = parseFloat(todayRevenueResult[0]?.total || 0);

    // Tổng số sản phẩm
    const productsResult = await query(
      "SELECT COUNT(*) as total FROM products WHERE status = ?",
      ["active"]
    );
    const totalProducts = parseInt(productsResult[0]?.total || 0);

    // Đơn hàng chờ xử lý
    const pendingResult = await query(
      "SELECT COUNT(*) as total FROM orders WHERE status = ?",
      ["pending"]
    );
    const pendingOrders = parseInt(pendingResult[0]?.total || 0);

    // Đơn hàng đang giao
    const shippingResult = await query(
      "SELECT COUNT(*) as total FROM orders WHERE status = ?",
      ["shipping"]
    );
    const shippingOrders = parseInt(shippingResult[0]?.total || 0);

    // Đơn hàng đã giao
    const deliveredResult = await query(
      "SELECT COUNT(*) as total FROM orders WHERE status = ?",
      ["delivered"]
    );
    const deliveredOrders = parseInt(deliveredResult[0]?.total || 0);

    // Đơn hàng hôm nay
    const todayResult = await query(
      `SELECT COUNT(*) as total 
       FROM orders 
       WHERE DATE(created_at) = CURDATE()`
    );
    const todayOrders = parseInt(todayResult[0]?.total || 0);

    // Người dùng mới hôm nay
    const newUsersTodayResult = await query(
      `SELECT COUNT(*) as total 
       FROM users 
       WHERE DATE(created_at) = CURDATE() 
       AND role = ?`,
      ["customer"]
    );
    const newUsersToday = parseInt(newUsersTodayResult[0]?.total || 0);

    // Doanh thu theo tháng (7 tháng gần nhất)
    const monthlyRevenueResult = await query(
      `SELECT 
        DATE_FORMAT(created_at, '%Y-%m') as month,
        COALESCE(SUM(final_amount), 0) as revenue
       FROM orders 
       WHERE status IN ('delivered', 'shipping', 'confirmed')
       AND created_at >= DATE_SUB(CURDATE(), INTERVAL 7 MONTH)
       GROUP BY DATE_FORMAT(created_at, '%Y-%m')
       ORDER BY month ASC`
    );
    const monthlyRevenue = monthlyRevenueResult || [];

    // Top 5 sản phẩm bán chạy nhất
    const topProductsResult = await query(
      `SELECT 
        p.id,
        p.name,
        p.image,
        p.price,
        SUM(oi.quantity) as total_sold,
        SUM(oi.subtotal) as total_revenue
       FROM products p
       INNER JOIN order_items oi ON p.id = oi.product_id
       INNER JOIN orders o ON oi.order_id = o.id
       WHERE o.status IN ('delivered', 'shipping', 'confirmed')
       GROUP BY p.id, p.name, p.image, p.price
       ORDER BY total_sold DESC
       LIMIT 5`
    );
    const topProducts = topProductsResult || [];

    // Đơn hàng theo trạng thái
    const ordersByStatusResult = await query(
      `SELECT 
        status,
        COUNT(*) as count
       FROM orders
       GROUP BY status`
    );
    const ordersByStatus = ordersByStatusResult || [];

    res.json({
      success: true,
      data: {
        // Tổng quan
        totalUsers,
        totalEmployees,
        totalOrders,
        totalRevenue,
        totalProducts,

        // Hôm nay
        todayOrders,
        todayRevenue,
        newUsersToday,

        // Đơn hàng theo trạng thái
        pendingOrders,
        shippingOrders,
        deliveredOrders,

        // Thống kê chi tiết
        monthlyRevenue,
        topProducts,
        ordersByStatus,
      },
    });
  } catch (error) {
    console.error("Error getting dashboard stats:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê",
      error: error.message,
    });
  }
}

// ===== USERS MANAGEMENT =====
export async function getAllUsers(req, res) {
  try {
    const users = await query(
      `SELECT id, name, email, phone, role, status, created_at as createdAt
       FROM users 
       WHERE role = 'customer'
       ORDER BY created_at DESC`
    );

    // Helper function to get status info
    const getStatusInfo = (status) => {
      const statusMap = {
        active: {
          label: "Hoạt động",
          badge: "active",
          description: "Tài khoản đang hoạt động bình thường",
        },
        inactive: {
          label: "Không hoạt động",
          badge: "inactive",
          description: "Tài khoản đã bị vô hiệu hóa",
        },
        banned: {
          label: "Đã khóa",
          badge: "locked",
          description: "Tài khoản đã bị khóa",
        },
      };
      return statusMap[status] || statusMap["active"];
    };

    // Map users to include locked field and status info based on status
    const usersWithStatus = users.map((user) => {
      const statusInfo = getStatusInfo(user.status);
      return {
        ...user,
        locked: user.status === "banned",
        statusText: statusInfo.label,
        statusBadge: statusInfo.badge,
        statusDescription: statusInfo.description,
      };
    });

    res.json({ success: true, data: usersWithStatus });
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách người dùng",
      error: error.message,
    });
  }
}

export async function getAllEmployees(req, res) {
  try {
    // Lấy tất cả users có role là 'employee' (theo schema database)
    const employees = await query(
      `SELECT id, name, email, phone, role, status, created_at as createdAt
       FROM users 
       WHERE role = 'employee'
       ORDER BY created_at DESC`
    );

    // Helper function to get status info
    const getStatusInfo = (status) => {
      const statusMap = {
        active: {
          label: "Hoạt động",
          badge: "active",
          description: "Tài khoản đang hoạt động bình thường",
        },
        inactive: {
          label: "Không hoạt động",
          badge: "inactive",
          description: "Tài khoản đã bị vô hiệu hóa",
        },
        banned: {
          label: "Đã khóa",
          badge: "locked",
          description: "Tài khoản đã bị khóa",
        },
      };
      return statusMap[status] || statusMap["active"];
    };

    // Map employees to include locked field and status info based on status
    const employeesWithStatus = employees.map((emp) => {
      const statusInfo = getStatusInfo(emp.status);
      return {
        ...emp,
        locked: emp.status === "banned",
        statusText: statusInfo.label,
        statusBadge: statusInfo.badge,
        statusDescription: statusInfo.description,
      };
    });

    res.json({ success: true, data: employeesWithStatus });
  } catch (error) {
    console.error("Error getting employees:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách nhân viên",
      error: error.message,
    });
  }
}

export async function createUser(req, res) {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin (tên, email, mật khẩu)",
      });
    }

    // Check if email exists
    const existing = await query("SELECT id FROM users WHERE email = ?", [
      email,
    ]);
    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email đã tồn tại",
      });
    }

    // Hash password (simple hash for now, should use bcrypt in production)
    const bcrypt = await import("bcryptjs");
    const hashedPassword = await bcrypt.default.hash(password, 10);

    const result = await query(
      `INSERT INTO users (name, email, password, phone, role, status)
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [name, email, hashedPassword, phone || null, role || "customer"]
    );

    const newUsers = await query(
      `SELECT id, name, email, phone, role, status, created_at as createdAt
       FROM users WHERE id = ?`,
      [result.insertId]
    );

    if (!newUsers || newUsers.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Đã tạo người dùng nhưng không thể lấy thông tin",
      });
    }

    const newUser = newUsers[0];

    // Helper function to get status info
    const getStatusInfo = (status) => {
      const statusMap = {
        active: {
          label: "Hoạt động",
          badge: "active",
          description: "Tài khoản đang hoạt động bình thường",
        },
        inactive: {
          label: "Không hoạt động",
          badge: "inactive",
          description: "Tài khoản đã bị vô hiệu hóa",
        },
        banned: {
          label: "Đã khóa",
          badge: "locked",
          description: "Tài khoản đã bị khóa",
        },
      };
      return statusMap[status] || statusMap["active"];
    };

    const statusInfo = getStatusInfo(newUser.status);

    // Add locked field and status info based on status
    const userWithStatus = {
      ...newUser,
      locked: newUser.status === "banned",
      statusText: statusInfo.label,
      statusBadge: statusInfo.badge,
      statusDescription: statusInfo.description,
    };

    res.json({ success: true, data: userWithStatus });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo người dùng",
      error: error.message,
    });
  }
}

export async function updateUser(req, res) {
  try {
    const { id } = req.params;
    const { name, email, phone, password, role, status } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email) {
      updates.push("email = ?");
      values.push(email);
    }
    if (phone !== undefined) {
      updates.push("phone = ?");
      values.push(phone);
    }
    if (password) {
      const bcrypt = await import("bcryptjs");
      const hashedPassword = await bcrypt.default.hash(password, 10);
      updates.push("password = ?");
      values.push(hashedPassword);
    }
    if (role) {
      updates.push("role = ?");
      values.push(role);
    }
    if (status) {
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có thông tin nào để cập nhật",
      });
    }

    values.push(id);
    await query(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`, values);

    const updated = await query(
      `SELECT id, name, email, phone, role, status, created_at as createdAt
       FROM users WHERE id = ?`,
      [id]
    );

    if (!updated || updated.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng sau khi cập nhật",
      });
    }

    // Helper function to get status info
    const getStatusInfo = (status) => {
      const statusMap = {
        active: {
          label: "Hoạt động",
          badge: "active",
          description: "Tài khoản đang hoạt động bình thường",
        },
        inactive: {
          label: "Không hoạt động",
          badge: "inactive",
          description: "Tài khoản đã bị vô hiệu hóa",
        },
        banned: {
          label: "Đã khóa",
          badge: "locked",
          description: "Tài khoản đã bị khóa",
        },
      };
      return statusMap[status] || statusMap["active"];
    };

    const statusInfo = getStatusInfo(updated[0].status);

    // Add locked field and status info based on status
    const updatedUser = {
      ...updated[0],
      locked: updated[0].status === "banned",
      statusText: statusInfo.label,
      statusBadge: statusInfo.badge,
      statusDescription: statusInfo.description,
    };

    res.json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật người dùng",
      error: error.message,
    });
  }
}

export async function toggleUserLock(req, res) {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await query(
      "SELECT id, email, role, status FROM users WHERE id = ?",
      [id]
    );
    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const userInfo = user[0];

    // Không cho phép khóa/mở khóa admin (bảo vệ tài khoản admin)
    if (userInfo.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Không thể khóa/mở khóa tài khoản quản trị viên",
      });
    }

    // Toggle lock: banned <-> active
    // Nếu đang inactive, sẽ chuyển sang active
    const currentStatus = userInfo.status;
    let newStatus;

    if (currentStatus === "banned") {
      newStatus = "active"; // Mở khóa
    } else if (currentStatus === "inactive") {
      newStatus = "active"; // Kích hoạt tài khoản không hoạt động
    } else {
      newStatus = "banned"; // Khóa tài khoản
    }

    await query("UPDATE users SET status = ? WHERE id = ?", [newStatus, id]);

    // Helper function to get status info
    const getStatusInfo = (status) => {
      const statusMap = {
        active: {
          label: "Hoạt động",
          badge: "active",
          description: "Tài khoản đang hoạt động bình thường",
        },
        inactive: {
          label: "Không hoạt động",
          badge: "inactive",
          description: "Tài khoản đã bị vô hiệu hóa",
        },
        banned: {
          label: "Đã khóa",
          badge: "locked",
          description: "Tài khoản đã bị khóa - không thể đăng nhập",
        },
      };
      return statusMap[status] || statusMap["active"];
    };

    const statusInfo = getStatusInfo(newStatus);

    let message;
    if (currentStatus === "banned") {
      message =
        "Đã mở khóa tài khoản. Người dùng có thể đăng nhập bình thường.";
    } else if (currentStatus === "inactive") {
      message =
        "Đã kích hoạt tài khoản. Người dùng có thể đăng nhập bình thường.";
    } else {
      message =
        "Đã khóa tài khoản. Người dùng không thể đăng nhập vào website.";
    }

    res.json({
      success: true,
      message: message,
      data: {
        status: newStatus,
        locked: newStatus === "banned",
        statusText: statusInfo.label,
        statusBadge: statusInfo.badge,
        statusDescription: statusInfo.description,
      },
    });
  } catch (error) {
    console.error("Error toggling user lock:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi khóa/mở khóa tài khoản",
      error: error.message,
    });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;

    // Check if user exists
    const user = await query(
      "SELECT id, name, email, role FROM users WHERE id = ?",
      [id]
    );
    if (!user || user.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy người dùng",
      });
    }

    const userInfo = user[0];

    // Không cho phép xóa admin (bảo vệ tài khoản admin)
    if (userInfo.role === "admin") {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa tài khoản quản trị viên",
      });
    }

    // Check if user has orders (FOREIGN KEY RESTRICT constraint)
    const orders = await query(
      "SELECT COUNT(*) as count FROM orders WHERE user_id = ?",
      [id]
    );
    const orderCount = orders[0]?.count || 0;

    if (orderCount > 0) {
      // Soft delete: set status to 'inactive' instead of hard delete
      await query("UPDATE users SET status = ? WHERE id = ?", ["inactive", id]);
      return res.json({
        success: true,
        message: `Người dùng đã có ${orderCount} đơn hàng. Đã chuyển sang trạng thái không hoạt động thay vì xóa.`,
        softDelete: true,
      });
    }

    // Hard delete if no orders
    // Các bảng có ON DELETE CASCADE sẽ tự động xóa:
    // - addresses
    // - cart
    // - reviews
    // - product_comments
    await query("DELETE FROM users WHERE id = ?", [id]);

    res.json({ success: true, message: "Đã xóa người dùng thành công" });
  } catch (error) {
    console.error("Error deleting user:", error);

    // Handle foreign key constraint error
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.message.includes("foreign key")
    ) {
      // Try soft delete if hard delete fails
      try {
        await query("UPDATE users SET status = ? WHERE id = ?", [
          "inactive",
          req.params.id,
        ]);
        return res.json({
          success: true,
          message:
            "Không thể xóa người dùng vì đang được sử dụng. Đã chuyển sang trạng thái không hoạt động.",
          softDelete: true,
        });
      } catch (softDeleteError) {
        return res.status(400).json({
          success: false,
          message:
            "Không thể xóa người dùng vì đang được sử dụng trong hệ thống",
        });
      }
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa người dùng",
      error: error.message,
    });
  }
}

// ===== ORDERS MANAGEMENT =====
export async function getAllOrders(req, res) {
  try {
    const { status } = req.query;

    let sql = `
      SELECT 
        o.id,
        o.order_code as orderCode,
        o.user_id as userId,
        o.address_id as addressId,
        o.total_amount as totalAmount,
        o.shipping_fee as shippingFee,
        o.discount_amount as discountAmount,
        o.final_amount as finalAmount,
        o.payment_method as paymentMethod,
        o.payment_status as paymentStatus,
        o.shipping_method as shippingMethod,
        o.shipping_status as shippingStatus,
        o.status,
        o.note,
        o.created_at as createdAt,
        o.updated_at as updatedAt,
        COALESCE(a.full_name, u.name, CONCAT('User ', o.user_id)) as customerName,
        COALESCE(a.phone, u.phone, '') as customerPhone,
        COALESCE(
          CONCAT(a.street_address, ', ', a.ward, ', ', a.district, ', ', a.province),
          'Địa chỉ không xác định'
        ) as address
      FROM orders o
      LEFT JOIN addresses a ON o.address_id = a.id
      LEFT JOIN users u ON o.user_id = u.id
    `;

    const params = [];
    if (status && status !== "all") {
      sql += " WHERE o.status = ?";
      params.push(status);
    }

    sql += " ORDER BY o.created_at DESC";

    console.log("📦 getAllOrders SQL:", sql);
    console.log("📦 getAllOrders params:", params);

    const orders = await query(sql, params);

    console.log("📦 getAllOrders result count:", orders?.length || 0);
    if (orders && orders.length > 0) {
      console.log("📦 First order sample:", {
        id: orders[0].id,
        orderCode: orders[0].orderCode,
        status: orders[0].status,
        customerName: orders[0].customerName,
        createdAt: orders[0].createdAt,
      });
    } else {
      console.log("⚠️ No orders found in database");
    }

    // Get order items and latest timeline status for each order
    for (const order of orders) {
      // Get order items
      const items = await query(
        `SELECT 
          id,
          product_id as productId,
          product_name as name,
          product_image as image,
          price,
          quantity as qty,
          subtotal
         FROM order_items 
         WHERE order_id = ?
         ORDER BY id ASC`,
        [order.id]
      );
      order.items = items || [];

      // Get latest timeline entry (current status)
      const latestTimeline = await query(
        `SELECT status, label, description, created_at as at
         FROM order_timeline 
         WHERE order_id = ?
         ORDER BY created_at DESC
         LIMIT 1`,
        [order.id]
      );

      if (latestTimeline && latestTimeline.length > 0) {
        order.latestStatus = latestTimeline[0];
      }

      // Get timeline count
      const timelineCount = await query(
        `SELECT COUNT(*) as count FROM order_timeline WHERE order_id = ?`,
        [order.id]
      );
      order.timelineCount = timelineCount[0]?.count || 0;
    }

    res.json({ success: true, data: orders });
  } catch (error) {
    console.error("Error getting orders:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message,
    });
  }
}

export async function getOrderById(req, res) {
  try {
    const { id } = req.params;

    // Get order with address information - Lấy TẤT CẢ các field từ bảng orders
    // Đảm bảo lấy đúng dữ liệu status từ Database bảng orders
    const orders = await query(
      `SELECT 
        o.id,
        o.order_code as orderCode,
        o.user_id as userId,
        o.address_id as addressId,
        o.total_amount as totalAmount,
        o.shipping_fee as shippingFee,
        o.discount_amount as discountAmount,
        o.final_amount as finalAmount,
        o.payment_method as paymentMethod,
        o.payment_status as paymentStatus,
        o.shipping_method as shippingMethod,
        o.shipping_status as shippingStatus,
        o.status,
        o.note,
        o.created_at as createdAt,
        o.updated_at as updatedAt,
        -- Lấy TẤT CẢ các field từ bảng addresses
        a.id as addressTableId,
        a.user_id as addressUserId,
        a.full_name as customerName,
        a.phone as customerPhone,
        a.province,
        a.district,
        a.ward,
        a.street_address as streetAddress,
        a.postal_code as postalCode,
        a.is_default as addressIsDefault,
        a.created_at as addressCreatedAt,
        a.updated_at as addressUpdatedAt,
        CONCAT(a.street_address, ', ', a.ward, ', ', a.district, ', ', a.province) as address
       FROM orders o
       INNER JOIN addresses a ON o.address_id = a.id
       WHERE o.id = ?`,
      [id]
    );

    if (!orders || orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    const orderData = orders[0];

    // Đảm bảo các field status có giá trị (nếu NULL trong DB thì dùng default)
    if (!orderData.status) {
      orderData.status = "pending";
    }
    if (!orderData.paymentStatus) {
      orderData.paymentStatus = "pending";
    }
    if (!orderData.shippingStatus) {
      orderData.shippingStatus = "pending";
    }

    // Log để debug
    console.log("Order data from database:", {
      id: orderData.id,
      orderCode: orderData.orderCode,
      status: orderData.status,
      paymentStatus: orderData.paymentStatus,
      shippingStatus: orderData.shippingStatus,
    });

    // Get order items - Lấy TẤT CẢ các field từ bảng order_items và JOIN với products để lấy thêm thông tin
    const items = await query(
      `SELECT 
        oi.id,
        oi.order_id as orderId,
        oi.product_id as productId,
        oi.product_name as name,
        oi.product_image as image,
        oi.price,
        oi.quantity as qty,
        oi.subtotal,
        oi.created_at as createdAt,
        -- Thông tin từ bảng products nếu còn tồn tại
        p.name as productCurrentName,
        p.slug as productSlug,
        p.brand as productBrand,
        p.category_id as productCategoryId,
        p.status as productStatus,
        p.stock_status as productStockStatus,
        c.name as categoryName
       FROM order_items oi
       LEFT JOIN products p ON oi.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE oi.order_id = ?
       ORDER BY oi.id ASC`,
      [id]
    );
    orderData.items = items || [];

    // Get timeline from order_timeline table - Lấy TẤT CẢ các field
    const timeline = await query(
      `SELECT 
        id,
        order_id as orderId,
        status,
        label,
        description,
        created_at as at,
        created_at as createdAt
       FROM order_timeline 
       WHERE order_id = ?
       ORDER BY created_at ASC`,
      [id]
    );
    orderData.timeline = timeline || [];

    // Get order coupons - Lấy TẤT CẢ các field từ bảng order_coupons và JOIN với coupons
    const orderCoupons = await query(
      `SELECT 
        oc.id,
        oc.order_id as orderId,
        oc.coupon_id as couponId,
        oc.discount_amount as discountAmount,
        oc.created_at as createdAt,
        c.code as couponCode,
        c.name as couponName,
        c.discount_type as couponDiscountType,
        c.discount_value as couponDiscountValue,
        c.min_purchase as couponMinPurchase,
        c.max_discount as couponMaxDiscount,
        c.description as couponDescription,
        c.status as couponStatus,
        c.valid_from as couponValidFrom,
        c.valid_until as couponValidUntil
       FROM order_coupons oc
       LEFT JOIN coupons c ON oc.coupon_id = c.id
       WHERE oc.order_id = ?`,
      [id]
    );
    orderData.coupons = orderCoupons || [];

    // Get user information - Lấy TẤT CẢ các field từ bảng users
    const users = await query(
      `SELECT 
        id,
        name,
        email,
        phone,
        avatar,
        role,
        status,
        created_at as createdAt,
        updated_at as updatedAt
       FROM users 
       WHERE id = ?`,
      [orderData.userId]
    );
    if (users && users.length > 0) {
      orderData.customer = {
        id: users[0].id,
        name: users[0].name,
        email: users[0].email,
        phone: users[0].phone,
        avatar: users[0].avatar,
        role: users[0].role,
        status: users[0].status,
        createdAt: users[0].createdAt,
        updatedAt: users[0].updatedAt,
      };
    }

    // Thống kê tổng hợp
    orderData.summary = {
      totalItems: items ? items.length : 0,
      totalQuantity: items
        ? items.reduce((sum, item) => sum + (item.qty || 0), 0)
        : 0,
      totalProductsAmount: orderData.totalAmount || 0,
      shippingFee: orderData.shippingFee || 0,
      discountFromCoupons: orderCoupons
        ? orderCoupons.reduce(
            (sum, coupon) => sum + parseFloat(coupon.discountAmount || 0),
            0
          )
        : 0,
      totalDiscount: orderData.discountAmount || 0,
      finalAmount: orderData.finalAmount || 0,
      timelineCount: timeline ? timeline.length : 0,
      couponsCount: orderCoupons ? orderCoupons.length : 0,
    };

    res.json({ success: true, data: orderData });
  } catch (error) {
    console.error("Error getting order:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin đơn hàng",
      error: error.message,
    });
  }
}

export async function updateOrderStatus(req, res) {
  try {
    const { id } = req.params;
    const { status, label, description } = req.body;

    // Check if order exists
    const order = await query("SELECT id, status FROM orders WHERE id = ?", [
      id,
    ]);
    if (!order || order.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp trạng thái mới",
      });
    }

    const oldStatus = order[0].status;

    // Update order status
    await query(
      "UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?",
      [status, id]
    );

    // Always add timeline entry when status changes
    const timelineLabel = label || getStatusLabel(status);
    const timelineDescription =
      description || getStatusDescription(status, oldStatus);

    await query(
      `INSERT INTO order_timeline (order_id, status, label, description)
       VALUES (?, ?, ?, ?)`,
      [id, status, timelineLabel, timelineDescription]
    );

    // Update shipping_status and payment_status based on order status
    if (status === "shipping") {
      await query("UPDATE orders SET shipping_status = ? WHERE id = ?", [
        "shipping",
        id,
      ]);
    } else if (status === "delivered") {
      await query(
        "UPDATE orders SET shipping_status = ?, payment_status = ? WHERE id = ?",
        ["delivered", "paid", id]
      );
    } else if (status === "cancelled") {
      await query("UPDATE orders SET shipping_status = ? WHERE id = ?", [
        "cancelled",
        id,
      ]);
    } else if (status === "confirmed") {
      await query("UPDATE orders SET shipping_status = ? WHERE id = ?", [
        "confirmed",
        id,
      ]);
    }

    // Get updated order with timeline
    const updatedOrder = await query(
      `SELECT 
        o.id,
        o.order_code as orderCode,
        o.status,
        o.payment_status as paymentStatus,
        o.shipping_status as shippingStatus,
        o.final_amount as finalAmount,
        o.updated_at as updatedAt
       FROM orders o
       WHERE o.id = ?`,
      [id]
    );

    // Tạo thông báo cho admin khi thay đổi trạng thái đơn hàng
    try {
      const orderCode = updatedOrder[0]?.orderCode || `#${id}`;
      const statusLabels = {
        pending: "Chờ xử lý",
        confirmed: "Đã xác nhận",
        processing: "Đang xử lý",
        shipping: "Đang giao",
        delivered: "Đã giao",
        cancelled: "Đã hủy",
        refunded: "Đã hoàn tiền",
      };
      const statusLabel = statusLabels[status] || status;

      await notificationModel.createNotification({
        type: "order_status_change",
        title: `Đơn hàng ${orderCode} đã thay đổi trạng thái`,
        message: `Đơn hàng ${orderCode} đã được cập nhật từ "${getStatusLabel(
          oldStatus
        )}" sang "${statusLabel}"`,
        related_id: parseInt(id),
        related_type: "order",
      });
    } catch (notifError) {
      console.error("❌ Error creating notification:", notifError);
      // Không throw error để không ảnh hưởng đến việc cập nhật trạng thái
    }

    res.json({
      success: true,
      message: `Đã cập nhật trạng thái đơn hàng thành: ${timelineLabel}`,
      data: updatedOrder[0],
    });
  } catch (error) {
    console.error("Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật trạng thái đơn hàng",
      error: error.message,
    });
  }
}

// Helper function to get status label
function getStatusLabel(status) {
  const statusMap = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    delivered: "Đã giao hàng",
    cancelled: "Đã hủy",
    refunded: "Đã hoàn tiền",
  };
  return statusMap[status] || status;
}

// Helper function to get status description
function getStatusDescription(newStatus, oldStatus) {
  if (oldStatus === newStatus) {
    return `Trạng thái đơn hàng: ${getStatusLabel(newStatus)}`;
  }
  return `Đơn hàng đã được chuyển từ "${getStatusLabel(
    oldStatus
  )}" sang "${getStatusLabel(newStatus)}"`;
}

export async function deleteOrder(req, res) {
  try {
    const { id } = req.params;

    // Check if order exists
    const order = await query(
      `SELECT id, order_code as orderCode, status 
       FROM orders WHERE id = ?`,
      [id]
    );

    if (!order || order.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy đơn hàng",
      });
    }

    const orderInfo = order[0];

    // Check if order can be deleted (only pending or cancelled orders can be deleted)
    if (orderInfo.status === "delivered" || orderInfo.status === "shipping") {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa đơn hàng đang ở trạng thái "${getStatusLabel(
          orderInfo.status
        )}". Vui lòng hủy đơn hàng trước.`,
      });
    }

    // Delete order
    // order_timeline và order_items sẽ tự động xóa do ON DELETE CASCADE
    await query("DELETE FROM orders WHERE id = ?", [id]);

    res.json({
      success: true,
      message: `Đã xóa đơn hàng ${orderInfo.orderCode} thành công`,
      deletedOrderCode: orderInfo.orderCode,
    });
  } catch (error) {
    console.error("Error deleting order:", error);

    // Handle foreign key constraint error
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.message.includes("foreign key")
    ) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa đơn hàng vì đang được sử dụng trong hệ thống",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa đơn hàng",
      error: error.message,
    });
  }
}

// ===== PRODUCTS MANAGEMENT =====
export async function getAllProductsAdmin(req, res) {
  try {
    const { search, category, sort } = req.query;

    let sql = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description as shortDescription,
        p.category_id as categoryId,
        c.name as categoryName,
        p.brand,
        p.sku,
        p.price,
        p.old_price as oldPrice,
        p.sale_percent as salePercent,
        p.sale_label as saleLabel,
        p.stock_quantity as stockQuantity,
        p.stock_status as stockStatus,
        p.rating,
        p.sold_count as sold,
        p.view_count as viewCount,
        p.image as img,
        p.cover_image as cover,
        p.status,
        p.created_at as createdAt,
        p.updated_at as updatedAt
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      sql += " AND (p.name LIKE ? OR p.brand LIKE ? OR c.name LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (category && category !== "all") {
      sql += " AND c.name = ?";
      params.push(category);
    }

    // Sort
    switch (sort) {
      case "price-asc":
        sql += " ORDER BY p.price ASC";
        break;
      case "price-desc":
        sql += " ORDER BY p.price DESC";
        break;
      case "sold-desc":
        sql += " ORDER BY p.sold_count DESC";
        break;
      default:
        sql += " ORDER BY p.created_at DESC";
    }

    const products = await query(sql, params);

    res.json({ success: true, data: products });
  } catch (error) {
    console.error("Error getting products:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sản phẩm",
      error: error.message,
    });
  }
}

export async function getProductByIdAdmin(req, res) {
  try {
    const { id } = req.params;

    const products = await query(
      `SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description as shortDescription,
        p.category_id as categoryId,
        c.name as categoryName,
        p.brand,
        p.sku,
        p.price,
        p.old_price as oldPrice,
        p.sale_percent as salePercent,
        p.sale_label as saleLabel,
        p.stock_quantity as stockQuantity,
        p.stock_status as stockStatus,
        p.rating,
        p.sold_count as sold,
        p.view_count as viewCount,
        p.image as img,
        p.cover_image as cover,
        p.status,
        p.created_at as createdAt,
        p.updated_at as updatedAt
       FROM products p
       INNER JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (!products || products.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    res.json({ success: true, data: products[0] });
  } catch (error) {
    console.error("Error getting product:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin sản phẩm",
      error: error.message,
    });
  }
}

export async function createProduct(req, res) {
  try {
    const {
      name,
      price,
      oldPrice,
      categoryId,
      brand,
      img,
      cover,
      saleLabel,
      rating,
      sold,
      desc,
      shortDescription,
      stockQuantity,
    } = req.body;

    if (!name || !price || !categoryId) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng điền đầy đủ thông tin bắt buộc (tên, giá, danh mục)",
      });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Calculate sale_percent if oldPrice exists
    let salePercent = null;
    if (oldPrice && oldPrice > price) {
      salePercent = Math.round(((oldPrice - price) / oldPrice) * 100);
    }

    // Insert product - pool.execute returns [result, fields] where result has insertId
    const result = await query(
      `INSERT INTO products (
        name, slug, description, short_description, category_id, brand,
        price, old_price, sale_percent, sale_label, image, cover_image,
        rating, sold_count, stock_quantity, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        name,
        slug,
        desc || null,
        shortDescription || null,
        categoryId,
        brand || null,
        price,
        oldPrice || null,
        salePercent,
        saleLabel || null,
        img || null,
        cover || null,
        rating || 0,
        sold || 0,
        stockQuantity || 0,
      ]
    );

    const productId = result.insertId;

    // Lưu ảnh vào bảng product_images
    // Xóa ảnh cũ nếu có (trong trường hợp update)
    await query("DELETE FROM product_images WHERE product_id = ?", [productId]);

    // Lưu ảnh chính (img) vào product_images với is_primary = TRUE
    if (img) {
      await query(
        `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, img, name || "Product image", 1, true]
      );
    }

    // Lưu ảnh banner (cover) vào product_images với is_primary = FALSE
    if (cover) {
      await query(
        `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
         VALUES (?, ?, ?, ?, ?)`,
        [
          productId,
          cover,
          name ? `${name} - Cover image` : "Product cover",
          2,
          false,
        ]
      );
    }

    // Get the newly created product with category name
    const newProducts = await query(
      `SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description as shortDescription,
        p.category_id as categoryId,
        c.name as categoryName,
        p.brand,
        p.sku,
        p.price,
        p.old_price as oldPrice,
        p.sale_percent as salePercent,
        p.sale_label as saleLabel,
        p.stock_quantity as stockQuantity,
        p.stock_status as stockStatus,
        p.rating,
        p.sold_count as sold,
        p.view_count as viewCount,
        p.image as img,
        p.cover_image as cover,
        p.status,
        p.created_at as createdAt,
        p.updated_at as updatedAt
       FROM products p
       INNER JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [productId]
    );

    if (!newProducts || newProducts.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Đã tạo sản phẩm nhưng không thể lấy thông tin",
      });
    }

    res.json({ success: true, data: newProducts[0] });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo sản phẩm",
      error: error.message,
    });
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params;
    const {
      name,
      price,
      oldPrice,
      categoryId,
      brand,
      img,
      cover,
      saleLabel,
      rating,
      sold,
      desc,
      shortDescription,
      stockQuantity,
      status,
    } = req.body;

    const updates = [];
    const values = [];

    if (name) {
      updates.push("name = ?");
      values.push(name);
      // Update slug if name changes
      const slug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      updates.push("slug = ?");
      values.push(slug);
    }
    if (price !== undefined) {
      updates.push("price = ?");
      values.push(price);
    }
    if (oldPrice !== undefined) {
      updates.push("old_price = ?");
      values.push(oldPrice || null);
    }
    if (categoryId) {
      updates.push("category_id = ?");
      values.push(categoryId);
    }
    if (brand !== undefined) {
      updates.push("brand = ?");
      values.push(brand || null);
    }
    if (img !== undefined) {
      updates.push("image = ?");
      values.push(img || null);
    }
    if (cover !== undefined) {
      updates.push("cover_image = ?");
      values.push(cover || null);
    }
    if (saleLabel !== undefined) {
      updates.push("sale_label = ?");
      values.push(saleLabel || null);
    }
    if (rating !== undefined) {
      updates.push("rating = ?");
      values.push(rating);
    }
    if (sold !== undefined) {
      updates.push("sold_count = ?");
      values.push(sold);
    }
    if (desc !== undefined) {
      updates.push("description = ?");
      values.push(desc || null);
    }
    if (shortDescription !== undefined) {
      updates.push("short_description = ?");
      values.push(shortDescription || null);
    }
    if (stockQuantity !== undefined) {
      updates.push("stock_quantity = ?");
      values.push(stockQuantity);
    }
    if (status) {
      updates.push("status = ?");
      values.push(status);
    }

    // Calculate sale_percent if price or oldPrice changed
    if (price !== undefined || oldPrice !== undefined) {
      const current = await query(
        "SELECT price, old_price FROM products WHERE id = ?",
        [id]
      );
      if (!current || current.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy sản phẩm",
        });
      }

      const finalPrice = price !== undefined ? price : current[0].price;
      const finalOldPrice =
        oldPrice !== undefined ? oldPrice || null : current[0].old_price;

      if (finalOldPrice && finalOldPrice > finalPrice) {
        const salePercent = Math.round(
          ((finalOldPrice - finalPrice) / finalOldPrice) * 100
        );
        updates.push("sale_percent = ?");
        values.push(salePercent);
      } else {
        updates.push("sale_percent = ?");
        values.push(null);
      }
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có thông tin nào để cập nhật",
      });
    }

    values.push(id);
    await query(
      `UPDATE products SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    // Cập nhật ảnh vào bảng product_images nếu có thay đổi
    if (img !== undefined || cover !== undefined) {
      // Lấy tên sản phẩm hiện tại để dùng cho alt_text
      const currentProduct = await query(
        "SELECT name FROM products WHERE id = ?",
        [id]
      );
      const productName = currentProduct[0]?.name || name || "Product";

      // Xóa ảnh cũ
      await query("DELETE FROM product_images WHERE product_id = ?", [id]);

      // Lấy giá trị ảnh cuối cùng (từ database nếu không có trong update)
      let finalImg = img;
      let finalCover = cover;

      if (img === undefined || cover === undefined) {
        const currentImages = await query(
          "SELECT image, cover_image FROM products WHERE id = ?",
          [id]
        );
        if (currentImages && currentImages.length > 0) {
          if (img === undefined) finalImg = currentImages[0].image;
          if (cover === undefined) finalCover = currentImages[0].cover_image;
        }
      }

      // Lưu ảnh chính (img) vào product_images với is_primary = TRUE
      if (finalImg) {
        await query(
          `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
           VALUES (?, ?, ?, ?, ?)`,
          [id, finalImg, productName || "Product image", 1, true]
        );
      }

      // Lưu ảnh banner (cover) vào product_images với is_primary = FALSE
      if (finalCover) {
        await query(
          `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
           VALUES (?, ?, ?, ?, ?)`,
          [
            id,
            finalCover,
            productName ? `${productName} - Cover image` : "Product cover",
            2,
            false,
          ]
        );
      }
    }

    // Get updated product with category name
    const updated = await query(
      `SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description as shortDescription,
        p.category_id as categoryId,
        c.name as categoryName,
        p.brand,
        p.sku,
        p.price,
        p.old_price as oldPrice,
        p.sale_percent as salePercent,
        p.sale_label as saleLabel,
        p.stock_quantity as stockQuantity,
        p.stock_status as stockStatus,
        p.rating,
        p.sold_count as sold,
        p.view_count as viewCount,
        p.image as img,
        p.cover_image as cover,
        p.status,
        p.created_at as createdAt,
        p.updated_at as updatedAt
       FROM products p
       INNER JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (!updated || updated.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm sau khi cập nhật",
      });
    }

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật sản phẩm",
      error: error.message,
    });
  }
}

export async function deleteProduct(req, res) {
  try {
    const { id } = req.params;

    // Check if product exists
    const product = await query("SELECT id, name FROM products WHERE id = ?", [
      id,
    ]);
    if (!product || product.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy sản phẩm",
      });
    }

    // Check if product is in any orders
    const orderItems = await query(
      "SELECT COUNT(*) as count FROM order_items WHERE product_id = ?",
      [id]
    );
    const hasOrders = orderItems[0]?.count > 0;

    if (hasOrders) {
      // Soft delete: set status to inactive instead of hard delete
      await query("UPDATE products SET status = ? WHERE id = ?", [
        "inactive",
        id,
      ]);
      return res.json({
        success: true,
        message:
          "Sản phẩm đã có trong đơn hàng, đã chuyển sang trạng thái không hoạt động thay vì xóa",
      });
    }

    // Hard delete if no orders
    await query("DELETE FROM products WHERE id = ?", [id]);

    res.json({ success: true, message: "Đã xóa sản phẩm thành công" });
  } catch (error) {
    console.error("Error deleting product:", error);

    // Handle foreign key constraint error
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.message.includes("foreign key")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xóa sản phẩm vì đang được sử dụng trong đơn hàng hoặc bình luận",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa sản phẩm",
      error: error.message,
    });
  }
}

// ===== CATEGORIES MANAGEMENT =====
export async function getAllCategoriesAdmin(req, res) {
  try {
    const categories = await query(
      `SELECT 
        c.id,
        c.name,
        c.description,
        c.slug,
        c.status,
        c.sort_order as sortOrder,
        c.parent_id as parentId,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        COUNT(p.id) as productCount
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id, c.name, c.description, c.slug, c.status, c.sort_order, c.parent_id, c.created_at, c.updated_at
       ORDER BY c.sort_order ASC, c.created_at DESC`
    );

    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error getting categories:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách danh mục",
      error: error.message,
    });
  }
}

export async function getCategoryByIdAdmin(req, res) {
  try {
    const { id } = req.params;

    const categories = await query(
      `SELECT 
        c.id,
        c.name,
        c.description,
        c.slug,
        c.status,
        c.sort_order as sortOrder,
        c.parent_id as parentId,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        COUNT(p.id) as productCount
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       WHERE c.id = ?
       GROUP BY c.id, c.name, c.description, c.slug, c.status, c.sort_order, c.parent_id, c.created_at, c.updated_at`,
      [id]
    );

    if (!categories || categories.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    res.json({ success: true, data: categories[0] });
  } catch (error) {
    console.error("Error getting category:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin danh mục",
      error: error.message,
    });
  }
}

export async function createCategory(req, res) {
  try {
    const { name, description, status } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập tên danh mục",
      });
    }

    // Generate slug
    const slug = name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists
    const existing = await query("SELECT id FROM categories WHERE slug = ?", [
      slug,
    ]);
    if (existing && existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Danh mục với tên này đã tồn tại (slug trùng)",
      });
    }

    // Insert category
    const result = await query(
      `INSERT INTO categories (name, slug, description, status)
       VALUES (?, ?, ?, ?)`,
      [
        name.trim(),
        slug,
        description ? description.trim() : null,
        status || "active",
      ]
    );

    const categoryId = result.insertId;

    // Get the newly created category with product count
    const newCategories = await query(
      `SELECT 
        c.id,
        c.name,
        c.description,
        c.slug,
        c.status,
        c.sort_order as sortOrder,
        c.parent_id as parentId,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        COUNT(p.id) as productCount
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [categoryId]
    );

    if (!newCategories || newCategories.length === 0) {
      return res.status(500).json({
        success: false,
        message: "Đã tạo danh mục nhưng không thể lấy thông tin",
      });
    }

    res.json({ success: true, data: newCategories[0] });
  } catch (error) {
    console.error("Error creating category:", error);

    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Danh mục đã tồn tại (tên hoặc slug trùng)",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo danh mục",
      error: error.message,
    });
  }
}

export async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description, status } = req.body;

    // Check if category exists
    const category = await query(
      "SELECT id, name, slug FROM categories WHERE id = ?",
      [id]
    );
    if (!category || category.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    const updates = [];
    const values = [];

    if (name && name.trim()) {
      updates.push("name = ?");
      values.push(name.trim());
      // Update slug if name changes
      const newSlug = name
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      // Check if new slug conflicts with another category
      const existing = await query(
        "SELECT id FROM categories WHERE slug = ? AND id != ?",
        [newSlug, id]
      );
      if (existing && existing.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Danh mục với tên này đã tồn tại",
        });
      }

      updates.push("slug = ?");
      values.push(newSlug);
    }

    if (description !== undefined) {
      updates.push("description = ?");
      values.push(description ? description.trim() : null);
    }

    if (status) {
      updates.push("status = ?");
      values.push(status);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có thông tin nào để cập nhật",
      });
    }

    values.push(id);
    await query(
      `UPDATE categories SET ${updates.join(", ")} WHERE id = ?`,
      values
    );

    // Get updated category with product count
    const updated = await query(
      `SELECT 
        c.id,
        c.name,
        c.description,
        c.slug,
        c.status,
        c.sort_order as sortOrder,
        c.parent_id as parentId,
        c.created_at as createdAt,
        c.updated_at as updatedAt,
        COUNT(p.id) as productCount
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       WHERE c.id = ?
       GROUP BY c.id`,
      [id]
    );

    if (!updated || updated.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục sau khi cập nhật",
      });
    }

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("Error updating category:", error);

    // Handle duplicate entry error
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(400).json({
        success: false,
        message: "Danh mục với tên/slug này đã tồn tại",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật danh mục",
      error: error.message,
    });
  }
}

export async function getCategoryProducts(req, res) {
  try {
    const { id } = req.params;
    const { search, sort } = req.query;

    // Check if category exists
    const category = await query(
      "SELECT id, name FROM categories WHERE id = ?",
      [id]
    );
    if (!category || category.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    let sql = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.short_description as shortDescription,
        p.category_id as categoryId,
        c.name as categoryName,
        p.brand,
        p.sku,
        p.price,
        p.old_price as oldPrice,
        p.sale_percent as salePercent,
        p.sale_label as saleLabel,
        p.stock_quantity as stockQuantity,
        p.stock_status as stockStatus,
        p.rating,
        p.sold_count as sold,
        p.view_count as viewCount,
        p.image as img,
        p.cover_image as cover,
        p.status,
        p.created_at as createdAt,
        p.updated_at as updatedAt
      FROM products p
      INNER JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?
    `;

    const params = [id];

    // Filter by search if provided
    if (search) {
      sql += " AND (p.name LIKE ? OR p.brand LIKE ? OR p.description LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Sort
    switch (sort) {
      case "price-asc":
        sql += " ORDER BY p.price ASC";
        break;
      case "price-desc":
        sql += " ORDER BY p.price DESC";
        break;
      case "sold-desc":
        sql += " ORDER BY p.sold_count DESC";
        break;
      case "name-asc":
        sql += " ORDER BY p.name ASC";
        break;
      default:
        sql += " ORDER BY p.created_at DESC";
    }

    const products = await query(sql, params);

    res.json({
      success: true,
      data: {
        category: category[0],
        products: products,
        total: products.length,
      },
    });
  } catch (error) {
    console.error("Error getting category products:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách sản phẩm của danh mục",
      error: error.message,
    });
  }
}

export async function deleteCategory(req, res) {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await query(
      "SELECT id, name FROM categories WHERE id = ?",
      [id]
    );
    if (!category || category.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy danh mục",
      });
    }

    // Check if category has products
    const products = await query(
      "SELECT COUNT(*) as count FROM products WHERE category_id = ?",
      [id]
    );
    const productCount = products[0]?.count || 0;

    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục vì đang có ${productCount} sản phẩm. Vui lòng xóa hoặc chuyển sản phẩm sang danh mục khác trước.`,
      });
    }

    // Check if category has subcategories
    const subcategories = await query(
      "SELECT COUNT(*) as count FROM categories WHERE parent_id = ?",
      [id]
    );
    const subcategoryCount = subcategories[0]?.count || 0;

    if (subcategoryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Không thể xóa danh mục vì đang có ${subcategoryCount} danh mục con. Vui lòng xóa hoặc di chuyển danh mục con trước.`,
      });
    }

    // Delete category
    await query("DELETE FROM categories WHERE id = ?", [id]);

    res.json({ success: true, message: "Đã xóa danh mục thành công" });
  } catch (error) {
    console.error("Error deleting category:", error);

    // Handle foreign key constraint error
    if (
      error.code === "ER_ROW_IS_REFERENCED_2" ||
      error.message.includes("foreign key")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Không thể xóa danh mục vì đang được sử dụng (có sản phẩm hoặc danh mục con)",
      });
    }

    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa danh mục",
      error: error.message,
    });
  }
}

// ===== POSTS MANAGEMENT =====
export async function getAllPostsAdmin(req, res) {
  try {
    const { search } = req.query;

    let sql = `
      SELECT 
        id,
        title,
        slug,
        excerpt,
        content,
        cover_image as cover,
        category as cat,
        author,
        tags,
        read_minutes as readMin,
        view_count as views,
        status,
        published_at as date,
        created_at as createdAt
      FROM posts
      WHERE 1=1
    `;

    const params = [];

    if (search) {
      sql +=
        " AND (title LIKE ? OR excerpt LIKE ? OR category LIKE ? OR author LIKE ?)";
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    sql += " ORDER BY created_at DESC";

    const posts = await query(sql, params);

    // Parse JSON tags
    posts.forEach((post) => {
      if (post.tags && typeof post.tags === "string") {
        try {
          post.tags = JSON.parse(post.tags);
        } catch {
          post.tags = [];
        }
      }
    });

    res.json({ success: true, data: posts });
  } catch (error) {
    console.error("Error getting posts:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách bài viết",
      error: error.message,
    });
  }
}

export async function getPostByIdAdmin(req, res) {
  try {
    const { id } = req.params;

    const post = await query(
      `SELECT 
        id,
        title,
        slug,
        excerpt,
        content,
        cover_image as cover,
        category as cat,
        author,
        tags,
        read_minutes as readMin,
        view_count as views,
        status,
        published_at as date,
        created_at as createdAt
       FROM posts
       WHERE id = ?`,
      [id]
    );

    if (!post || post.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    // Parse JSON tags
    if (post[0].tags && typeof post[0].tags === "string") {
      try {
        post[0].tags = JSON.parse(post[0].tags);
      } catch {
        post[0].tags = [];
      }
    }

    res.json({ success: true, data: post[0] });
  } catch (error) {
    console.error("Error getting post:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin bài viết",
      error: error.message,
    });
  }
}

export async function createPost(req, res) {
  try {
    const { title, cat, cover, excerpt, content, author, readMin, tags, date } =
      req.body;

    if (!title || !cat || !excerpt) {
      return res.status(400).json({
        success: false,
        message:
          "Vui lòng điền đầy đủ thông tin bắt buộc (tiêu đề, danh mục, tóm tắt)",
      });
    }

    // Generate slug
    let slug = title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // Check if slug exists
    const existing = await query("SELECT id FROM posts WHERE slug = ?", [slug]);
    if (existing && existing.length > 0) {
      // Append timestamp to make unique
      slug = `${slug}-${Date.now()}`;
    }

    // Parse tags
    let tagsJson = null;
    if (tags) {
      const tagsArray = Array.isArray(tags)
        ? tags
        : tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t);
      tagsJson = JSON.stringify(tagsArray);
    }

    const result = await query(
      `INSERT INTO posts (
        title, slug, excerpt, content, cover_image, category,
        author, read_minutes, tags, published_at, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')`,
      [
        title,
        slug,
        excerpt,
        content || null,
        cover || null,
        cat,
        author || null,
        readMin || 5,
        tagsJson,
        date || new Date().toISOString().split("T")[0],
      ]
    );

    const newPost = await query(
      `SELECT 
        id,
        title,
        slug,
        excerpt,
        content,
        cover_image as cover,
        category as cat,
        author,
        tags,
        read_minutes as readMin,
        view_count as views,
        status,
        published_at as date,
        created_at as createdAt
       FROM posts
       WHERE id = ?`,
      [result.insertId]
    );

    // Parse tags
    if (
      newPost &&
      newPost[0] &&
      newPost[0].tags &&
      typeof newPost[0].tags === "string"
    ) {
      try {
        newPost[0].tags = JSON.parse(newPost[0].tags);
      } catch {
        newPost[0].tags = [];
      }
    }

    res.json({ success: true, data: newPost[0] });
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo bài viết",
      error: error.message,
    });
  }
}

export async function updatePost(req, res) {
  try {
    const { id } = req.params;
    const {
      title,
      cat,
      cover,
      excerpt,
      content,
      author,
      readMin,
      tags,
      date,
      status,
    } = req.body;

    console.log("📝 Update post request:", { id, body: req.body });

    // Check if post exists
    const existingPost = await query("SELECT id FROM posts WHERE id = ?", [id]);
    if (!existingPost || existingPost.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết",
      });
    }

    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push("title = ?");
      values.push(title);
      // Update slug if title is provided
      if (title && title.trim()) {
        const slug = title
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
        updates.push("slug = ?");
        values.push(slug);
      }
    }
    if (cat !== undefined) {
      updates.push("category = ?");
      values.push(cat || null);
    }
    if (cover !== undefined) {
      updates.push("cover_image = ?");
      values.push(cover || null);
    }
    if (excerpt !== undefined) {
      updates.push("excerpt = ?");
      values.push(excerpt || null);
    }
    if (content !== undefined) {
      updates.push("content = ?");
      values.push(content || null);
    }
    if (author !== undefined) {
      updates.push("author = ?");
      values.push(author || null);
    }
    if (readMin !== undefined) {
      updates.push("read_minutes = ?");
      values.push(readMin || 5);
    }
    if (tags !== undefined) {
      const tagsArray = Array.isArray(tags)
        ? tags
        : tags
        ? tags
            .split(",")
            .map((t) => t.trim())
            .filter((t) => t)
        : [];
      updates.push("tags = ?");
      values.push(tagsArray.length > 0 ? JSON.stringify(tagsArray) : null);
    }
    if (date !== undefined) {
      // Ensure date is in correct format (yyyy-MM-dd or yyyy-MM-dd HH:mm:ss)
      let formattedDate = date;
      if (date && typeof date === "string") {
        // If it's an ISO string, convert to yyyy-MM-dd
        if (date.includes("T")) {
          formattedDate = date.split("T")[0];
        }
        // If it's already in yyyy-MM-dd format, use it as is
        else if (date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          formattedDate = date;
        }
      }
      updates.push("published_at = ?");
      values.push(formattedDate || null);
    }
    if (status !== undefined) {
      updates.push("status = ?");
      values.push(status || "draft");
    }

    if (updates.length === 0) {
      console.log("⚠️ No updates to apply");
      return res.status(400).json({
        success: false,
        message: "Không có thông tin nào để cập nhật",
      });
    }

    console.log("✅ Applying updates:", { updates, values });

    values.push(id);
    await query(`UPDATE posts SET ${updates.join(", ")} WHERE id = ?`, values);

    console.log("✅ Post updated successfully");

    const updated = await query(
      `SELECT 
        id,
        title,
        slug,
        excerpt,
        content,
        cover_image as cover,
        category as cat,
        author,
        tags,
        read_minutes as readMin,
        view_count as views,
        status,
        published_at as date,
        created_at as createdAt
       FROM posts
       WHERE id = ?`,
      [id]
    );

    if (!updated || updated.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy bài viết sau khi cập nhật",
      });
    }

    // Parse tags
    if (updated[0].tags && typeof updated[0].tags === "string") {
      try {
        updated[0].tags = JSON.parse(updated[0].tags);
      } catch {
        updated[0].tags = [];
      }
    }

    res.json({ success: true, data: updated[0] });
  } catch (error) {
    console.error("Error updating post:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật bài viết",
      error: error.message,
    });
  }
}

export async function deletePost(req, res) {
  try {
    const { id } = req.params;

    await query("DELETE FROM posts WHERE id = ?", [id]);

    res.json({ success: true, message: "Đã xóa bài viết" });
  } catch (error) {
    console.error("Error deleting post:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa bài viết",
      error: error.message,
    });
  }
}

// ===== STATISTICAL REPORTS =====
export async function getDetailedStatistics(req, res) {
  try {
    const { period, type } = req.query; // period: 'week', 'month', 'year'; type: 'revenue', 'products', 'views'

    console.log("📊 ===== getDetailedStatistics START =====");
    console.log("📊 Request params:", { period, type });
    console.log("📊 Type check:", {
      type,
      isRevenue: type === "revenue",
      isAll: type === "all",
      isUndefined: !type,
      condition: type === "revenue" || !type || type === "all",
    });

    let result = {};

    // Revenue statistics by period
    if (type === "revenue" || !type || type === "all") {
      console.log("📊 ✅ Processing revenue statistics...");
      let dateFormat = "";
      let intervalValue = 0;
      let intervalUnit = "";

      if (period === "week") {
        // Last 8 weeks
        dateFormat = "%Y-%u"; // Year-Week
        intervalValue = 8;
        intervalUnit = "WEEK";
      } else if (period === "month") {
        // Last 12 months
        dateFormat = "%Y-%m";
        intervalValue = 12;
        intervalUnit = "MONTH";
      } else if (period === "year") {
        // Last 5 years
        dateFormat = "%Y";
        intervalValue = 5;
        intervalUnit = "YEAR";
      } else {
        // Default: last 12 months
        dateFormat = "%Y-%m";
        intervalValue = 12;
        intervalUnit = "MONTH";
      }

      // Build query with safe interval unit (only allow WEEK, MONTH, YEAR)
      const allowedUnits = ["WEEK", "MONTH", "YEAR"];
      const safeIntervalUnit = allowedUnits.includes(intervalUnit)
        ? intervalUnit
        : "MONTH";

      // Kiểm tra xem có dữ liệu năm 2025 không
      const check2025Data = await query(
        "SELECT COUNT(*) as count FROM orders WHERE YEAR(created_at) = 2025 AND status IN (?, ?, ?)",
        ["delivered", "shipping", "confirmed"]
      );
      const has2025Data = check2025Data[0]?.count > 0;

      console.log("📊 Checking 2025 data:", {
        has2025Data,
        count: check2025Data[0]?.count,
        period,
        dateFormat,
        intervalValue,
        intervalUnit: safeIntervalUnit,
      });

      // Xây dựng WHERE clause - ưu tiên lấy dữ liệu năm 2025 nếu có
      let whereConditions = [
        "status IN ('delivered', 'shipping', 'confirmed')",
      ];
      let queryParams = [];

      if (has2025Data) {
        // Nếu có dữ liệu năm 2025, lấy dữ liệu năm 2025
        if (period === "year") {
          // Lấy tất cả các năm có dữ liệu (từ 2020 đến 2025)
          whereConditions.push("YEAR(created_at) >= 2020");
          whereConditions.push("YEAR(created_at) <= 2025");
        } else if (period === "month") {
          // Lấy tất cả các tháng trong năm 2025
          whereConditions.push("YEAR(created_at) = 2025");
        } else if (period === "week") {
          // Lấy tất cả các tuần trong năm 2025
          whereConditions.push("YEAR(created_at) = 2025");
        }
      } else {
        // Nếu không có dữ liệu năm 2025, lấy dữ liệu theo interval như cũ
        whereConditions.push(
          `created_at >= DATE_SUB(CURDATE(), INTERVAL ? ${safeIntervalUnit})`
        );
        queryParams.push(intervalValue);
      }

      const whereClause = "WHERE " + whereConditions.join(" AND ");

      // Query đơn giản hơn, không dùng subquery để tránh lỗi
      const revenueQuery = `
        SELECT 
          DATE_FORMAT(created_at, ?) as period,
          COALESCE(SUM(final_amount), 0) as revenue,
          COUNT(*) as orderCount
        FROM orders 
        ${whereClause}
        GROUP BY period
        ORDER BY period ASC
      `;

      // Thêm dateFormat vào đầu params
      queryParams.unshift(dateFormat);

      console.log("📊 Revenue Query:", revenueQuery);
      console.log("📊 Query Params:", queryParams);
      console.log("📊 Where Clause:", whereClause);
      console.log("📊 Has 2025 Data:", has2025Data);

      try {
        const revenueData = await query(revenueQuery, queryParams);
        console.log(
          "📊 Revenue Data Result:",
          revenueData?.length || 0,
          "records"
        );
        if (revenueData && revenueData.length > 0) {
          console.log("✅ Revenue data found!");
          console.log(
            "📊 Sample Revenue Data (first 3):",
            revenueData.slice(0, 3)
          );
          console.log(
            "📊 Sample Revenue Data (last 3):",
            revenueData.slice(-3)
          );
          result.revenue = revenueData;
        } else {
          console.log("⚠️ No revenue data found. Checking orders table...");
          const totalOrders = await query(
            "SELECT COUNT(*) as count, MIN(created_at) as minDate, MAX(created_at) as maxDate FROM orders WHERE status IN (?, ?, ?)",
            ["delivered", "shipping", "confirmed"]
          );
          console.log("📊 Total orders info:", totalOrders[0]);

          // Kiểm tra cụ thể năm 2025
          const orders2025 = await query(
            "SELECT DATE_FORMAT(created_at, ?) as period, COUNT(*) as count FROM orders WHERE YEAR(created_at) = 2025 AND status IN (?, ?, ?) GROUP BY period LIMIT 5",
            [dateFormat, "delivered", "shipping", "confirmed"]
          );
          console.log("📊 Orders 2025 by period:", orders2025);

          // Thử query đơn giản hơn để debug
          const simpleTest = await query(
            `SELECT 
              DATE_FORMAT(created_at, ?) as period,
              COUNT(*) as orderCount,
              SUM(final_amount) as revenue
            FROM orders 
            WHERE status IN ('delivered', 'shipping', 'confirmed')
              AND YEAR(created_at) = 2025
            GROUP BY period
            ORDER BY period ASC
            LIMIT 5`,
            [dateFormat]
          );
          console.log("📊 Simple test query result:", simpleTest);

          // Nếu simple test có dữ liệu, dùng nó
          if (simpleTest && simpleTest.length > 0) {
            console.log("✅ Using simple test query result");
            result.revenue = simpleTest;
          } else {
            result.revenue = [];
          }
        }
      } catch (queryError) {
        console.error("❌ Query Error:", queryError);
        console.error("❌ Query:", revenueQuery);
        console.error("❌ Params:", queryParams);
        console.error("❌ Error message:", queryError.message);
        console.error("❌ Error stack:", queryError.stack);

        // Fallback: thử query đơn giản
        try {
          console.log("🔄 Trying fallback query...");
          const fallbackQuery = `
            SELECT 
              DATE_FORMAT(created_at, ?) as period,
              COALESCE(SUM(final_amount), 0) as revenue,
              COUNT(*) as orderCount
            FROM orders 
            WHERE status IN ('delivered', 'shipping', 'confirmed')
              AND YEAR(created_at) = 2025
            GROUP BY period
            ORDER BY period ASC
          `;
          const fallbackData = await query(fallbackQuery, [dateFormat]);
          console.log(
            "✅ Fallback query success:",
            fallbackData?.length || 0,
            "records"
          );
          result.revenue = fallbackData || [];
        } catch (fallbackError) {
          console.error("❌ Fallback query also failed:", fallbackError);
          result.revenue = [];
        }
      }
    }

    // Top selling products (for pie chart)
    if (type === "products" || !type || type === "all") {
      const topSellingQuery = `
        SELECT 
          p.id,
          p.name,
          p.image,
          SUM(oi.quantity) as totalSold,
          SUM(oi.subtotal) as totalRevenue
        FROM products p
        INNER JOIN order_items oi ON p.id = oi.product_id
        INNER JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('delivered', 'shipping', 'confirmed')
        GROUP BY p.id, p.name, p.image
        ORDER BY totalSold DESC
        LIMIT 10
      `;

      const topSelling = await query(topSellingQuery);
      result.topSellingProducts = topSelling || [];

      // Most viewed products
      const mostViewedQuery = `
        SELECT 
          id,
          name,
          image,
          view_count as viewCount,
          sold_count as soldCount,
          rating
        FROM products
        WHERE status = 'active'
        ORDER BY view_count DESC
        LIMIT 10
      `;

      const mostViewed = await query(mostViewedQuery);
      result.mostViewedProducts = mostViewed || [];

      // Favorite products (products in cart - most added to cart)
      const favoriteQuery = `
        SELECT 
          p.id,
          p.name,
          p.image,
          COUNT(c.id) as cartCount,
          p.sold_count as soldCount,
          p.rating
        FROM products p
        LEFT JOIN cart c ON p.id = c.product_id
        WHERE p.status = 'active'
        GROUP BY p.id, p.name, p.image, p.sold_count, p.rating
        ORDER BY cartCount DESC, p.sold_count DESC
        LIMIT 10
      `;

      const favoriteProducts = await query(favoriteQuery);
      result.favoriteProducts = favoriteProducts || [];
    }

    // View statistics
    if (type === "views" || !type || type === "all") {
      // Total views by product category
      const categoryViewsQuery = `
        SELECT 
          c.id,
          c.name,
          SUM(p.view_count) as totalViews,
          COUNT(p.id) as productCount
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        WHERE c.status = 'active'
        GROUP BY c.id, c.name
        ORDER BY totalViews DESC
        LIMIT 10
      `;

      const categoryViews = await query(categoryViewsQuery);
      result.categoryViews = categoryViews || [];

      // Total views across all products
      const totalViewsResult = await query(
        "SELECT SUM(view_count) as total FROM products WHERE status = ?",
        ["active"]
      );
      result.totalViews = parseInt(totalViewsResult[0]?.total || 0);
    }

    console.log("📊 ===== getDetailedStatistics RESULT =====");
    console.log("📊 Result keys:", Object.keys(result));
    console.log("📊 Revenue length:", result.revenue?.length || 0);
    console.log(
      "📊 Top selling length:",
      result.topSellingProducts?.length || 0
    );
    console.log(
      "📊 Most viewed length:",
      result.mostViewedProducts?.length || 0
    );
    console.log("📊 Favorite length:", result.favoriteProducts?.length || 0);
    console.log("📊 Category views length:", result.categoryViews?.length || 0);

    if (result.revenue && result.revenue.length > 0) {
      console.log(
        "✅ Revenue data will be sent:",
        result.revenue.length,
        "items"
      );
    } else {
      console.warn("⚠️ No revenue data in result!");
    }

    res.json({
      success: true,
      data: result,
      period: period || "month",
      type: type || "all",
    });

    console.log("📊 ===== getDetailedStatistics END =====");
  } catch (error) {
    console.error("Error getting detailed statistics:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thống kê chi tiết",
      error: error.message,
    });
  }
}

// ===== COUPONS MANAGEMENT =====

/**
 * GET /api/admin/coupons
 * Lấy danh sách tất cả coupons
 */
export async function getAllCoupons(req, res) {
  try {
    const { search, status } = req.query;

    let sql = "SELECT * FROM coupons WHERE 1=1";
    const params = [];

    if (search) {
      sql += " AND (code LIKE ? OR name LIKE ? OR description LIKE ?)";
      const searchPattern = `%${search}%`;
      params.push(searchPattern, searchPattern, searchPattern);
    }

    if (status && status !== "all") {
      sql += " AND status = ?";
      params.push(status);
    }

    sql += " ORDER BY created_at DESC";

    const coupons = await query(sql, params);

    res.json({
      success: true,
      data: coupons || [],
      count: coupons ? coupons.length : 0,
    });
  } catch (error) {
    console.error("Error getting all coupons:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách mã khuyến mãi",
      error: error.message,
    });
  }
}

/**
 * GET /api/admin/coupons/:id
 * Lấy thông tin chi tiết một coupon
 */
export async function getCouponById(req, res) {
  try {
    const { id } = req.params;

    const coupons = await query("SELECT * FROM coupons WHERE id = ?", [id]);

    if (!coupons || coupons.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã khuyến mãi",
      });
    }

    res.json({
      success: true,
      data: coupons[0],
    });
  } catch (error) {
    console.error("Error getting coupon by id:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin mã khuyến mãi",
      error: error.message,
    });
  }
}

/**
 * POST /api/admin/coupons
 * Tạo mã khuyến mãi mới
 */
export async function createCoupon(req, res) {
  try {
    const {
      code,
      name,
      description,
      discount_type,
      discount_value,
      min_purchase,
      max_discount,
      usage_limit,
      valid_from,
      valid_until,
      status,
    } = req.body;

    // Validation
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mã khuyến mãi không được để trống",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tên mã khuyến mãi không được để trống",
      });
    }

    if (!discount_type || !["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: "Loại giảm giá không hợp lệ",
      });
    }

    if (!discount_value || isNaN(discount_value) || discount_value <= 0) {
      return res.status(400).json({
        success: false,
        message: "Giá trị giảm giá không hợp lệ",
      });
    }

    if (!valid_from || !valid_until) {
      return res.status(400).json({
        success: false,
        message: "Thời gian hiệu lực không được để trống",
      });
    }

    if (new Date(valid_from) >= new Date(valid_until)) {
      return res.status(400).json({
        success: false,
        message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      });
    }

    // Check if code already exists
    const existingCoupons = await query(
      "SELECT id FROM coupons WHERE code = ?",
      [code.trim().toUpperCase()]
    );
    if (existingCoupons && existingCoupons.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Mã khuyến mãi đã tồn tại",
      });
    }

    // Helper to convert incoming date/time strings to MySQL DATETIME format
    function toSqlDatetime(val) {
      if (val === null || val === undefined || val === "") return null;
      const d = new Date(val);
      if (isNaN(d.getTime())) return null;
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const hh = String(d.getHours()).padStart(2, "0");
      const mi = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
    }

    const sqlValidFrom = toSqlDatetime(valid_from);
    const sqlValidUntil = toSqlDatetime(valid_until);

    // Insert coupon
    const result = await query(
      `INSERT INTO coupons (
        code, name, description, discount_type, discount_value,
        min_purchase, max_discount, usage_limit, used_count,
        valid_from, valid_until, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        code.trim().toUpperCase(),
        name.trim(),
        description ? description.trim() : null,
        discount_type,
        parseFloat(discount_value),
        min_purchase ? parseFloat(min_purchase) : 0,
        max_discount ? parseFloat(max_discount) : null,
        usage_limit ? parseInt(usage_limit) : null,
        0,
        sqlValidFrom,
        sqlValidUntil,
        status || "active",
      ]
    );

    // Get the created coupon
    const newCoupons = await query("SELECT * FROM coupons WHERE id = ?", [
      result.insertId,
    ]);

    res.status(201).json({
      success: true,
      message: "Tạo mã khuyến mãi thành công",
      data: newCoupons[0],
    });
  } catch (error) {
    console.error("Error creating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo mã khuyến mãi",
      error: error.message,
    });
  }
}

/**
 * PUT /api/admin/coupons/:id
 * Cập nhật mã khuyến mãi
 */
export async function updateCoupon(req, res) {
  try {
    const { id } = req.params;
    const {
      code,
      name,
      description,
      discount_type,
      discount_value,
      min_purchase,
      max_discount,
      usage_limit,
      valid_from,
      valid_until,
      status,
    } = req.body;

    // Check if coupon exists
    const existingCoupons = await query("SELECT * FROM coupons WHERE id = ?", [
      id,
    ]);
    if (!existingCoupons || existingCoupons.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã khuyến mãi",
      });
    }

    // Validation
    if (code && code.trim()) {
      // Check if new code conflicts with existing coupon (except current one)
      const codeCheck = await query(
        "SELECT id FROM coupons WHERE code = ? AND id != ?",
        [code.trim().toUpperCase(), id]
      );
      if (codeCheck && codeCheck.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Mã khuyến mãi đã tồn tại",
        });
      }
    }

    if (discount_type && !["percentage", "fixed"].includes(discount_type)) {
      return res.status(400).json({
        success: false,
        message: "Loại giảm giá không hợp lệ",
      });
    }

    if (
      valid_from &&
      valid_until &&
      new Date(valid_from) >= new Date(valid_until)
    ) {
      return res.status(400).json({
        success: false,
        message: "Thời gian kết thúc phải sau thời gian bắt đầu",
      });
    }

    // Build update query dynamically
    const updates = [];
    const params = [];

    if (code !== undefined) {
      const codeValue =
        code === null ? null : String(code).trim().toUpperCase();
      updates.push("code = ?");
      params.push(codeValue);
    }
    if (name !== undefined) {
      const nameValue = name === null ? null : String(name).trim();
      updates.push("name = ?");
      params.push(nameValue);
    }
    if (description !== undefined) {
      const descValue =
        description === null ? null : String(description).trim();
      updates.push("description = ?");
      params.push(descValue);
    }
    if (discount_type !== undefined) {
      const dt = discount_type === null ? null : String(discount_type);
      updates.push("discount_type = ?");
      params.push(dt);
    }
    if (discount_value !== undefined) {
      let dv = null;
      if (discount_value !== null && discount_value !== "") {
        const parsed = Number(discount_value);
        dv = Number.isNaN(parsed) ? null : parsed;
      }
      updates.push("discount_value = ?");
      params.push(dv);
    }
    if (min_purchase !== undefined) {
      let mp = 0;
      if (min_purchase !== null && min_purchase !== "") {
        const parsed = Number(min_purchase);
        mp = Number.isNaN(parsed) ? 0 : parsed;
      }
      updates.push("min_purchase = ?");
      params.push(mp);
    }
    if (max_discount !== undefined) {
      let md = null;
      if (max_discount !== null && max_discount !== "") {
        const parsed = Number(max_discount);
        md = Number.isNaN(parsed) ? null : parsed;
      }
      updates.push("max_discount = ?");
      params.push(md);
    }
    if (usage_limit !== undefined) {
      let ul = null;
      if (usage_limit !== null && usage_limit !== "") {
        const parsed = parseInt(usage_limit, 10);
        ul = Number.isNaN(parsed) ? null : parsed;
      }
      updates.push("usage_limit = ?");
      params.push(ul);
    }
    if (valid_from !== undefined) {
      // convert to MySQL DATETIME format if possible
      let vf = null;
      if (
        valid_from !== null &&
        valid_from !== undefined &&
        valid_from !== ""
      ) {
        const d = new Date(valid_from);
        if (!isNaN(d.getTime())) {
          const yyyy = d.getFullYear();
          const mm = String(d.getMonth() + 1).padStart(2, "0");
          const dd = String(d.getDate()).padStart(2, "0");
          const hh = String(d.getHours()).padStart(2, "0");
          const mi = String(d.getMinutes()).padStart(2, "0");
          const ss = String(d.getSeconds()).padStart(2, "0");
          vf = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
        }
      }
      updates.push("valid_from = ?");
      params.push(vf);
    }
    if (valid_until !== undefined) {
      let vu = null;
      if (
        valid_until !== null &&
        valid_until !== undefined &&
        valid_until !== ""
      ) {
        const d2 = new Date(valid_until);
        if (!isNaN(d2.getTime())) {
          const yyyy = d2.getFullYear();
          const mm = String(d2.getMonth() + 1).padStart(2, "0");
          const dd = String(d2.getDate()).padStart(2, "0");
          const hh = String(d2.getHours()).padStart(2, "0");
          const mi = String(d2.getMinutes()).padStart(2, "0");
          const ss = String(d2.getSeconds()).padStart(2, "0");
          vu = `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
        }
      }
      updates.push("valid_until = ?");
      params.push(vu);
    }
    if (status !== undefined) {
      const st = status === null ? null : String(status);
      updates.push("status = ?");
      params.push(st);
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Không có thông tin nào để cập nhật",
      });
    }

    params.push(id);

    await query(
      `UPDATE coupons SET ${updates.join(", ")} WHERE id = ?`,
      params
    );

    // Get updated coupon
    const updatedCoupons = await query("SELECT * FROM coupons WHERE id = ?", [
      id,
    ]);

    res.json({
      success: true,
      message: "Cập nhật mã khuyến mãi thành công",
      data: updatedCoupons[0],
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật mã khuyến mãi",
      error: error.message,
    });
  }
}

/**
 * DELETE /api/admin/coupons/:id
 * Xóa mã khuyến mãi
 */
export async function deleteCoupon(req, res) {
  try {
    const { id } = req.params;

    // Check if coupon exists
    const existingCoupons = await query("SELECT * FROM coupons WHERE id = ?", [
      id,
    ]);
    if (!existingCoupons || existingCoupons.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy mã khuyến mãi",
      });
    }

    // Check if coupon is used in orders
    const orderCoupons = await query(
      "SELECT id FROM order_coupons WHERE coupon_id = ? LIMIT 1",
      [id]
    );
    if (orderCoupons && orderCoupons.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Không thể xóa mã khuyến mãi đã được sử dụng trong đơn hàng",
      });
    }

    await query("DELETE FROM coupons WHERE id = ?", [id]);

    res.json({
      success: true,
      message: "Xóa mã khuyến mãi thành công",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa mã khuyến mãi",
      error: error.message,
    });
  }
}

// ===== SERVICES MANAGEMENT =====

export async function getAllServicesAdmin(req, res) {
  try {
    const { status = "all", search = "" } = req.query;
    const services = await getServicesModel({
      status,
      search,
      includeInactive: true,
    });

    res.json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách dịch vụ",
      error: error.message,
    });
  }
}

export async function createServiceAdmin(req, res) {
  try {
    const {
      serviceCode,
      name,
      description,
      duration,
      price,
      icon,
      status = "active",
      sortOrder = 0,
    } = req.body;

    if (!serviceCode || !serviceCode.trim()) {
      return res.status(400).json({
        success: false,
        message: "Mã dịch vụ không được để trống",
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: "Tên dịch vụ không được để trống",
      });
    }

    const isUnique = await ensureServiceCodeUnique(serviceCode.trim());
    if (!isUnique) {
      return res.status(400).json({
        success: false,
        message: "Mã dịch vụ đã tồn tại",
      });
    }

    const service = await createServiceModel({
      serviceCode: serviceCode.trim(),
      name: name.trim(),
      description: description?.trim() || null,
      duration: duration?.trim() || null,
      price: price?.trim() || null,
      icon: icon?.trim() || null,
      status,
      sortOrder: Number(sortOrder) || 0,
    });

    res.status(201).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi tạo dịch vụ",
      error: error.message,
    });
  }
}

export async function updateServiceAdmin(req, res) {
  try {
    const { id } = req.params;
    const service = await getServiceByIdModel(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ",
      });
    }

    if (req.body.serviceCode) {
      const isUnique = await ensureServiceCodeUnique(
        req.body.serviceCode.trim(),
        id
      );
      if (!isUnique) {
        return res.status(400).json({
          success: false,
          message: "Mã dịch vụ đã tồn tại",
        });
      }
    }

    const updated = await updateServiceModel(id, {
      serviceCode: req.body.serviceCode?.trim(),
      name: req.body.name?.trim(),
      description: req.body.description?.trim(),
      duration: req.body.duration?.trim(),
      price: req.body.price?.trim(),
      icon: req.body.icon?.trim(),
      status: req.body.status,
      sortOrder:
        req.body.sortOrder !== undefined
          ? Number(req.body.sortOrder)
          : undefined,
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error("Error updating service:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật dịch vụ",
      error: error.message,
    });
  }
}

export async function deleteServiceAdmin(req, res) {
  try {
    const { id } = req.params;
    const service = await getServiceByIdModel(id);
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy dịch vụ",
      });
    }

    const updated = await softDeleteService(id);
    res.json({
      success: true,
      message: "Đã vô hiệu hóa dịch vụ",
      data: updated,
    });
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa dịch vụ",
      error: error.message,
    });
  }
}

// ===== APPOINTMENTS MANAGEMENT =====

const ADMIN_APPOINTMENT_STATUSES = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
];

function formatAdminAppointment(appointment) {
  if (!appointment) return null;
  return {
    ...appointment,
    scheduledAt: appointment.appointmentDate
      ? `${appointment.appointmentDate}T${appointment.appointmentTime}`
      : null,
  };
}

export async function getAllAppointmentsAdmin(req, res) {
  try {
    const { status = "all", search = "", from = null, to = null } = req.query;
    const appointments = await getAppointmentsAdminModel({
      status,
      search,
      dateFrom: from,
      dateTo: to,
    });

    res.json({
      success: true,
      data: appointments.map(formatAdminAppointment),
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách lịch hẹn",
      error: error.message,
    });
  }
}

export async function getAppointmentByIdAdmin(req, res) {
  try {
    const appointment = await getAppointmentByIdModel(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    res.json({
      success: true,
      data: formatAdminAppointment(appointment),
    });
  } catch (error) {
    console.error("Error fetching appointment detail:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy thông tin lịch hẹn",
      error: error.message,
    });
  }
}

export async function updateAppointmentStatusAdmin(req, res) {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!status || !ADMIN_APPOINTMENT_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái lịch hẹn không hợp lệ",
      });
    }

    const appointment = await getAppointmentByIdModel(id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    const updated = await updateAppointmentStatusModel(
      id,
      status,
      note !== undefined ? note : appointment.note
    );

    res.json({
      success: true,
      data: formatAdminAppointment(updated),
    });
  } catch (error) {
    console.error("Error updating appointment status:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi cập nhật lịch hẹn",
      error: error.message,
    });
  }
}

export async function deleteAppointmentAdmin(req, res) {
  try {
    const appointment = await getAppointmentByIdModel(req.params.id);
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy lịch hẹn",
      });
    }

    await deleteAppointmentById(req.params.id);
    res.json({
      success: true,
      message: "Đã xóa lịch hẹn",
    });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa lịch hẹn",
      error: error.message,
    });
  }
}
