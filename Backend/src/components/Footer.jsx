// src/components/Footer.jsx
export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        {/* Main Footer Content */}
        <div className="footer__main">
          {/* Company Info */}
          <div className="footer__col footer__col--company">
            <div className="logo logo--footer">
              Hiệu thuốc Việt
            </div>
            <p className="footer__description">
              Sức khoẻ cho mọi nhà. Tư vấn dược sĩ 24/7. Chúng tôi cam kết mang
              đến những sản phẩm chất lượng và dịch vụ chăm sóc sức khỏe tốt
              nhất.
            </p>
            <div className="footer__social">
              <h5>Kết nối với chúng tôi</h5>
              <div className="footer__social-links">
                <a
                  href="#"
                  className="footer__social-link"
                  aria-label="Facebook"
                >
                  <i className="ri-facebook-fill"></i>
                </a>
                <a
                  href="#"
                  className="footer__social-link"
                  aria-label="Instagram"
                >
                  <i className="ri-instagram-fill"></i>
                </a>
                <a href="#" className="footer__social-link" aria-label="Zalo">
                  <i className="ri-messenger-fill"></i>
                </a>
                <a
                  href="#"
                  className="footer__social-link"
                  aria-label="YouTube"
                >
                  <i className="ri-youtube-fill"></i>
                </a>
                <a href="#" className="footer__social-link" aria-label="TikTok">
                  <i className="ri-tiktok-fill"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer__col">
            <h4 className="footer__title">Về Hiệu thuốc Việt</h4>
            <ul className="footer__links">
              <li>
                <a href="#" className="footer__link">
                  <i className="ri-arrow-right-s-line"></i>
                  Giới thiệu
                </a>
              </li>
              <li>
                <a href="#" className="footer__link">
                  <i className="ri-arrow-right-s-line"></i>
                  Tuyển dụng
                </a>
              </li>
              <li>
                <a href="#" className="footer__link">
                  <i className="ri-arrow-right-s-line"></i>
                  Hệ thống cửa hàng
                </a>
              </li>
              <li>
                <a href="#" className="footer__link">
                  <i className="ri-arrow-right-s-line"></i>
                  Tin tức & Sự kiện
                </a>
              </li>
              <li>
                <a href="#" className="footer__link">
                  <i className="ri-arrow-right-s-line"></i>
                  Chương trình khách hàng thân thiết
                </a>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div className="footer__col">
            <h4 className="footer__title">Hỗ trợ khách hàng</h4>
            <ul className="footer__links">
              <li>
                <a href="#" className="footer__link">
                  <i className="ri-arrow-right-s-line"></i>
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a href="#" className="footer__link">
                  <i className="ri-arrow-right-s-line"></i>
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a href="#" className="footer__link">
                  <i className="ri-arrow-right-s-line"></i>
                  Chính sách giao hàng
                </a>
              </li>
              <li>
                <a href="#" className="footer__link">
                  <i className="ri-arrow-right-s-line"></i>
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a href="#" className="footer__link">
                  <i className="ri-arrow-right-s-line"></i>
                  Hướng dẫn đặt hàng
                </a>
              </li>
              <li>
                <a href="#" className="footer__link">
                  <i className="ri-arrow-right-s-line"></i>
                  Tra cứu đơn hàng
                </a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer__col">
            <h4 className="footer__title">Liên hệ</h4>
            <ul className="footer__contact">
              <li className="footer__contact-item">
                <i className="ri-phone-line"></i>
                <div>
                  <strong>Hotline:</strong>
                  <a href="tel:18006821" className="footer__contact-link">
                    1800 6821
                  </a>
                  <span className="footer__contact-note">(Miễn phí 24/7)</span>
                </div>
              </li>
              <li className="footer__contact-item">
                <i className="ri-mail-line"></i>
                <div>
                  <strong>Email:</strong>
                  <a
                    href="mailto:support@hieuthuocviet.vn"
                    className="footer__contact-link"
                  >
                    support@hieuthuocviet.vn
                  </a>
                </div>
              </li>
              <li className="footer__contact-item">
                <i className="ri-map-pin-line"></i>
                <div>
                  <strong>Địa chỉ:</strong>
                  <span>254 Nguyễn Văn Linh, Quận Hải Châu, TP. Đà Nẵng</span>
                </div>
              </li>
              <li className="footer__contact-item">
                <i className="ri-time-line"></i>
                <div>
                  <strong>Giờ làm việc:</strong>
                  <span>Thứ 2 - Chủ nhật: 7:00 - 22:00</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment Methods & Certifications */}
        <div className="footer__payment">
          <div className="footer__payment-section">
            <h5 className="footer__payment-title">Phương thức thanh toán</h5>
            <div className="footer__payment-methods">
              <div className="footer__payment-item">
                <i className="ri-bank-card-line"></i>
                <span>Thẻ tín dụng</span>
              </div>
              <div className="footer__payment-item">
                <i className="ri-wallet-3-line"></i>
                <span>Ví điện tử</span>
              </div>
              <div className="footer__payment-item">
                <i className="ri-qr-code-line"></i>
                <span>QR Code</span>
              </div>
              <div className="footer__payment-item">
                <i className="ri-money-dollar-circle-line"></i>
                <span>Tiền mặt</span>
              </div>
              <div className="footer__payment-item">
                <i className="ri-bank-line"></i>
                <span>Chuyển khoản</span>
              </div>
            </div>
          </div>
          <div className="footer__payment-section">
            <h5 className="footer__payment-title">Chứng nhận</h5>
            <div className="footer__certifications">
              <div className="footer__cert-item">
                <i className="ri-shield-check-line"></i>
                <span>Đã được Bộ Y tế cấp phép</span>
              </div>
              <div className="footer__cert-item">
                <i className="ri-award-line"></i>
                <span>ISO 9001:2015</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="footer__divider"></div>

        {/* Copyright */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            © 2025 <strong>Hiệu thuốc Việt</strong>. Tất cả quyền được bảo lưu.
          </p>
          <div className="footer__legal">
            <a href="#" className="footer__legal-link">
              Điều khoản sử dụng
            </a>
            <span className="footer__legal-separator">|</span>
            <a href="#" className="footer__legal-link">
              Chính sách bảo mật
            </a>
            <span className="footer__legal-separator">|</span>
            <a href="#" className="footer__legal-link">
              Giấy phép kinh doanh
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
