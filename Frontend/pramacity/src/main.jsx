// src/main.jsx
import React from "react";
import { createRoot } from "react-dom/client";
import AppRouter from "./router/AppRouter.jsx";
import { AuthProvider } from "./utils/AuthContext.jsx"; // ✅ thêm dòng này

// (tuỳ chọn) global css
import "./assets/css/styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      {" "}
      {/* ✅ bọc AppRouter bên trong */}
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
);
