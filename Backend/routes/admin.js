import express from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getAllUsers,
  getAllEmployees,
  createUser,
  updateUser,
  toggleUserLock,
  deleteUser,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  getAllProductsAdmin,
  getProductByIdAdmin,
  createProduct,
  updateProduct,
  deleteProduct,
  getAllCategoriesAdmin,
  getCategoryByIdAdmin,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  getAllPostsAdmin,
  getPostByIdAdmin,
  createPost,
  updatePost,
  deletePost,
  getDetailedStatistics,
  getAllCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAllServicesAdmin,
  createServiceAdmin,
  updateServiceAdmin,
  deleteServiceAdmin,
  getAllAppointmentsAdmin,
  getAppointmentByIdAdmin,
  updateAppointmentStatusAdmin,
  deleteAppointmentAdmin,
} from '../controllers/adminController.js';
import * as notificationController from '../controllers/notificationController.js';

const router = express.Router();

// Middleware: Tất cả routes đều cần đăng nhập và là admin
router.use(authenticateToken);
router.use(async (req, res, next) => {
  try {
    // Check if user exists and is admin
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: 'Không có thông tin người dùng. Vui lòng đăng nhập lại.',
      });
    }

    const { query } = await import('../config/database.js');
    const users = await query('SELECT role FROM users WHERE id = ?', [req.user.userId]);
    
    // query() trả về mảng kết quả trực tiếp
    if (!users || users.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Không tìm thấy người dùng',
      });
    }
    
    const user = users[0];
    if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Bạn không có quyền truy cập. Chỉ quản trị viên mới có thể truy cập.',
      });
    }
    
    next();
  } catch (error) {
    console.error('Error checking admin permission:', error);
    return res.status(500).json({
      success: false,
      message: 'Lỗi khi kiểm tra quyền truy cập',
      error: error.message,
    });
  }
});

// Dashboard Stats
router.get('/stats', getDashboardStats);
router.get('/stats/detailed', getDetailedStatistics);

// Users Management
router.get('/users', getAllUsers);
router.get('/employees', getAllEmployees);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.patch('/users/:id/lock', toggleUserLock);
router.delete('/users/:id', deleteUser);

// Orders Management
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

// Products Management
router.get('/products', getAllProductsAdmin);
router.get('/products/:id', getProductByIdAdmin);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Categories Management
router.get('/categories', getAllCategoriesAdmin);
router.get('/categories/:id/products', getCategoryProducts); // Must be before /categories/:id
router.get('/categories/:id', getCategoryByIdAdmin);
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

// Posts Management
router.get('/posts', getAllPostsAdmin);
router.get('/posts/:id', getPostByIdAdmin);
router.post('/posts', createPost);
router.put('/posts/:id', updatePost);
router.delete('/posts/:id', deletePost);

// Notifications Management
router.get('/notifications', notificationController.getAllNotifications);
router.get('/notifications/unread', notificationController.getUnreadNotifications);
router.put('/notifications/:id/read', notificationController.markAsRead);
router.put('/notifications/read-all', notificationController.markAllAsRead);
router.delete('/notifications/:id', notificationController.deleteNotification);
router.delete('/notifications/read-all', notificationController.deleteAllRead);

// Coupons Management
router.get('/coupons', getAllCoupons);
router.get('/coupons/:id', getCouponById);
router.post('/coupons', createCoupon);
router.put('/coupons/:id', updateCoupon);
router.delete('/coupons/:id', deleteCoupon);

// Services Management
router.get('/services', getAllServicesAdmin);
router.post('/services', createServiceAdmin);
router.put('/services/:id', updateServiceAdmin);
router.delete('/services/:id', deleteServiceAdmin);

// Appointments Management
router.get('/appointments', getAllAppointmentsAdmin);
router.get('/appointments/:id', getAppointmentByIdAdmin);
router.put('/appointments/:id/status', updateAppointmentStatusAdmin);
router.delete('/appointments/:id', deleteAppointmentAdmin);

export default router;

