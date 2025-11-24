import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { testConnection } from "./config/database.js";
import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import cartRoutes from "./routes/cart.js";
import commentRoutes from "./routes/comments.js";
import chatRoutes from "./routes/chat.js";
import adminRoutes from "./routes/admin.js";
import postRoutes from "./routes/posts.js";
import couponRoutes from "./routes/coupons.js";
import orderRoutes from "./routes/orders.js";
import serviceRoutes from "./routes/services.js";
import appointmentRoutes from "./routes/appointments.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - CORS configuration
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:3000",
      "http://127.0.0.1:5173",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// Tăng limit cho body parser để hỗ trợ upload ảnh base64 (lên đến 10MB)
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Test database connection
app.get("/api/health", async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: "OK",
    database: dbConnected ? "Connected" : "Disconnected",
    config: {
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 3306,
      database: process.env.DB_NAME || "pharmacity_db",
    },
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/coupons", couponRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/appointments", appointmentRoutes);

// Routes sẽ được thêm vào đây
app.get("/api", (req, res) => {
  res.json({
    message: "PharmaCity Backend API",
    version: "1.0.0",
    endpoints: {
      health: "/api/health",
      auth: {
        register: "POST /api/auth/register",
        login: "POST /api/auth/login",
        me: "GET /api/auth/me (requires token)",
        updateProfile: "PUT /api/auth/profile (requires token)",
      },
      products: {
        list: "GET /api/products?q=&cat=&brand=&form=&sort=&page=&limit=",
        filters: "GET /api/products/filters",
        detail: "GET /api/products/:id",
        related: "GET /api/products/:id/related?limit=",
      },
      cart: {
        add: "POST /api/cart (requires token)",
        get: "GET /api/cart (requires token)",
        count: "GET /api/cart/count (requires token)",
        update: "PUT /api/cart/:id (requires token)",
        remove: "DELETE /api/cart/:id (requires token)",
        clear: "DELETE /api/cart (requires token)",
      },
      comments: {
        add: "POST /api/comments (requires token)",
        getByProduct:
          "GET /api/comments/product/:productId?page=&limit=&status=",
        getById: "GET /api/comments/:id",
        count: "GET /api/comments/product/:productId/count?status=",
        update: "PUT /api/comments/:id (requires token)",
        delete: "DELETE /api/comments/:id (requires token)",
      },
      chat: {
        send: "POST /api/chat/send (requires token)",
        conversations: "GET /api/chat/conversations (requires token)",
        conversation:
          "GET /api/chat/conversation/:conversation_id (requires token)",
        messages:
          "GET /api/chat/messages/:conversation_id?limit=&offset= (requires token)",
        markRead:
          "PUT /api/chat/messages/read/:conversation_id (requires token)",
        unreadCount: "GET /api/chat/unread-count (requires token)",
      },
      posts: {
        list: "GET /api/posts?q=&cat=&tag=&sort=&page=&limit=",
        detail: "GET /api/posts/:id",
        related: "GET /api/posts/:id/related?limit=",
        popular: "GET /api/posts/popular?limit=",
      },
      coupons: {
        validate: "POST /api/coupons/validate",
        available: "GET /api/coupons/available",
      },
      orders: {
        create: "POST /api/orders (requires token)",
        list: "GET /api/orders (requires token)",
        detail: "GET /api/orders/:id (requires token)",
        updateStatus: "PUT /api/orders/:id/status (requires token)",
      },
    },
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);

  // Kiểm tra lỗi payload too large
  if (err.type === "entity.too.large") {
    return res.status(413).json({
      success: false,
      error: "Payload too large",
      message: "Kích thước dữ liệu quá lớn. Vui lòng chọn ảnh nhỏ hơn 10MB.",
    });
  }

  res.status(500).json({
    success: false,
    error: "Something went wrong!",
    message: err.message,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
  });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api`);

  // Kiểm tra kết nối database khi khởi động
  await testConnection();
});
