// src/pages/DichVu.jsx
import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "../assets/css/dichvu.css";

/** DỮ LIỆU CỤC BỘ (mock) */
const SERVICES = [
  {
    id: "sv-1",
    name: "Đo huyết áp – tư vấn tim mạch",
    desc: "Đo huyết áp chuẩn – tư vấn nhanh 1:1 cùng dược sĩ.",
    price: "Miễn phí",
    duration: "10–15 phút",
    icon: "ri-heart-pulse-line",
  },
  {
    id: "sv-2",
    name: "Đo đường huyết – HbA1c",
    desc: "Theo dõi đường huyết định kỳ và tư vấn chế độ ăn.",
    price: "49.000đ",
    duration: "15 phút",
    icon: "ri-drop-line",
  },
  {
    id: "sv-3",
    name: "Đo BMI – tư vấn dinh dưỡng",
    desc: "Đánh giá BMI, vòng eo – gợi ý thực đơn cá nhân.",
    price: "Miễn phí",
    duration: "10 phút",
    icon: "ri-body-scan-line",
  },
  {
    id: "sv-4",
    name: "Chăm sóc da – soi da",
    desc: "Soi da, đo ẩm – tư vấn routine phù hợp từng loại da.",
    price: "79.000đ",
    duration: "20 phút",
    icon: "ri-sparkling-2-line",
  },
  {
    id: "sv-5",
    name: "Tiêm ngừa (theo mùa)",
    desc: "Tư vấn, sàng lọc, ghi nhận hồ sơ tiêm chủng.",
    price: "Theo vắc-xin",
    duration: "20–30 phút",
    icon: "ri-shield-check-line",
  },
  {
    id: "sv-6",
    name: "Giao thuốc tận nhà 2h",
    desc: "Đặt thuốc online – ship nhanh 2 giờ nội thành.",
    price: "Từ 15.000đ",
    duration: "2h",
    icon: "ri-truck-line",
  },
];

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
  const [q, setQ] = useState("");
  const [chip, setChip] = useState(""); // "", "free", "lt50", "skin", "glucose"

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  // giả lập tải dữ liệu để hiện skeleton
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setServices(SERVICES);
      setLoading(false);
    }, 350);
    return () => clearTimeout(t);
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

  const filtered = services.filter((s) => {
    const hit = (s.name + s.desc).toLowerCase().includes(q.toLowerCase());
    const priceNum = parseInt(String(s.price).replace(/\D/g, "")) || 0;
    const byChip =
      chip === ""
        ? true
        : chip === "free"
        ? /miễn phí/i.test(s.price)
        : chip === "lt50"
        ? priceNum > 0 && priceNum <= 50000
        : chip === "skin"
        ? /da|soi da/i.test(s.name + s.desc)
        : chip === "glucose"
        ? /đường huyết|HbA1c/i.test(s.name + s.desc)
        : true;
    return hit && byChip;
  });

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
              Đo huyết áp, đường huyết, soi da, tư vấn dinh dưỡng &amp;giao thuốc trong 2 giờ. Đặt lịch ngay để được phục vụ tốt nhất.
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
            {services.slice(0, 3).map((s) => (
              <article className="mini-card" key={s.id}>
                <i className={s.icon}></i>
                <div>
                  <h3>{s.name}</h3>
                  <p>{s.desc}</p>
                </div>
                <span className="price">{s.price}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* LIST + SEARCH/FILTER */}
      <section className="sv-list container">
        <div className="sv-head" style={{ gap: 10 }}>
          <h2>Dịch vụ nổi bật</h2>

          <div
            style={{
              display: "flex",
              gap: 8,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <input
              className="sv-search"
              placeholder="Tìm dịch vụ…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              aria-label="Tìm dịch vụ"
            />
            <div className="sv-chips">
              {[
                ["", "Tất cả"],
                ["free", "Miễn phí"],
                ["lt50", "≤50k"],
                ["skin", "Soi da"],
                ["glucose", "Đường huyết"],
              ].map(([val, label]) => (
                <button
                  key={val}
                  className={`chip ${chip === val ? "active" : ""}`}
                  onClick={() => setChip(val)}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
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
        ) : filtered.length === 0 ? (
          <div className="sv-grid" ref={sliderRef} tabIndex={0}>
            <div className="empty">
              Không thấy dịch vụ phù hợp. Thử từ khóa khác?
            </div>
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
                  <span className="badge">{s.duration}</span>
                  <i className={s.icon}></i>
                </div>
                <div className="sv-card__body">
                  <h3 className="sv-title">{s.name}</h3>
                  <p className="sv-desc">{s.desc}</p>
                  <div className="sv-meta">
                    <span className="chip chip--soft">{s.price}</span>
                    <span className="dot">•</span>
                    <span className="muted">Ưu đãi khi đặt online</span>
                  </div>
                  <div className="sv-actions">
                    <Link className="btn" to={`/dat-lich?service=${s.id}`}>
                      Đặt lịch
                    </Link>
                    <button
                      className="btn btn--ghost"
                      onClick={() => toast(`Đã lưu: ${s.name}`)}
                    >
                      Thêm vào danh sách
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
            <span className="dot"></span>
            <div>
              <h4>1) Đặt lịch</h4>
              <p>
                Chọn dịch vụ &amp;thời gian phù hợp. Nhân viên sẽ xác nhận ngay.
              </p>
            </div>
          </li>
          <li>
            <span className="dot"></span>
            <div>
              <h4>2) Sàng lọc – chuẩn bị</h4>
              <p>
                Trao đổi tình trạng, tiền sử – chuẩn bị dụng cụ &amp;phòng đo.
              </p>
            </div>
          </li>
          <li>
            <span className="dot"></span>
            <div>
              <h4>3) Thực hiện – tư vấn</h4>
              <p>Thực hiện dịch vụ &amp;tư vấn cá nhân hóa theo kết quả.</p>
            </div>
          </li>
          <li>
            <span className="dot"></span>
            <div>
              <h4>4) Theo dõi sau dịch vụ</h4>
              <p>Gửi khuyến nghị qua SMS/Email – hẹn lịch tái kiểm tra.</p>
            </div>
          </li>
        </ol>
      </section>

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

      {/* FAQ */}
      <section className="sv-faq container">
        <h2>Câu hỏi thường gặp</h2>
        <details open>
          <summary>
            <i className="ri-question-line" />Có cần nhịn ăn khi đo đường huyết?
          </summary>
          <p>
            Nếu đo lúc đói để đánh giá fasting glucose, bạn nên nhịn ăn ít nhất
            8 giờ. HbA1c thì không cần.
          </p>
        </details>
        <details>
          <summary>
            <i className="ri-question-line" />Dịch vụ soi da có phù hợp cho da nhạy cảm?
          </summary>
          <p>
            Thiết bị soi da chỉ chụp/chiếu ánh sáng, không xâm lấn – an toàn cho
            mọi loại da.
          </p>
        </details>
        <details>
          <summary>
            <i className="ri-question-line" />Đặt lịch có hủy được không?
          </summary>
          <p>Bạn có thể hủy/đổi lịch miễn phí trước giờ hẹn 2 tiếng.</p>
        </details>
      </section>

      {/* CTA */}
      <section className="sv-cta">
        <div className="container cta-wrap">
          <div className="cta-copy">
            <h3>Bạn cần hỗ trợ chọn dịch vụ?</h3>
            <p>Dược sĩ trực 24/7 sẽ gọi lại trong 5 phút.</p>
          </div>
          <Link className="btn btn-big" to="/dat-lich">
            <i className="ri-phone-line" />Yêu cầu gọi lại
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
                Đóng
              </button>
            </header>
            <div className="sv-drawer__body">
              <p>{drawer.desc}</p>
              <ul className="sv-ul">
                <li>
                  <i className="ri-check-line" />Quy trình an toàn – chuẩn
                </li>
                <li>
                  <i className="ri-check-line" />Kết quả trong {drawer.duration}
                </li>
                <li>
                  <i className="ri-check-line" />Ưu đãi khi đặt online
                </li>
              </ul>
              <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                <Link
                  className="btn"
                  to={`/dat-lich?service=${drawer.id}`}
                  onClick={() => setDrawer(null)}
                >
                  Đặt lịch dịch vụ này
                </Link>
                <button
                  className="btn btn--ghost"
                  onClick={() => toast(`Đã lưu: ${drawer.name}`)}
                >
                  Lưu dịch vụ
                </button>
              </div>
            </div>
          </div>
        </aside>
      )}
    </main>
  );
}
