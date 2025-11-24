// src/pages/DatLich.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../assets/css/booking.css";

/** DỮ LIỆU CỤC BỘ (trùng với DichVu.jsx) */
const SERVICES = [
  {
    id: "sv-1",
    name: "Đo huyết áp – tư vấn tim mạch",
    price: "Miễn phí",
    duration: "10–15 phút",
    icon: "ri-heart-pulse-line",
  },
  {
    id: "sv-2",
    name: "Đo đường huyết – HbA1c",
    price: "49.000đ",
    duration: "15 phút",
    icon: "ri-drop-line",
  },
  {
    id: "sv-3",
    name: "Đo BMI – tư vấn dinh dưỡng",
    price: "Miễn phí",
    duration: "10 phút",
    icon: "ri-body-scan-line",
  },
  {
    id: "sv-4",
    name: "Chăm sóc da – soi da",
    price: "79.000đ",
    duration: "20 phút",
    icon: "ri-sparkling-2-line",
  },
  {
    id: "sv-5",
    name: "Tiêm ngừa (theo mùa)",
    price: "Theo vắc-xin",
    duration: "20–30 phút",
    icon: "ri-shield-check-line",
  },
  {
    id: "sv-6",
    name: "Giao thuốc tận nhà 2h",
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

export default function DatLich() {
  const [sp] = useSearchParams();
  const preselectId = sp.get("service") || "";
  const navigate = useNavigate();

  // data
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err] = useState("");

  // form state
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(preselectId);
  const [slot, setSlot] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  // giả lập fetch
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setServices(SERVICES);
      if (!preselectId && SERVICES.length) setServiceId(SERVICES[0].id);
      setLoading(false);
    }, 300);
    return () => clearTimeout(t);
  }, [preselectId]);

  const selected = useMemo(
    () => services.find((s) => s.id === serviceId),
    [services, serviceId]
  );

  // tạo slot 7 ngày tới (08:00–20:00 / 30’)
  const days = useMemo(() => {
    const res = [];
    const now = new Date();
    for (let d = 0; d < 7; d++) {
      const date = new Date(now);
      date.setDate(now.getDate() + d);
      const label = date.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });
      const items = [];
      for (let h = 8; h <= 20; h++) {
        for (let m of [0, 30]) {
          const t = new Date(date);
          t.setHours(h, m, 0, 0);
          if (d === 0 && t < now) continue;
          items.push({
            label: t.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            iso: t.toISOString().slice(0, 16),
          });
        }
      }
      res.push({ label, items });
    }
    return res;
  }, []);

  const canNextFromStep1 = !!(selected && slot);
  const canNextFromStep2 = !!(
    name.trim() && /^(0|\+84)\d{9,10}$/.test(phone.replaceAll(" ", ""))
  );

  const handleSubmit = async () => {
    if (!selected) return toast("Vui lòng chọn dịch vụ");
    if (!slot) return toast("Vui lòng chọn khung giờ");
    if (!canNextFromStep2) return toast("Điền họ tên và số điện thoại hợp lệ");

    try {
      setSubmitting(true);
      // LƯU LOCAL
      const key = "appointments";
      const curr = JSON.parse(localStorage.getItem(key) || "[]");
      const doc = {
        _id: crypto?.randomUUID?.() || Math.random().toString(36).slice(2),
        serviceId: selected.id,
        serviceName: selected.name,
        at: slot,
        name,
        phone,
        note,
        createdAt: new Date().toISOString(),
      };
      localStorage.setItem(key, JSON.stringify([doc, ...curr]));
      const code = doc._id.slice(-6).toUpperCase();
      setSuccess({ code, at: slot, serviceName: selected.name });
      toast("Đặt lịch thành công!");
    } catch (e) {
      console.error(e);
      toast("Có lỗi khi lưu. Thử lại!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="lc">
        <section className="bk-hero">
          <div className="skel skel-hero" />
        </section>
        <section className="bk-wrap">
          <div className="skel skel-card" />
          <div className="skel skel-card" />
        </section>
      </main>
    );
  }
  if (err) {
    return (
      <main className="lc">
        <section className="bk-wrap">
          <div className="error-box">
            <p>{err}</p>
          </div>
        </section>
      </main>
    );
  }

  if (success) {
    const dt = new Date(success.at);
    return (
      <main className="lc">
        <section className="bk-success">
          <div className="bk-s-card">
            <i className="ri-checkbox-circle-line"></i>
            <h2>Mã đặt lịch: {success.code}</h2>
            <p>
              {" "}
              Dịch vụ: <b>{success.serviceName}</b>
              <br /> Thời gian: <b>{dt.toLocaleString("vi-VN")}</b>{" "}
            </p>
            <div className="bk-s-actions">
              <button className="btn" onClick={() => navigate("/")}>
                Về trang chủ
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => navigate("/dat-lich")}
              >
                Đặt thêm lịch
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="lc">
      <section className="bk-hero">
        <div className="bk-hero-inner">
          <h1>
            Chăm sóc <span>sức khỏe</span> dễ dàng
          </h1>
          <p>
            Chọn dịch vụ bên dưới, chọn khung giờ và điền thông tin để xác nhận.
          </p>
        </div>
      </section>

      <section className="bk-wrap">
        <ol className="bk-steps">
          <li className={step >= 1 ? "active" : ""}>
            <span>1</span> Chọn dịch vụ & giờ
          </li>
          <li className={step >= 2 ? "active" : ""}>
            <span>2</span> Thông tin khách
          </li>
          <li className={step >= 3 ? "active" : ""}>
            <span>3</span> Xác nhận
          </li>
        </ol>

        {step === 1 && (
          <div className="bk-grid">
            <div className="bk-card">
              <h3>
                <i className="ri-list-check"></i> Chọn dịch vụ
              </h3>
              <div className="bk-services">
                {services.map((s) => (
                  <button
                    key={s.id}
                    className={`bk-service ${
                      serviceId === s.id ? "active" : ""
                    }`}
                    onClick={() => setServiceId(s.id)}
                  >
                    <i className={s.icon}></i>
                    <div>
                      <b>{s.name}</b>
                      <small>
                        {s.duration} • {s.price}
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="bk-card">
              <h3>
                <i className="ri-time-line"></i> Chọn khung giờ
              </h3>
              <div className="bk-days">
                {days.map((d, idx) => (
                  <details key={idx} open={idx === 0}>
                    <summary>{d.label}</summary>
                    <div className="bk-slots">
                      {d.items.map((t) => (
                        <button
                          key={t.iso}
                          className={`bk-slot ${
                            slot === t.iso ? "active" : ""
                          }`}
                          onClick={() => setSlot(t.iso)}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div className="bk-actions">
              <button
                className="btn"
                disabled={!canNextFromStep1}
                onClick={() => setStep(2)}
              >
                Tiếp tục
              </button>
              <button className="btn btn--ghost" onClick={() => navigate(-1)}>
                Hủy
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bk-grid">
            <div className="bk-card">
              <h3>
                <i className="ri-user-line"></i> Thông tin của bạn
              </h3>
              <div className="bk-form">
                <label>Họ và tên</label>
                <input
                  placeholder="Nguyễn Văn A"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <label>Số điện thoại</label>
                <input
                  placeholder="0912345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  inputMode="tel"
                />
                <label>Ghi chú (tuỳ chọn)</label>
                <textarea
                  rows={3}
                  placeholder="Thông tin thêm…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>

            <div className="bk-card bk-summary">
              <h3>
                <i className="ri-file-list-3-line"></i> Tóm tắt
              </h3>
              <ul>
                <li>
                  <span>Dịch vụ</span>
                  <b>{selected?.name || "—"}</b>
                </li>
                <li>
                  <span>Thời gian</span>
                  <b>{slot ? new Date(slot).toLocaleString("vi-VN") : "—"}</b>
                </li>
                <li>
                  <span>Giá</span>
                  <b>{selected?.price || "—"}</b>
                </li>
              </ul>
            </div>

            <div className="bk-actions">
              <button className="btn btn--ghost" onClick={() => setStep(1)}>
                Quay lại
              </button>
              <button
                className="btn"
                disabled={!canNextFromStep2}
                onClick={() => setStep(3)}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bk-grid">
            <div className="bk-card bk-confirm">
              <h3>
                <i className="ri-shield-check-line"></i> Xác nhận đặt lịch
              </h3>
              <p>Kiểm tra lại thông tin trước khi xác nhận.</p>
              <ul className="bk-confirm-list">
                <li>
                  <span>Dịch vụ</span>
                  <b>{selected?.name}</b>
                </li>
                <li>
                  <span>Thời gian</span>
                  <b>{new Date(slot).toLocaleString("vi-VN")}</b>
                </li>
                <li>
                  <span>Khách hàng</span>
                  <b>{name}</b>
                </li>
                <li>
                  <span>Điện thoại</span>
                  <b>{phone}</b>
                </li>
                {note && (
                  <li>
                    <span>Ghi chú</span>
                    <b>{note}</b>
                  </li>
                )}
              </ul>
              <div className="bk-actions center">
                <button className="btn btn--ghost" onClick={() => setStep(2)}>
                  Sửa lại
                </button>
                <button
                  className="btn"
                  disabled={submitting}
                  onClick={handleSubmit}
                >
                  {submitting ? "Đang gửi..." : "Xác nhận đặt lịch"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
