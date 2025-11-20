import express from "express";
import {
  validateCoupon,
  getAvailableCoupons,
} from "../controllers/couponController.js";

const router = express.Router();

// POST /api/coupons/validate - Validate coupon và tính discount
// Không yêu cầu authentication vì có thể dùng trước khi đăng nhập
router.post("/validate", validateCoupon);

// GET /api/coupons/available - Lấy danh sách coupon có sẵn
// Không yêu cầu authentication
router.get("/available", getAvailableCoupons);

export default router;

