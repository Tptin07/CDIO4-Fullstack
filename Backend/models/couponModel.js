import { query } from "../config/database.js";

/**
 * Validate coupon và tính toán discount amount
 * @param {string} couponCode - Mã coupon
 * @param {number} orderAmount - Tổng tiền đơn hàng
 * @returns {Promise<Object>} - Thông tin coupon và discount amount
 */
export async function validateCoupon(couponCode, orderAmount) {
  // Lấy thông tin coupon từ database
  const [coupon] = await query(
    `SELECT 
      id, code, name, description, discount_type, discount_value,
      min_purchase, max_discount, usage_limit, used_count,
      valid_from, valid_until, status
    FROM coupons 
    WHERE code = ?`,
    [couponCode.toUpperCase()]
  );

  if (!coupon) {
    throw new Error("Mã giảm giá không tồn tại");
  }

  // Kiểm tra status
  if (coupon.status !== "active") {
    throw new Error("Mã giảm giá không còn hiệu lực");
  }

  // Kiểm tra thời gian hiệu lực
  const now = new Date();
  const validFrom = new Date(coupon.valid_from);
  const validUntil = new Date(coupon.valid_until);

  if (now < validFrom) {
    throw new Error("Mã giảm giá chưa có hiệu lực");
  }

  if (now > validUntil) {
    throw new Error("Mã giảm giá đã hết hạn");
  }

  // Kiểm tra usage limit
  if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
    throw new Error("Mã giảm giá đã hết lượt sử dụng");
  }

  // Kiểm tra min_purchase
  if (orderAmount < parseFloat(coupon.min_purchase)) {
    throw new Error(
      `Đơn hàng tối thiểu ${new Intl.NumberFormat("vi-VN").format(
        coupon.min_purchase
      )}₫ để sử dụng mã này`
    );
  }

  // Tính toán discount amount
  let discountAmount = 0;

  if (coupon.discount_type === "percentage") {
    // Giảm theo phần trăm
    discountAmount = (orderAmount * parseFloat(coupon.discount_value)) / 100;

    // Áp dụng max_discount nếu có
    if (coupon.max_discount !== null && discountAmount > parseFloat(coupon.max_discount)) {
      discountAmount = parseFloat(coupon.max_discount);
    }
  } else {
    // Giảm theo số tiền cố định
    discountAmount = parseFloat(coupon.discount_value);
  }

  // Đảm bảo discount không vượt quá order amount
  if (discountAmount > orderAmount) {
    discountAmount = orderAmount;
  }

  return {
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: parseFloat(coupon.discount_value),
    discount_amount: Math.round(discountAmount),
    min_purchase: parseFloat(coupon.min_purchase),
    max_discount: coupon.max_discount ? parseFloat(coupon.max_discount) : null,
  };
}

/**
 * Lấy danh sách coupon có sẵn (active và còn hiệu lực)
 * @returns {Promise<Array>} - Danh sách coupon
 */
export async function getAvailableCoupons() {
  const now = new Date();

  const coupons = await query(
    `SELECT 
      id, code, name, description, discount_type, discount_value,
      min_purchase, max_discount, usage_limit, used_count,
      valid_from, valid_until, status
    FROM coupons 
    WHERE status = 'active'
      AND valid_from <= ?
      AND valid_until >= ?
      AND (usage_limit IS NULL OR used_count < usage_limit)
    ORDER BY created_at DESC`,
    [now, now]
  );

  return coupons.map((coupon) => ({
    id: coupon.id,
    code: coupon.code,
    name: coupon.name,
    description: coupon.description,
    discount_type: coupon.discount_type,
    discount_value: parseFloat(coupon.discount_value),
    min_purchase: parseFloat(coupon.min_purchase),
    max_discount: coupon.max_discount ? parseFloat(coupon.max_discount) : null,
    usage_limit: coupon.usage_limit,
    used_count: coupon.used_count,
    valid_from: coupon.valid_from,
    valid_until: coupon.valid_until,
  }));
}

