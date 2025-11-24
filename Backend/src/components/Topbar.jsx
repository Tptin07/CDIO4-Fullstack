// src/components/Topbar.jsx
import { Link } from "react-router-dom";

export default function Topbar() {
  return (
    <div className="topbar">
      <div className="container topbar__wrap">
        {/* Bên trái - Thông tin khuyến mãi */}
        <div className="topbar__left">
          <div className="topbar__promo">
            <i className="ri-gift-line"></i>
            <span>
              Miễn phí vận chuyển cho đơn hàng từ <strong>300.000đ</strong>
            </span>
          </div>
        </div>

        {/* Bên phải - Thông tin hỗ trợ */}
        <div className="topbar__right">
          <a href="tel:18006821" className="topbar__link">
            <i className="ri-phone-line"></i>
            <span>Hotline: <strong>1800 6821</strong></span>
          </a>

          <Link to="/dich-vu" className="topbar__link">
            <i className="ri-customer-service-2-line"></i>
            <span>Tư vấn trực tuyến</span>
          </Link>

          <a
            href="#"
            className="topbar__link"
            onClick={(e) => {
              e.preventDefault();
              // Có thể mở modal tải app
            }}
          >
            <i className="ri-smartphone-line"></i>
            <span>Tải ứng dụng</span>
          </a>
        </div>
      </div>
    </div>
  );
}
