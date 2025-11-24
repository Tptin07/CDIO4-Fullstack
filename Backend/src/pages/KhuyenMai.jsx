import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import "../assets/css/khuyenmai.css";
import "../assets/css/thuoc.css";
import QuickViewModal from "../components/QuickViewModal";
import { addToCart } from "../services/products";
import { getProducts } from "../services/productApi";

/* ===== Data ===== */
// CATS sẽ được load từ API

const DEALS = [
  {
    id: "d1",
    title: "Giảm 30% – Chăm sóc da mùa lễ",
    desc: "Áp dụng cho sữa rửa mặt, kem dưỡng, serum. Tối đa 100k.",
    code: "SKIN30",
    cat: "Chăm sóc da",
    cover: "/khuyenmai/chamsoda.png",
    startsAt: addH(0),
    endsAt: addD(3),
    limit: 500,
    used: 210,
  },
  {
    id: "d2",
    title: "Mua 2 tặng 1 – Vitamin tổng hợp",
    desc: "Áp dụng size 60v & 120v. Tối đa 2 combo/khách.",
    code: "VITA21",
    cat: "Dinh dưỡng",
    cover: "/khuyenmai/VitaminC.png",
    startsAt: addH(12),
    endsAt: addD(4),
    limit: 300,
    used: 0,
  },
  {
    id: "d3",
    title: "Flash Sale 49k – Nhiệt kế điện tử",
    desc: "Số lượng có hạn, mỗi khách tối đa 1 sản phẩm.",
    code: "THERMO49",
    cat: "Thiết bị y tế",
    cover: "/khuyenmai/nhietketdientu.png",
    startsAt: addH(-8),
    endsAt: addH(10),
    limit: 200,
    used: 156,
  },
  {
    id: "d4",
    title: "Giảm 20% – Thuốc cảm cúm OTC",
    desc: "Không áp dụng cho thuốc kê đơn. Tối đa 50k.",
    code: "OTC20",
    cat: "Thuốc không kê đơn",
    cover: "/khuyenmai/panadol.png",
    startsAt: addD(-6),
    endsAt: addD(-1),
    limit: 400,
    used: 400,
  },
  {
    id: "d5",
    title: "Deal Hot – Máy đo huyết áp giảm 35%",
    desc: "Giá chỉ 385k, số lượng có hạn, Freeship toàn quốc.",
    code: "BP35",
    cat: "Thiết bị y tế",
    cover: "/khuyenmai/maydohuyetam.png",
    startsAt: addH(-3),
    endsAt: addH(18),
    limit: 250,
    used: 112,
  },
  {
    id: "d6",
    title: "Ưu đãi 40% – Dầu gội dược liệu thảo mộc",
    desc: "Chăm sóc tóc khỏe mạnh, hương thơm tự nhiên.",
    code: "HAIR40",
    cat: "Chăm sóc da",
    cover: "/khuyenmai/daugoi.png",
    startsAt: addH(-5),
    endsAt: addH(12),
    limit: 350,
    used: 146,
  },
];

const BANNERS = [
  {
    id: "b1",
    title: "Mega Sale 11.11",
    sub: "Giảm đến 49% + Freeship 2h",
    img: "/khuyenmai/Mega-Sale.png",
    icon: "/khuyenmai/VitaminC.png",
    badge: "HOT HÔM NAY",
    color: "pink",
  },
  {
    id: "b2",
    title: "Vitamin & Dinh dưỡng",
    sub: "Mua 2 tặng 1 – Sức khỏe cả nhà",
    img: "/khuyenmai/VitaminC.png",
    icon: "/khuyenmai/VitaminC.png",
    badge: "VITAMIN",
    color: "mint",
  },
  {
    id: "b3",
    title: "Thiết bị y tế gia đình",
    sub: "Ưu đãi nhiệt kế, máy đo huyết áp",
    img: "/khuyenmai/banner-ThietBiYTe.png",
    icon: "/khuyenmai/banner-ThietBiYTe.png",
    badge: "FLASH SALE",
    color: "indigo",
  },
];

// PRODUCTS sẽ được load từ API

/* ===== Helpers ===== */
function addH(h) {
  const d = new Date();
  d.setHours(d.getHours() + h);
  return d.toISOString();
}
function addD(dy) {
  const d = new Date();
  d.setDate(d.getDate() + dy);
  return d.toISOString();
}
function leftTime(endISO) {
  const diff = new Date(endISO) - new Date();
  if (diff <= 0) return "00:00:00";
  const h = Math.floor(diff / 36e5),
    m = Math.floor((diff % 36e5) / 6e4),
    s = Math.floor((diff % 6e4) / 1000);
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}
function formatVND(n) {
  return n.toLocaleString("vi-VN") + "đ";
}

const vnd = (n) => {
  if (n === null || n === undefined || isNaN(n)) {
    return "0đ";
  }
  return Number(n).toLocaleString("vi-VN") + "đ";
};

// Flash sale countdown timer helper
function getCountdown(startISO) {
  const diff = new Date(startISO) - new Date();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
  const hours = Math.floor(diff / 36e5);
  const minutes = Math.floor((diff % 36e5) / 6e4);
  const seconds = Math.floor((diff % 6e4) / 1000);
  return { hours, minutes, seconds };
}

/* ===== Page ===== */
export default function KhuyenMai() {
  const [tab, setTab] = useState("dangdienra");
  const [q, setQ] = useState("");
  const [saved, setSaved] = useState(
    () => new Set(JSON.parse(localStorage.getItem("savedDeals") || "[]"))
  );
  const [slide, setSlide] = useState(0);
  const [quick, setQuick] = useState(null);
  const [quickTab, setQuickTab] = useState("tong-quan");

  // Flash sale state
  const [flashSaleProducts, setFlashSaleProducts] = useState([]);
  const [flashSaleLoading, setFlashSaleLoading] = useState(true);
  const [countdown, setCountdown] = useState({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // Flash sale start time (set to 08:00 today or tomorrow)
  const flashSaleStartTime = useMemo(() => {
    const d = new Date();
    const now = new Date();
    d.setHours(8);
    d.setMinutes(0);
    d.setSeconds(0);
    d.setMilliseconds(0);
    // If 08:00 today has passed, set to 08:00 tomorrow
    if (d < now) {
      d.setDate(d.getDate() + 1);
    }
    return d.toISOString();
  }, []);

  // banner auto slide
  useEffect(() => {
    const id = setInterval(
      () => setSlide((s) => (s + 1) % BANNERS.length),
      5000
    );
    return () => clearInterval(id);
  }, []);

  // Load flash sale products
  useEffect(() => {
    async function loadFlashSaleProducts() {
      setFlashSaleLoading(true);
      try {
        const data = await getProducts({
          sort: "giam-gia",
          limit: 12,
        });
        if (data && Array.isArray(data.products)) {
          setFlashSaleProducts(data.products.slice(0, 6)); // Show first 6 products
        }
      } catch (err) {
        console.error("Error loading flash sale products:", err);
        setFlashSaleProducts([]);
      } finally {
        setFlashSaleLoading(false);
      }
    }
    loadFlashSaleProducts();
  }, []);

  // Countdown timer for flash sale
  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdown(flashSaleStartTime));
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [flashSaleStartTime]);

  // lọc deal (không phân trang)
  const filtered = useMemo(() => {
    const now = new Date();
    const byTab = (d) => {
      const s = new Date(d.startsAt),
        e = new Date(d.endsAt);
      if (tab === "dangdienra") return s <= now && e >= now;
      if (tab === "sapdienra") return s > now;
      return e < now;
    };
    const byQ = (d) =>
      (d.title + d.desc + d.code).toLowerCase().includes(q.toLowerCase());
    return DEALS.filter((d) => byTab(d) && byQ(d));
  }, [tab, q]);

  const saveCode = async (code) => {
    const next = new Set(saved);
    const isAdding = !next.has(code);
    isAdding ? next.add(code) : next.delete(code);
    setSaved(next);
    localStorage.setItem("savedDeals", JSON.stringify([...next]));

    // Copy mã vào clipboard khi lưu
    if (isAdding) {
      try {
        await navigator.clipboard.writeText(code);
      } catch (err) {
        // Fallback cho trình duyệt không hỗ trợ clipboard API
        const textArea = document.createElement("textarea");
        textArea.value = code;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.select();
        try {
          document.execCommand("copy");
        } catch (fallbackErr) {
          console.error("Could not copy code:", fallbackErr);
        }
        document.body.removeChild(textArea);
      }
    }
  };

  return (
    <>
      <main className="lc promo">
        {/* ===== Mega Banner + Ticker ===== */}
        <section className="mega-wrap">
          <div className="mega">
            {BANNERS.map((b, i) => (
              <article
                key={b.id}
                className={`slide ${i === slide ? "active" : ""}`}
                style={{ backgroundImage: `url(${b.img})` }}
              >
                <span className={`badge ${b.color}`}>{b.badge}</span>
                <h2>{b.title}</h2>
                <p>{b.sub}</p>
                <img className="slide-decor" src={b.icon} alt={b.title} />
                <div className="dots">
                  {BANNERS.map((_x, idx) => (
                    <button
                      key={idx}
                      className={idx === slide ? "on" : ""}
                      onClick={() => setSlide(idx)}
                    />
                  ))}
                </div>
              </article>
            ))}
          </div>

          <div className="ticker">
            <marquee scrollAmount="6">
              🔔 <b>Đang diễn ra:</b> Flash Sale 20:00 • Mã <b>SKIN30</b> giảm
              30% • Vitamin <b>Mua 2 Tặng 1</b> • Thiết bị y tế <b>đến 49%</b> —
              Săn nhanh kẻo hết!
            </marquee>
          </div>
        </section>

        {/* ===== FLASH SALE SECTION ===== */}
        <section className="flashsale-section">
          <div className="flashsale-container">
            {/* Flash Sale Banner */}
            <div className="flashsale-banner">
              <div className="flashsale-banner-left">
                <div className="flashsale-character">
                  <i className="ri-shopping-bag-3-line"></i>
                </div>
                <div className="flashsale-title">
                  <span className="flashsale-text">FLASHSALE</span>
                  <i className="ri-flashlight-line flashsale-icon"></i>
                  <span className="flashsale-text">GIÁ TỐT</span>
                </div>
              </div>
              <button className="flashsale-rules-btn">
                <i className="ri-coin-line"></i> Xem thể lệ{" "}
                <i className="ri-arrow-right-s-line"></i>
              </button>
            </div>

            {/* Flash Sale Info & Countdown */}
            <div className="flashsale-info">
              <div className="flashsale-time-range">
                08:00 - 22:00,{" "}
                {new Date().toLocaleDateString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                })}
              </div>
              <div className="flashsale-status">Sắp diễn ra</div>
              <div className="flashsale-countdown">
                <span className="countdown-label">Bắt đầu sau</span>
                <div className="countdown-timer">
                  <div className="countdown-box">
                    <span className="countdown-number">
                      {String(countdown.hours).padStart(2, "0")}
                    </span>
                    <span className="countdown-label-small">Giờ</span>
                  </div>
                  <span className="countdown-separator">:</span>
                  <div className="countdown-box">
                    <span className="countdown-number">
                      {String(countdown.minutes).padStart(2, "0")}
                    </span>
                    <span className="countdown-label-small">Phút</span>
                  </div>
                  <span className="countdown-separator">:</span>
                  <div className="countdown-box">
                    <span className="countdown-number">
                      {String(countdown.seconds).padStart(2, "0")}
                    </span>
                    <span className="countdown-label-small">Giây</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Flash Sale Products - Horizontal Scroll */}
            <div className="flashsale-products-wrapper">
              <div className="flashsale-products-scroll">
                {flashSaleLoading ? (
                  <div className="flashsale-loading">Đang tải sản phẩm...</div>
                ) : flashSaleProducts.length === 0 ? (
                  <div className="flashsale-empty">
                    Không có sản phẩm flash sale
                  </div>
                ) : (
                  flashSaleProducts.map((p) => (
                    <article
                      className="t-card flashsale-product-card"
                      key={p.id}
                    >
                      <div className="t-thumb">
                        <img
                          src={p.cover || p.img || "/img/placeholder.jpg"}
                          alt={p.name || "Sản phẩm"}
                          onError={(e) => {
                            e.currentTarget.src = "/img/placeholder.jpg";
                          }}
                        />
                        {p.discount > 0 && (
                          <span className="t-badge t-badge--sale">
                            -{p.discount}%
                          </span>
                        )}
                        {p.tag && (
                          <span className="t-badge t-badge--tag">{p.tag}</span>
                        )}
                      </div>

                      <div className="t-body">
                        <h3 className="t-title" title={p.name}>
                          <Link
                            to={`/san-pham/${p.id}`}
                            style={{
                              color: "inherit",
                              textDecoration: "none",
                              cursor: "pointer",
                            }}
                          >
                            {p.name}
                          </Link>
                        </h3>

                        <div className="t-price">
                          <b>{vnd(p.price)}</b>
                          {p.oldPrice && <s>{vnd(p.oldPrice)}</s>}
                        </div>

                        <div className="t-meta">
                          <span className="rate">
                            <i className="ri-star-fill" />{" "}
                            {(p.rating || 0).toFixed(1)}
                          </span>
                          <span className="sold">
                            Đã bán {(p.sold || 0).toLocaleString("vi-VN")}
                          </span>
                        </div>

                        <div className="t-actions">
                          <button
                            className="btn btn--buy flashsale-buy-btn"
                            onClick={() => {
                              try {
                                const cartProduct = {
                                  id: p.id,
                                  name: p.name,
                                  price: p.price,
                                  img: p.cover || p.img,
                                };
                                addToCart(cartProduct, 1);
                              } catch (err) {
                                // Error đã được xử lý trong addToCart
                              }
                            }}
                          >
                            <i className="ri-fire-line"></i> Mở bán giá sốc
                          </button>
                          <button
                            className="btn btn--ghost"
                            onClick={() => {
                              setQuickTab("tong-quan");
                              setQuick(p);
                            }}
                          >
                            <i className="ri-eye-line"></i> Xem chi tiết
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>

            {/* View All Link */}
            <div className="flashsale-view-all">
              <Link
                to="/flash-sale"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                Xem tất cả <i className="ri-arrow-right-s-line"></i>
              </Link>
            </div>
          </div>
        </section>

        {/* ===== SEARCH ===== */}
        <section className="promo-search">
          <div className="search-container">
            <div className="search-box">
              <i className="ri-search-line"></i>
              <input
                type="text"
                placeholder="Tìm mã khuyến mãi, sản phẩm, danh mục..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* ===== Tabs ===== */}
        <div className="kv-tabs">
          <button
            className={tab === "dangdienra" ? "active" : ""}
            onClick={() => setTab("dangdienra")}
          >
            <i className="ri-fire-line"></i> Đang diễn ra
          </button>
          <button
            className={tab === "sapdienra" ? "active" : ""}
            onClick={() => setTab("sapdienra")}
          >
            <i className="ri-timer-line"></i> Sắp diễn ra
          </button>
          <button
            className={tab === "daketthuc" ? "active" : ""}
            onClick={() => setTab("daketthuc")}
          >
            <i className="ri-flag-line"></i> Đã kết thúc
          </button>
        </div>

        {/* ===== Deals grid (không phân trang) ===== */}
        <section className="deals-section">
          <div className="deal-grid">
            {filtered.length === 0 ? (
              <div className="empty">
                Không có ưu đãi phù hợp • Thử từ khóa khác?
              </div>
            ) : (
              filtered.map((d) => {
                const pct = Math.min(100, Math.round((d.used / d.limit) * 100));
                const timeLeft = leftTime(d.endsAt);
                const ended = new Date(d.endsAt) < new Date();
                const soon = !ended && new Date(d.endsAt) - new Date() < 36e5;
                return (
                  <article
                    className={`deal-card ${ended ? "is-ended" : ""}`}
                    key={d.id}
                  >
                    <div
                      className="media"
                      style={{ backgroundImage: `url(${d.cover})` }}
                    >
                      <div className="media-grad"></div>
                      <span className="tag">{d.cat}</span>
                      {ended ? (
                        <span className="state end">KẾT THÚC</span>
                      ) : (
                        <span className={`state ${soon ? "soon" : "run"}`}>
                          {tab === "sapdienra" ? "SẮP DIỄN RA" : "ĐANG DIỄN RA"}
                        </span>
                      )}
                    </div>
                    <div className="body">
                      <h3>{d.title}</h3>
                      <p className="desc">{d.desc}</p>
                      <div className="meta">
                        <div className="progress">
                          <div>
                            <i className="ri-fire-fill"></i>
                            <div className="bar">
                              <span style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <small>{pct}% đã dùng</small>
                        </div>
                        <div className="timer">
                          <div>
                            <i className="ri-timer-2-line"></i>
                            <b>{ended ? "00:00:00" : timeLeft}</b>
                          </div>
                          <small>còn lại</small>
                        </div>
                      </div>
                      <div className="coupon">
                        <code>{d.code}</code>
                        <button
                          className={`btn ${saved.has(d.code) ? "saved" : ""}`}
                          onClick={() => saveCode(d.code)}
                        >
                          {saved.has(d.code) ? (
                            <>
                              <i className="ri-check-line"></i> Đã lưu
                            </>
                          ) : (
                            <>
                              <i className="ri-save-3-line"></i> Lưu mã
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </section>

        {/* ===== Note ===== */}
        <section className="promo-note">
          <details>
            <summary>
              <i className="ri-information-line"></i> Điều kiện & Lưu ý
            </summary>
            <ul>
              <li>Mỗi mã áp dụng 1 lần/khách, không cộng dồn với mã khác.</li>
              <li>Áp dụng cho đơn online tại hệ thống cửa hàng liên kết.</li>
              <li>Ưu đãi có thể kết thúc sớm khi hết ngân sách.</li>
            </ul>
          </details>
        </section>
      </main>

      {quick && (
        <QuickViewModal
          data={quick}
          initialTab={quickTab}
          onAdd={(product) => {
            try {
              addToCart(product, 1);
              setQuick(null);
            } catch (err) {
              // Error đã được xử lý trong addToCart
            }
          }}
          onClose={() => setQuick(null)}
        />
      )}
    </>
  );
}
