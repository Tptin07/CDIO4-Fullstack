import * as orderModel from "../models/orderModel.js";
import * as notificationModel from "../models/notificationModel.js";
import { validateId } from "../utils/validateId.js";

/**
 * POST /api/orders
 * Tạo đơn hàng mới từ giỏ hàng
 */
export async function createOrder(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để đặt hàng",
      });
    }

    const userId = req.user.userId;
    const { address_id, payment_method, shipping_method, coupon_code, note } =
      req.body;

    // Validation
    if (!address_id) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn địa chỉ giao hàng",
      });
    }

    // Log để debug
    console.log("📝 Order request body:", {
      address_id,
      address_id_type: typeof address_id,
      payment_method,
      shipping_method,
      coupon_code,
      note,
    });

    // Validate address_id - loại bỏ ID tạm thời
    let addressIdInt;
    try {
      addressIdInt = validateId(address_id, "address_id");
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "Địa chỉ giao hàng không hợp lệ",
      });
    }
    
    console.log("✅ Validated address_id:", {
      original: address_id,
      final: addressIdInt,
      type: typeof addressIdInt
    });

    // Tạo đơn hàng
    const order = await orderModel.createOrder(userId, {
      address_id: addressIdInt,
      payment_method: payment_method || "COD",
      shipping_method: shipping_method || "Giao hàng tiêu chuẩn",
      coupon_code: coupon_code || null,
      note: note || null,
    });

    // Tạo thông báo cho admin khi có đơn hàng mới
    try {
      await notificationModel.createNotification({
        type: 'order_new',
        title: 'Đơn hàng mới',
        message: `Có đơn hàng mới: ${order.orderCode || order.order_code || `#${order.id}`} với tổng tiền ${parseFloat(order.finalAmount || order.final_amount || 0).toLocaleString('vi-VN')}đ`,
        related_id: order.id,
        related_type: 'order',
      });
    } catch (notifError) {
      console.error('❌ Error creating notification:', notifError);
      // Không throw error để không ảnh hưởng đến việc tạo đơn hàng
    }

    res.json({
      success: true,
      message: "Đặt hàng thành công!",
      data: order,
    });
  } catch (error) {
    console.error("❌ Error in createOrder:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi tạo đơn hàng",
    });
  }
}

/**
 * GET /api/orders
 * Lấy danh sách đơn hàng của user
 */
export async function getUserOrders(req, res) {
  try {
    console.log('📦 getUserOrders - Starting request');
    console.log('📦 getUserOrders - req.user:', req.user ? { userId: req.user.userId, email: req.user.email } : 'null');
    
    if (!req.user || !req.user.userId) {
      console.error('❌ getUserOrders - No user or userId');
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userId = req.user.userId;
    const { status, limit = 50, offset = 0 } = req.query;

    console.log('📦 getUserOrders request:', {
      userId,
      userIdType: typeof userId,
      status,
      limit,
      offset
    });

    // Validate userId trước khi gọi model
    if (!userId) {
      console.error('❌ getUserOrders - userId is empty');
      return res.status(400).json({
        success: false,
        message: "User ID không hợp lệ",
      });
    }

    console.log('📦 getUserOrders - Calling orderModel.getUserOrders');
    // Đảm bảo limit và offset là số nguyên hợp lệ
    const limitInt = parseInt(limit) || 50;
    const offsetInt = parseInt(offset) || 0;
    
    console.log('📦 getUserOrders - Calling model with:', {
      userId,
      status: status || null,
      limit: limitInt,
      offset: offsetInt,
      limitType: typeof limitInt,
      offsetType: typeof offsetInt
    });
    
    const orders = await orderModel.getUserOrders(userId, {
      status: status || null,
      limit: limitInt,
      offset: offsetInt,
    });

    console.log('✅ getUserOrders - Orders retrieved:', {
      count: orders?.length || 0,
      sample: orders && orders.length > 0 ? {
        id: orders[0].id,
        order_code: orders[0].order_code,
        status: orders[0].status,
        item_count: orders[0].item_count,
        items_length: orders[0].items?.length || 0
      } : null
    });

    console.log('📦 getUserOrders - Calling orderModel.getUserOrdersCount');
    const total = await orderModel.getUserOrdersCount(userId, status || null);
    console.log('✅ getUserOrders - Total count:', total);

    res.json({
      success: true,
      data: orders,
      pagination: {
        total,
        limit: parseInt(limit) || 50,
        offset: parseInt(offset) || 0,
      },
    });
  } catch (error) {
    console.error("❌ Error in getUserOrders controller:", error);
    console.error("❌ Error stack:", error.stack);
    console.error("❌ Error name:", error.name);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error code:", error.code);
    console.error("❌ Full error object:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    
    // Trả về error message chi tiết để debug
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách đơn hàng",
      error: error.message,
      errorName: error.name,
      errorCode: error.code,
      errorStack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      // Thêm thông tin debug
      debug: {
        hasUser: !!req.user,
        userId: req.user?.userId,
        userType: typeof req.user?.userId
      }
    });
  }
}

/**
 * GET /api/orders/:id
 * Lấy chi tiết đơn hàng
 */
export async function getOrderById(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userId = req.user.userId;
    const { id } = req.params;

    // Validate orderId - loại bỏ ID tạm thời
    let validatedOrderId;
    try {
      validatedOrderId = validateId(id, "order_id");
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "ID đơn hàng không hợp lệ",
      });
    }

    const order = await orderModel.getOrderById(validatedOrderId, userId);

    res.json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("❌ Error in getOrderById:", error);
    res.status(404).json({
      success: false,
      message: error.message || "Không tìm thấy đơn hàng",
    });
  }
}

/**
 * PUT /api/orders/:id/status
 * Cập nhật trạng thái đơn hàng (chỉ user sở hữu đơn hàng)
 */
export async function updateOrderStatus(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userId = req.user.userId;
    const { id } = req.params;
    const { status } = req.body;

    // Validate orderId - loại bỏ ID tạm thời
    let validatedOrderId;
    try {
      validatedOrderId = validateId(id, "order_id");
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "ID đơn hàng không hợp lệ",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp trạng thái mới",
      });
    }

    const validStatuses = [
      "pending",
      "confirmed",
      "processing",
      "shipping",
      "delivered",
      "cancelled",
      "refunded",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Trạng thái không hợp lệ",
      });
    }

    const order = await orderModel.updateOrderStatus(validatedOrderId, status, userId);

    res.json({
      success: true,
      message: "Đã cập nhật trạng thái đơn hàng",
      data: order,
    });
  } catch (error) {
    console.error("❌ Error in updateOrderStatus:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật trạng thái đơn hàng",
    });
  }
}

