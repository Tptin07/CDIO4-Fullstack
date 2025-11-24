import express from "express";
import {
  validateCoupon,
  getAvailableCoupons,
  getAllCouponsForUser,
} from "../controllers/couponController.js";

const router = express.Router();

// POST /api/coupons/validate - Validate coupon và tính discount
// Không yêu cầu authentication vì có thể dùng trước khi đăng nhập
router.post("/validate", validateCoupon);

// GET /api/coupons/available - Lấy danh sách coupon có sẵn (chỉ active và còn hiệu lực)
// Không yêu cầu authentication
router.get("/available", getAvailableCoupons);

// GET /api/coupons/all - Lấy tất cả coupons (bao gồm cả hết hạn) cho trang user
// Không yêu cầu authentication
router.get("/all", getAllCouponsForUser);

export default router;

