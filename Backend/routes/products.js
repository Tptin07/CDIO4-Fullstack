import express from "express";
import {
  getProducts,
  getFilters,
  getProductById,
  getRelatedProducts,
  getFeaturedProducts,
  getNewProducts,
  getBestsellerProducts,
  getSaleProducts,
  getCategoriesForHome,
} from "../controllers/productController.js";

const router = express.Router();

// Public routes
// Lưu ý: routes cụ thể phải đặt trước routes có params
router.get("/filters", getFilters);
router.get("/categories", getCategoriesForHome);
router.get("/featured", getFeaturedProducts);
router.get("/new", getNewProducts);
router.get("/bestseller", getBestsellerProducts);
router.get("/sale", getSaleProducts);
router.get("/:id/related", getRelatedProducts);
router.get("/:id", getProductById);
router.get("/", getProducts);

export default router;

