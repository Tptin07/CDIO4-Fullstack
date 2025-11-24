// src/layouts/Layout.jsx
import { Outlet } from "react-router-dom";
import Topbar from "../components/Topbar";
import Header from "../components/Header";
// Nếu bạn chưa có Footer, có thể comment dòng dưới
import Footer from "../components/Footer";
import FloatingButtons from "../components/FloatingButtons";

export default function Layout() {
  return (
    <div className="app-layout">
      <Topbar />
      <Header />
      <main className="app-main">
        <Outlet />
      </main>
      <Footer />
      <FloatingButtons />
    </div>
  );
}
