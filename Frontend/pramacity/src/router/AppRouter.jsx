// src/router/AppRouter.jsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Layout from "../layouts/Layout"; // đúng path: src/layouts/Layout.jsx
import ScrollToTop from "../components/ScrollToTop";
import Home from "../pages/Home";
import Account from "../pages/Account";
import BaiViet from "../pages/BaiViet";
import BanChay from "../pages/BanChay";
import HangMoi from "../pages/HangMoi";
import DichVu from "../pages/DichVu";
import KhuyenMai from "../pages/KhuyenMai";
import ProductDetail from "../pages/ProductDetail";
import BaiVietDetail from "../pages/BaiVietDetail";
import DatLich from "../pages/DatLich";
import Thuoc from "../pages/Thuoc";
import FlashSale from "../pages/FlashSale";
import GioHang from "../pages/GioHang";
import SearchResults from "../pages/SearchResults";
import AdminDashboard from "../pages/AdminDashboard";
import EmployeeChat from "../pages/EmployeeChat";

export default function AppRouter() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Tất cả route con render bên trong Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />

          {/* Auth / Account */}
          <Route path="/account" element={<Account />} />
          {/* Trang danh mục */}
          <Route path="/bai-viet" element={<BaiViet />} />
          <Route path="/ban-chay" element={<BanChay />} />
          <Route path="/hang-moi" element={<HangMoi />} />
          <Route path="/dich-vu" element={<DichVu />} />
          <Route path="/khuyen-mai" element={<KhuyenMai />} />
          <Route path="/search" element={<SearchResults />} />

          {/* Chi tiết */}
          <Route path="/san-pham/:id" element={<ProductDetail />} />
          <Route path="/bai-viet/:id" element={<BaiVietDetail />} />
          <Route path="/dat-lich" element={<DatLich />} />
          <Route path="/booking" element={<DatLich />} />
          <Route path="/thuoc" element={<Thuoc />} />
          <Route path="/flash-sale" element={<FlashSale />} />
          <Route path="/gio-hang" element={<GioHang />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>

        {/* Admin & Employee routes - không dùng Layout chung */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/employee/chat" element={<EmployeeChat />} />
      </Routes>
    </BrowserRouter>
  );
}
