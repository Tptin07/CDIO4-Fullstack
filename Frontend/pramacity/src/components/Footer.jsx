// src/components/Footer.jsx
export default function Footer() {
  // Handler để force reload khi click vào link HTML
  const handleHtmlLinkClick = (e, href) => {
    e.preventDefault();
    window.location.href = href;
  };

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
                <a 
                  href="/html/gioi_thieu/gioithieu.html" 
                  className="footer__link"
                  onClick={(e) => handleHtmlLinkClick(e, '/html/gioi_thieu/gioithieu.html')}
                >
                  <i className="ri-arrow-right-s-line"></i>
                  Giới thiệu
                </a>
              </li>
              <li>
                <a 
                  href="/html/tuyen_dung/tuyendung.html" 
                  className="footer__link"
                  onClick={(e) => handleHtmlLinkClick(e, '/html/tuyen_dung/tuyendung.html')}
                >
                  <i className="ri-arrow-right-s-line"></i>
                  Tuyển dụng
                </a>
              </li>
              <li>
                <a 
                  href="/html/he_thong_cua_hang/hethongcuahang.html" 
                  className="footer__link"
                  onClick={(e) => handleHtmlLinkClick(e, '/html/he_thong_cua_hang/hethongcuahang.html')}
                >
                  <i className="ri-arrow-right-s-line"></i>
                  Hệ thống cửa hàng
                </a>
              </li>
              <li>
                <a 
                  href="/html/tin_tuc/tintuc.html" 
                  className="footer__link"
                  onClick={(e) => handleHtmlLinkClick(e, '/html/tin_tuc/tintuc.html')}
                >
                  <i className="ri-arrow-right-s-line"></i>
                  Tin tức & Sự kiện
                </a>
              </li>
              <li>
                <a 
                  href="/html/khach_hang_than_thiet/khachhangthanthiet.html" 
                  className="footer__link"
                  onClick={(e) => handleHtmlLinkClick(e, '/html/khach_hang_than_thiet/khachhangthanthiet.html')}
                >
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
                <a 
                  href="/html/cau_hoi_thuong_gap/cauhoithuonggap.html" 
                  className="footer__link"
                  onClick={(e) => handleHtmlLinkClick(e, '/html/cau_hoi_thuong_gap/cauhoithuonggap.html')}
                >
                  <i className="ri-arrow-right-s-line"></i>
                  Câu hỏi thường gặp
                </a>
              </li>
              <li>
                <a 
                  href="/html/doi_tra/doitra.html" 
                  className="footer__link"
                  onClick={(e) => handleHtmlLinkClick(e, '/html/doi_tra/doitra.html')}
                >
                  <i className="ri-arrow-right-s-line"></i>
                  Chính sách đổi trả
                </a>
              </li>
              <li>
                <a 
                  href="/html/giao_hang/giaohang.html" 
                  className="footer__link"
                  onClick={(e) => handleHtmlLinkClick(e, '/html/giao_hang/giaohang.html')}
                >
                  <i className="ri-arrow-right-s-line"></i>
                  Chính sách giao hàng
                </a>
              </li>
              <li>
                <a 
                  href="/html/bao_mat/baomat.html" 
                  className="footer__link"
                  onClick={(e) => handleHtmlLinkClick(e, '/html/bao_mat/baomat.html')}
                >
                  <i className="ri-arrow-right-s-line"></i>
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a 
                  href="/html/huong_dan_dat_hang/huongdandathang.html" 
                  className="footer__link"
                  onClick={(e) => handleHtmlLinkClick(e, '/html/huong_dan_dat_hang/huongdandathang.html')}
                >
                  <i className="ri-arrow-right-s-line"></i>
                  Hướng dẫn đặt hàng
                </a>
              </li>
              <li>
                <a 
                  href="/html/tra_cuu_don_hang/tracuudonhang.html" 
                  className="footer__link"
                  onClick={(e) => handleHtmlLinkClick(e, '/html/tra_cuu_don_hang/tracuudonhang.html')}
                >
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
            <div style={{ marginTop: '1rem' }}>
              <a 
                href="/html/lien_he/lienhe.html" 
                className="footer__link"
                onClick={(e) => handleHtmlLinkClick(e, '/html/lien_he/lienhe.html')}
              >
                <i className="ri-arrow-right-s-line"></i>
                Trang liên hệ
              </a>
            </div>
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
            <a 
              href="/html/dieu_khoan/dieukhoan.html" 
              className="footer__legal-link"
              onClick={(e) => handleHtmlLinkClick(e, '/html/dieu_khoan/dieukhoan.html')}
            >
              Điều khoản sử dụng
            </a>
            <span className="footer__legal-separator">|</span>
            <a 
              href="/html/bao_mat/baomat.html" 
              className="footer__legal-link"
              onClick={(e) => handleHtmlLinkClick(e, '/html/bao_mat/baomat.html')}
            >
              Chính sách bảo mật
            </a>
            <span className="footer__legal-separator">|</span>
            <a 
              href="/html/giay_phep/giayphep.html" 
              className="footer__legal-link"
              onClick={(e) => handleHtmlLinkClick(e, '/html/giay_phep/giayphep.html')}
            >
              Giấy phép kinh doanh
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
