// src/pages/DichVu.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../assets/css/dichvu.css";
import { getServices } from "../services/services";

// Dữ liệu mẫu cho hình ảnh, bác sĩ và thành tựu
const SERVICE_EXTRAS = {
  1: {
    imageUrl:
      "https://cdn.tgdd.vn/Files/2020/03/28/1245063/huong-dan-cach-doc-chi-so-huyet-ap-tren-may-do-chu-2.jpg",
    doctors: [
      {
        name: "BS. Nguyễn Văn An",
        specialty: "Tim mạch",
        experience: "15 năm",
        avatar: "👨‍⚕️",
      },
      {
        name: "BS. Trần Thị Bích",
        specialty: "Nội tiết",
        experience: "12 năm",
        avatar: "👩‍⚕️",
      },
    ],
    achievements: [
      { label: "Khách hàng phục vụ", value: "10,000+", icon: "👥" },
      { label: "Độ hài lòng", value: "98%", icon: "⭐" },
      { label: "Năm kinh nghiệm", value: "10+", icon: "🏆" },
    ],
  },
  2: {
    imageUrl:
      "https://medlatec.vn/media/9162/content/20210929_cac-buoc-can-lam-de-co-ket-qua-xet-nghiem-duong-huyet-chinh-xac-3.jpg",
    doctors: [
      {
        name: "BS. Hồ Khoa Anh Minh",
        specialty: "Da liễu",
        experience: "10 năm",
        avatar: "👨‍⚕️",
      },
    ],
    achievements: [
      { label: "Khách hàng phục vụ", value: "8,500+", icon: "👥" },
      { label: "Độ hài lòng", value: "97%", icon: "⭐" },
      { label: "Năm kinh nghiệm", value: "8+", icon: "🏆" },
    ],
  },

  3: {
    imageUrl:
      "https://suckhoedoisong.qltns.mediacdn.vn/324455921873985536/2023/11/13/thuc-pham-giau-dinh-duong-16998602137921190790075.jpg",
    doctors: [
      {
        name: "BS. Phan Quang Đính",
        specialty: "Dinh dưỡng, tăng trưởng",
        experience: "10 năm",
        avatar: "👨‍⚕️",
      },
    ],
    achievements: [
      { label: "Khách hàng phục vụ", value: "8,500+", icon: "👥" },
      { label: "Độ hài lòng", value: "97%", icon: "⭐" },
      { label: "Năm kinh nghiệm", value: "8+", icon: "🏆" },
    ],
  },
  4: {
    imageUrl:
      "https://thanhnien.mediacdn.vn/uploaded/quochung.qc/2018_08_28/MH1/2_RNPT.jpg?width=500",
    doctors: [
      {
        name: "BS. Hồ Quốc Khanh",
        specialty: "Da liễu",
        experience: "10 năm",
        avatar: "👨‍⚕️",
      },
    ],
    achievements: [
      { label: "Khách hàng phục vụ", value: "8,500+", icon: "👥" },
      { label: "Độ hài lòng", value: "97%", icon: "⭐" },
      { label: "Năm kinh nghiệm", value: "8+", icon: "🏆" },
    ],
  },
};

function toast(msg) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const t = document.createElement("div");
  t.className = "toast-item";
  t.textContent = msg;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 2200);
}

export default function DichVu() {
  const sliderRef = useRef(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(true);

  const [drawer, setDrawer] = useState(null);

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function fetchServices() {
      setLoading(true);
      setError("");
      try {
        const data = await getServices();
        if (active) setServices(data);
      } catch (err) {
        if (active) {
          setError(err.message || "Không thể tải danh sách dịch vụ");
        }
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchServices();
    return () => {
      active = false;
    };
  }, []);

  const slide = (dx) =>
    sliderRef.current?.scrollBy({ left: dx, behavior: "smooth" });
  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const update = () => {
      const { scrollLeft, scrollWidth, clientWidth } = el;
      setCanLeft(scrollLeft > 2);
      setCanRight(scrollLeft + clientWidth < scrollWidth - 2);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute("href").slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const y = target.getBoundingClientRect().top + window.scrollY - 8;
      window.scrollTo({ top: y, behavior: "smooth" });
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  useEffect(() => {
    const el = sliderRef.current;
    if (!el) return;
    const onKey = (e) => {
      if (["ArrowLeft", "ArrowRight"].includes(e.key)) {
        e.preventDefault();
        slide(e.key === "ArrowLeft" ? -320 : 320);
      }
    };
    el.addEventListener("keydown", onKey);
    return () => el.removeEventListener("keydown", onKey);
  }, []);

  const filtered = services;

  const arrowStyle = (disabled) =>
    disabled
      ? { opacity: 0.4, cursor: "not-allowed", filter: "grayscale(.4)" }
      : undefined;

  return (
    <main className="lc services">
      {/* HERO */}
      <section className="sv-hero">
        <div className="container">
          <div className="hero-copy">
            <h1>
              Chăm sóc <span>sức khỏe</span> từ những việc nhỏ
            </h1>
            <p>
              Đo huyết áp, đường huyết, soi da, tư vấn dinh dưỡng &amp;giao
              thuốc trong 2 giờ. Đặt lịch ngay để được phục vụ tốt nhất.
            </p>
            <div className="hero-cta">
              <a className="btn" href="#bang-gia">
                Xem bảng giá
              </a>
              <a className="btn btn--ghost" href="#quy-trinh">
                Quy trình
              </a>
            </div>
          </div>

          <div className="hero-cards">
            {(loading ? Array.from({ length: 3 }) : services.slice(0, 3)).map(
              (s, idx) => (
                <article className="mini-card" key={s?.id || idx}>
                  <i className={s?.icon || "ri-health-book-line"}></i>
                  <div>
                    <h3>{s?.name || "Đang cập nhật"}</h3>
                    <p>{s?.description || "Đang cập nhật mô tả dịch vụ"}</p>
                  </div>
                  <span className="price">{s?.price || "—"}</span>
                </article>
              )
            )}
          </div>
        </div>
      </section>

      {/* LIST + SEARCH/FILTER */}
      <section className="sv-list container">
        <div className="sv-head">
          <h2>Dịch vụ nổi bật</h2>
          {error && (
            <span className="sv-error" role="alert">
              {error}
            </span>
          )}
          <div className="arrows">
            <button
              className="arrow"
              onClick={() => slide(-320)}
              disabled={!canLeft}
              aria-disabled={!canLeft}
              title={canLeft ? "Cuộn trái" : "Đang ở đầu"}
              style={arrowStyle(!canLeft)}
            >
              <i className="ri-arrow-left-s-line" />
            </button>
            <button
              className="arrow"
              onClick={() => slide(320)}
              disabled={!canRight}
              aria-disabled={!canRight}
              title={canRight ? "Cuộn phải" : "Đang ở cuối"}
              style={arrowStyle(!canRight)}
            >
              <i className="ri-arrow-right-s-line" />
            </button>
          </div>
        </div>

        {/* GRID */}
        {loading ? (
          <div
            className="sv-grid"
            aria-busy="true"
            ref={sliderRef}
            tabIndex={0}
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="sv-card skel">
                <div className="sv-card__media skel-bar" />
                <div className="sv-card__body">
                  <div className="skel-line" />
                  <div className="skel-line short" />
                  <div className="skel-chip" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="sv-grid" ref={sliderRef} tabIndex={0}>
            {filtered.map((s) => (
              <article
                className="sv-card"
                key={s.id}
                onClick={(e) => {
                  if (e.target.closest(".sv-actions")) return;
                  setDrawer(s);
                }}
              >
                <div className="sv-card__media">
                  {SERVICE_EXTRAS[s.id]?.imageUrl ? (
                    <img
                      src={SERVICE_EXTRAS[s.id].imageUrl}
                      alt={s.name}
                      className="sv-card__image"
                    />
                  ) : (
                    <i className={s.icon}></i>
                  )}
                  {SERVICE_EXTRAS[s.id]?.imageUrl && (
                    <div className="image-badge">
                      <i className="ri-image-line" />
                    </div>
                  )}
                  <span className="badge">{s.duration}</span>
                </div>
                <div className="sv-card__body">
                  <h3 className="sv-title">{s.name}</h3>
                  <p className="sv-desc">
                    {s.description || "Đang cập nhật mô tả"}
                  </p>
                  {SERVICE_EXTRAS[s.id]?.doctors && (
                    <div className="sv-card__doctors-preview">
                      <i className="ri-user-star-line" />
                      <span>
                        {SERVICE_EXTRAS[s.id].doctors.length} bác sĩ chuyên khoa
                      </span>
                    </div>
                  )}
                  <div className="sv-meta">
                    <span className="chip chip--soft">{s.price}</span>
                    <span className="dot">•</span>
                    <span className="muted">Ưu đãi khi đặt online</span>
                  </div>
                  <div className="sv-actions">
                    <Link className="btn" to={`/dat-lich?service=${s.id}`}>
                      <i className="ri-calendar-line" /> Đặt lịch
                    </Link>
                    <button
                      className="btn btn--ghost"
                      onClick={() => toast(`Đã lưu: ${s.name}`)}
                    >
                      <i className="ri-bookmark-line" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* TIMELINE */}
      <section id="quy-trinh" className="sv-steps container">
        <h2>Quy trình thực hiện</h2>
        <ol className="steps">
          <li>
            <div>
              <h4>Đặt lịch</h4>
              <p>
                Chọn dịch vụ và thời gian phù hợp. Nhân viên sẽ xác nhận ngay.
              </p>
            </div>
          </li>
          <li>
            <div>
              <h4>Sàng lọc – chuẩn bị</h4>
              <p>Trao đổi tình trạng, tiền sử và chuẩn bị dụng cụ, phòng đo.</p>
            </div>
          </li>
          <li>
            <div>
              <h4>Thực hiện – tư vấn</h4>
              <p>Thực hiện dịch vụ và tư vấn cá nhân hóa theo kết quả.</p>
            </div>
          </li>
          <li>
            <div>
              <h4>Theo dõi sau dịch vụ</h4>
              <p>Gửi khuyến nghị qua SMS/Email và hẹn lịch tái kiểm tra.</p>
            </div>
          </li>
        </ol>
      </section>

      <br></br>

      {/* PRICING */}
      <section id="bang-gia" className="sv-pricing container">
        <h2>Bảng giá nhanh</h2>
        <div className="price-grid">
          {services.map((s) => (
            <div className="price-card" key={s.id}>
              <div className="pc-top">
                <i className={s.icon}></i>
                <h3>{s.name}</h3>
              </div>
              <div className="pc-mid">
                <div className="tag">{s.duration}</div>
                <div className="money">{s.price}</div>
              </div>
              <Link className="btn block" to={`/dat-lich?service=${s.id}`}>
                Đặt lịch ngay
              </Link>
            </div>
          ))}
        </div>
      </section>
      <br></br>
      {/* FAQ */}
      <section className="sv-faq container">
        <h2>Câu hỏi thường gặp</h2>
        <details>
          <summary>
            <i className="ri-question-line" />
            Có cần nhịn ăn khi đo đường huyết?
          </summary>
          <p>
            Nếu đo lúc đói để đánh giá fasting glucose, bạn nên nhịn ăn ít nhất
            8 giờ. HbA1c thì không cần.
          </p>
        </details>
        <details>
          <summary>
            <i className="ri-question-line" />
            Dịch vụ soi da có phù hợp cho da nhạy cảm?
          </summary>
          <p>
            Thiết bị soi da chỉ chụp/chiếu ánh sáng, không xâm lấn – an toàn cho
            mọi loại da.
          </p>
        </details>
        <details>
          <summary>
            <i className="ri-question-line" />
            Đặt lịch có hủy được không?
          </summary>
          <p>Bạn có thể hủy/đổi lịch miễn phí trước giờ hẹn 2 tiếng.</p>
        </details>
      </section>

      {/* CTA */}
      <section className="sv-cta">
        <div className="cta-wrap">
          <div className="cta-copy">
            <h3>Bạn cần hỗ trợ chọn dịch vụ?</h3>
            <p>Dược sĩ trực 24/7 sẽ gọi lại trong 5 phút.</p>
          </div>
          <Link className="btn btn-big" to="/dat-lich">
            <i className="ri-phone-line" />
            Yêu cầu gọi lại
          </Link>
        </div>
      </section>

      {/* DRAWER chi tiết */}
      {drawer && (
        <aside
          className="sv-drawer"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDrawer(null);
          }}
        >
          <div className="sv-drawer__panel">
            <header>
              <h3>
                <i className={drawer.icon} style={{ marginRight: 8 }} />
                {drawer.name}
              </h3>
              <button
                className="btn btn--ghost"
                onClick={() => setDrawer(null)}
              >
                <i className="ri-close-line" /> Đóng
              </button>
            </header>
            <div className="sv-drawer__body">
              <p className="sv-drawer__desc">
                {drawer.description || "Đang cập nhật mô tả"}
              </p>

              {/* Hình ảnh giới thiệu */}
              {SERVICE_EXTRAS[drawer.id]?.imageUrl && (
                <div className="sv-drawer__image">
                  <h4>
                    <i className="ri-image-line" /> Hình ảnh giới thiệu
                  </h4>
                  <div className="image-wrapper">
                    <img
                      src={SERVICE_EXTRAS[drawer.id].imageUrl}
                      alt={`Hình ảnh giới thiệu ${drawer.name}`}
                      className="service-image"
                    />
                  </div>
                </div>
              )}

              {/* Thông tin bác sĩ */}
              {SERVICE_EXTRAS[drawer.id]?.doctors && (
                <div className="sv-drawer__doctors">
                  <h4>
                    <i className="ri-user-star-line" /> Đội ngũ bác sĩ
                  </h4>
                  <div className="doctors-grid">
                    {SERVICE_EXTRAS[drawer.id].doctors.map((doctor, idx) => (
                      <div key={idx} className="doctor-card">
                        <div className="doctor-avatar">{doctor.avatar}</div>
                        <div className="doctor-info">
                          <h5>{doctor.name}</h5>
                          <p className="doctor-specialty">{doctor.specialty}</p>
                          <p className="doctor-exp">
                            <i className="ri-time-line" /> {doctor.experience}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Thành tựu */}
              {SERVICE_EXTRAS[drawer.id]?.achievements && (
                <div className="sv-drawer__achievements">
                  <h4>
                    <i className="ri-trophy-line" /> Thành tựu dịch vụ
                  </h4>
                  <div className="achievements-grid">
                    {SERVICE_EXTRAS[drawer.id].achievements.map((ach, idx) => (
                      <div key={idx} className="achievement-item">
                        <div className="achievement-icon">{ach.icon}</div>
                        <div className="achievement-value">{ach.value}</div>
                        <div className="achievement-label">{ach.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <ul className="sv-ul">
                <li>
                  <i className="ri-check-line" />
                  Quy trình an toàn – chuẩn
                </li>
                <li>
                  <i className="ri-check-line" />
                  Kết quả trong {drawer.duration}
                </li>
                <li>
                  <i className="ri-check-line" />
                  Ưu đãi khi đặt online
                </li>
              </ul>
              <div className="sv-drawer__actions">
                <Link
                  className="btn"
                  to={`/dat-lich?service=${drawer.id}`}
                  onClick={() => setDrawer(null)}
                >
                  <i className="ri-calendar-line" /> Đặt lịch dịch vụ này
                </Link>
                <button
                  className="btn btn--ghost"
                  onClick={() => toast(`Đã lưu: ${drawer.name}`)}
                >
                  <i className="ri-bookmark-line" /> Lưu dịch vụ
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </main>
  );
}
