import { query } from "../config/database.js";
import { validateId } from "../utils/validateId.js";

/**
 * Tạo đơn hàng mới từ giỏ hàng
 * Sử dụng stored procedure CreateOrder
 */
export async function createOrder(userId, orderData) {
  const {
    address_id,
    payment_method = "COD",
    shipping_method = "Giao hàng tiêu chuẩn",
    coupon_code = null,
    note = null,
  } = orderData;

  // Validation
  if (!address_id) {
    throw new Error("Vui lòng chọn địa chỉ giao hàng");
  }

  // Validate address_id - loại bỏ ID tạm thời
  const addressIdInt = validateId(address_id, "address_id");

  // Kiểm tra địa chỉ có tồn tại không
  const [addressCheck] = await query(
    `SELECT id FROM addresses WHERE id = ? AND user_id = ?`,
    [addressIdInt, userId]
  );

  if (!addressCheck) {
    console.error("❌ Address not found:", addressIdInt, "for user:", userId);
    throw new Error("Địa chỉ giao hàng không tồn tại hoặc không thuộc về bạn");
  }

  // Kiểm tra giỏ hàng có sản phẩm không
  const cartItems = await query(
    `SELECT COUNT(*) as count FROM cart WHERE user_id = ?`,
    [userId]
  );

  if (!cartItems[0] || cartItems[0].count === 0) {
    throw new Error("Giỏ hàng của bạn đang trống");
  }

  // Log để debug
  console.log("📦 Creating order with:", {
    userId: userId,
    userIdType: typeof userId,
    addressId: addressIdInt,
    addressIdType: typeof addressIdInt,
    payment_method: payment_method,
    shipping_method: shipping_method,
    coupon_code: coupon_code,
    note: note,
  });

  // Validate userId
  const userIdInt = validateId(userId, "user_id");
  
  // addressIdInt đã được validate ở trên
  console.log("✅ Final validated parameters:", {
    userId: userIdInt,
    userIdType: typeof userIdInt,
    addressId: addressIdInt,
    addressIdType: typeof addressIdInt,
    payment_method,
    shipping_method
  });

  // Gọi stored procedure CreateOrder với tất cả tham số đã validate
  try {
    // Gọi stored procedure - có thể trả về multiple result sets
    const callResult = await query(
      `CALL CreateOrder(?, ?, ?, ?, ?, ?, @order_id, @order_code)`,
      [userIdInt, addressIdInt, payment_method, shipping_method, coupon_code || null, note || null]
    );
    console.log("📦 CreateOrder CALL result:", {
      callResult,
      type: typeof callResult,
      isArray: Array.isArray(callResult),
      length: Array.isArray(callResult) ? callResult.length : 'N/A'
    });
  } catch (error) {
    console.error("❌ Error calling CreateOrder procedure:", error);
    console.error("Parameters:", {
      userId: userIdInt,
      addressId: addressIdInt,
      payment_method,
      shipping_method,
      coupon_code,
      note,
    });
    throw error;
  }

  // Lấy order_id và order_code từ output parameters
  // query() function đã trả về results (array), không cần destructure thêm
  const output = await query(`SELECT @order_id as order_id, @order_code as order_code`);

  console.log("📦 CreateOrder output:", {
    output,
    type: typeof output,
    isArray: Array.isArray(output),
    length: Array.isArray(output) ? output.length : 'N/A',
    firstElement: Array.isArray(output) && output.length > 0 ? output[0] : 'N/A'
  });

  // Kiểm tra output có dữ liệu không
  if (!output || !Array.isArray(output) || output.length === 0) {
    console.error("❌ Error: No output from CreateOrder procedure");
    console.error("Output:", output);
    throw new Error("Lỗi khi tạo đơn hàng: Không nhận được order_id từ stored procedure");
  }

  // Lấy row đầu tiên
  const outputRow = output[0];
  
  if (!outputRow || typeof outputRow !== 'object') {
    console.error("❌ Error: outputRow is null, undefined, or not an object");
    console.error("Output:", output);
    console.error("OutputRow:", outputRow);
    throw new Error("Lỗi khi tạo đơn hàng: Không thể đọc output từ stored procedure");
  }

  const orderId = outputRow.order_id;
  const orderCode = outputRow.order_code;

  console.log("📦 Extracted values:", { 
    orderId, 
    orderCode,
    orderIdType: typeof orderId,
    orderCodeType: typeof orderCode
  });

  if (!orderId || orderId === null || orderId === undefined || orderId === 0) {
    console.error("❌ Error: order_id is null, undefined, or 0");
    console.error("OutputRow:", outputRow);
    throw new Error("Lỗi khi tạo đơn hàng: order_id không hợp lệ");
  }

  // Lấy thông tin đơn hàng vừa tạo
  const order = await getOrderById(orderId, userIdInt);

  return order;
}

/**
 * Lấy thông tin đơn hàng theo ID
 */
export async function getOrderById(orderId, userId = null) {
  // Validate orderId
  const validatedOrderId = validateId(orderId, "order_id");
  
  // Validate userId nếu có
  const validatedUserId = userId ? validateId(userId, "user_id") : null;
  
  let sql = `
    SELECT 
      o.id,
      o.order_code,
      o.user_id,
      o.address_id,
      o.total_amount,
      o.shipping_fee,
      o.discount_amount,
      o.final_amount,
      o.payment_method,
      o.payment_status,
      o.shipping_method,
      o.shipping_status,
      o.status,
      o.note,
      o.created_at,
      o.updated_at,
      a.full_name as address_name,
      a.phone as address_phone,
      a.province,
      a.district,
      a.ward,
      a.street_address,
      a.postal_code
    FROM orders o
    LEFT JOIN addresses a ON o.address_id = a.id
    WHERE o.id = ?
  `;

  const params = [validatedOrderId];

  // Nếu có userId, chỉ lấy đơn hàng của user đó
  if (validatedUserId) {
    sql += ` AND o.user_id = ?`;
    params.push(validatedUserId);
  }

  const [order] = await query(sql, params);

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng");
  }

  // Lấy danh sách sản phẩm trong đơn hàng
  const items = await query(
    `SELECT 
      id,
      product_id,
      product_name,
      product_image,
      price,
      quantity,
      subtotal
    FROM order_items
    WHERE order_id = ?
    ORDER BY id`,
    [validatedOrderId]
  );

  // Lấy timeline
  const timeline = await query(
    `SELECT 
      id,
      status,
      label,
      description,
      created_at
    FROM order_timeline
    WHERE order_id = ?
    ORDER BY created_at ASC`,
    [validatedOrderId]
  );

  return {
    ...order,
    items: items || [],
    timeline: timeline || [],
  };
}

/**
 * Lấy danh sách đơn hàng của user
 */
export async function getUserOrders(userId, filters = {}) {
  // Validate userId
  let userIdInt;
  try {
    userIdInt = validateId(userId, "user_id");
    console.log('📦 getUserOrders - Validated userId:', userIdInt, 'from:', userId);
  } catch (error) {
    console.error('❌ getUserOrders - Error validating userId:', error);
    throw error;
  }
  
  const { status = null, limit = 50, offset = 0 } = filters;

  // Đảm bảo limit và offset là số nguyên
  const limitInt = parseInt(limit) || 50;
  const offsetInt = parseInt(offset) || 0;

  // MySQL2 không hỗ trợ prepared statement với LIMIT và OFFSET
  // Phải dùng giá trị trực tiếp (đã validate là số nguyên)
  let sql = `
    SELECT 
      o.id,
      o.order_code,
      o.total_amount,
      o.shipping_fee,
      o.discount_amount,
      o.final_amount,
      o.payment_method,
      o.payment_status,
      o.shipping_status,
      o.shipping_method,
      o.status,
      o.note,
      o.created_at,
      o.updated_at,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
    FROM orders o
    WHERE o.user_id = ?
  `;

  const params = [userIdInt];

  // Không thêm điều kiện deleted_at vì cột có thể chưa tồn tại
  // Nếu cần filter deleted_at, hãy thêm cột vào database trước

  if (status) {
    sql += ` AND o.status = ?`;
    params.push(status);
  }

  // Sử dụng giá trị trực tiếp cho LIMIT và OFFSET (đã validate là số nguyên)
  // Lưu ý: Đã validate limitInt và offsetInt là số nguyên, an toàn khỏi SQL injection
  sql += ` ORDER BY o.created_at DESC LIMIT ${limitInt} OFFSET ${offsetInt}`;
  
  console.log('📦 getUserOrders - Final SQL:', sql);
  console.log('📦 getUserOrders - Final params:', params);
  console.log('📦 getUserOrders - Params types:', params.map(p => typeof p));
  console.log('📦 getUserOrders - Limit:', limitInt, 'Offset:', offsetInt);

  let orders;
  try {
    orders = await query(sql, params);
  } catch (error) {
    console.error('❌ Error in getUserOrders query:', error);
    console.error('   SQL:', sql);
    console.error('   Params:', params);
    throw error;
  }

  console.log('📦 getUserOrders result count:', orders?.length || 0);

  // Lấy thông tin items cho mỗi đơn hàng
  if (orders && orders.length > 0) {
    for (const order of orders) {
      try {
        const items = await query(
          `SELECT 
            id,
            product_id,
            product_name,
            product_image,
            price,
            quantity,
            subtotal
           FROM order_items 
           WHERE order_id = ?
           ORDER BY id ASC`,
          [order.id]
        );
        order.items = items || [];
      } catch (error) {
        console.error(`❌ Error loading items for order ${order.id}:`, error);
        order.items = [];
      }
    }
  }

  return orders || [];
}

/**
 * Lấy tổng số đơn hàng của user
 */
export async function getUserOrdersCount(userId, status = null) {
  // Validate userId
  let userIdInt;
  try {
    userIdInt = validateId(userId, "user_id");
  } catch (error) {
    console.error('❌ getUserOrdersCount - Error validating userId:', error);
    throw error;
  }
  
  let sql = `SELECT COUNT(*) as count FROM orders WHERE user_id = ?`;
  const params = [userIdInt];

  // Không thêm điều kiện deleted_at vì cột có thể chưa tồn tại

  if (status) {
    sql += ` AND status = ?`;
    params.push(status);
  }

  let result;
  try {
    const results = await query(sql, params);
    result = results[0];
  } catch (error) {
    console.error('❌ Error in getUserOrdersCount query:', error);
    console.error('   SQL:', sql);
    console.error('   Params:', params);
    throw error;
  }
  
  return result?.count || 0;
}

/**
 * Lấy tất cả đơn hàng (cho admin)
 */
export async function getAllOrders(filters = {}) {
  const {
    status = null,
    payment_status = null,
    shipping_status = null,
    search = null,
    limit = 50,
    offset = 0,
  } = filters;

  let sql = `
    SELECT 
      o.id,
      o.order_code,
      o.user_id,
      u.full_name as user_name,
      u.email as user_email,
      u.phone as user_phone,
      o.total_amount,
      o.shipping_fee,
      o.discount_amount,
      o.final_amount,
      o.payment_method,
      o.payment_status,
      o.shipping_status,
      o.status,
      o.created_at,
      o.updated_at,
      (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
    FROM orders o
    LEFT JOIN users u ON o.user_id = u.id
    WHERE 1=1
  `;

  const params = [];

  if (status) {
    sql += ` AND o.status = ?`;
    params.push(status);
  }

  if (payment_status) {
    sql += ` AND o.payment_status = ?`;
    params.push(payment_status);
  }

  if (shipping_status) {
    sql += ` AND o.shipping_status = ?`;
    params.push(shipping_status);
  }

  if (search) {
    sql += ` AND (o.order_code LIKE ? OR u.full_name LIKE ? OR u.email LIKE ?)`;
    const searchTerm = `%${search}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  sql += ` ORDER BY o.created_at DESC LIMIT ? OFFSET ?`;
  params.push(limit, offset);

  const orders = await query(sql, params);

  return orders || [];
}

/**
 * Cập nhật trạng thái đơn hàng
 */
export async function updateOrderStatus(orderId, status, userId = null) {
  // Validate orderId
  const validatedOrderId = validateId(orderId, "order_id");
  
  // Validate userId nếu có
  const validatedUserId = userId ? validateId(userId, "user_id") : null;
  
  let sql = `UPDATE orders SET status = ?, updated_at = NOW() WHERE id = ?`;
  const params = [status, validatedOrderId];

  if (validatedUserId) {
    sql += ` AND user_id = ?`;
    params.push(validatedUserId);
  }

  const result = await query(sql, params);

  if (result.affectedRows === 0) {
    throw new Error("Không tìm thấy đơn hàng hoặc không có quyền cập nhật");
  }

  // Thêm vào timeline
  const statusLabels = {
    pending: "Đơn hàng đã được đặt",
    confirmed: "Đơn hàng đã được xác nhận",
    processing: "Đơn hàng đang được xử lý",
    shipping: "Đơn hàng đang được giao",
    delivered: "Đơn hàng đã được giao",
    cancelled: "Đơn hàng đã bị hủy",
    refunded: "Đơn hàng đã được hoàn tiền",
  };

  await query(
    `INSERT INTO order_timeline (order_id, status, label, description)
     VALUES (?, ?, ?, ?)`,
    [
      validatedOrderId,
      status,
      statusLabels[status] || status,
      `Trạng thái đơn hàng đã được cập nhật thành: ${statusLabels[status] || status}`,
    ]
  );

  return await getOrderById(validatedOrderId);
}

