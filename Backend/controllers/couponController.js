import * as couponModel from "../models/couponModel.js";

/**
 * POST /api/coupons/validate
 * Validate coupon và tính toán discount
 */
export async function validateCoupon(req, res) {
  try {
    const { code, order_amount } = req.body;

    // Validation
    if (!code || !code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng nhập mã giảm giá",
      });
    }

    if (!order_amount || isNaN(order_amount) || order_amount < 0) {
      return res.status(400).json({
        success: false,
        message: "Tổng tiền đơn hàng không hợp lệ",
      });
    }

    const orderAmount = parseFloat(order_amount);

    // Validate coupon
    const couponData = await couponModel.validateCoupon(code.trim(), orderAmount);

    res.json({
      success: true,
      message: "Mã giảm giá hợp lệ",
      data: couponData,
    });
  } catch (error) {
    console.error("❌ Error in validateCoupon:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Mã giảm giá không hợp lệ",
    });
  }
}

/**
 * GET /api/coupons/available
 * Lấy danh sách coupon có sẵn
 */
export async function getAvailableCoupons(req, res) {
  try {
    const coupons = await couponModel.getAvailableCoupons();

    res.json({
      success: true,
      data: coupons,
      count: coupons.length,
    });
  } catch (error) {
    console.error("❌ Error in getAvailableCoupons:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy danh sách mã giảm giá",
      error: error.message,
    });
  }
}

