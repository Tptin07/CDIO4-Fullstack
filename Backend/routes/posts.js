import express from "express";
import {
  getPosts,
  getPostById,
  getRelatedPosts,
  getPopularPosts,
} from "../controllers/postController.js";

const router = express.Router();

// Public routes
// Lưu ý: routes cụ thể phải đặt trước routes có params
router.get("/popular", getPopularPosts);
router.get("/:id/related", getRelatedPosts);
router.get("/:id", getPostById);
router.get("/", getPosts);

export default router;

