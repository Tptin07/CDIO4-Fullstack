// src/pages/Booking.jsx
import { useMemo, useState } from "react";
import "../assets/css/booking.css"; // nhớ đã thay CSS theo mẫu mới

const SERVICES = [
  {
    id: "bp",
    name: "Đo huyết áp – tư vấn tim mạch",
    dur: "10–15 phút",
    price: "Miễn phí",
    icon: "ri-heart-pulse-line",
  },
  {
    id: "glu",
    name: "Đo đường huyết – HbA1c",
    dur: "15 phút",
    price: "49.000đ",
    icon: "ri-drop-line",
  },
  {
    id: "bmi",
    name: "Đo BMI – tư vấn dinh dưỡng",
    dur: "10 phút",
    price: "Miễn phí",
    icon: "ri-body-scan-line",
  },
  {
    id: "skin",
    name: "Chăm sóc da – soi da",
    dur: "20 phút",
    price: "79.000đ",
    icon: "ri-sparkling-2-line",
  },
  {
    id: "vac",
    name: "Tiêm ngừa (theo mùa)",
    dur: "20–30 phút",
    price: "Theo vắc-xin",
    icon: "ri-shield-check-line",
  },
  {
    id: "ship",
    name: "Giao thuốc tận nhà 2h",
    dur: "2 giờ",
    price: "Từ 15.000đ",
    icon: "ri-truck-line",
  },
];

// tạo 7 ngày & khung giờ demo
function useDays() {
  return useMemo(() => {
    const days = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(now);
      d.setDate(d.getDate() + i);
      const label = d.toLocaleDateString("vi-VN", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });
      days.push({
        key: d.toISOString().slice(0, 10),
        label,
        slots: [
          "16:00",
          "16:30",
          "17:00",
          "18:30",
          "19:00",
          "19:30",
          "20:00",
          "20:30",
        ],
      });
    }
    return days;
  }, []);
}

export default function Booking() {
  const days = useDays();

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [activeDay, setActiveDay] = useState(days[0].key);
  const [slot, setSlot] = useState("");
  const [form, setForm] = useState({ name: "", phone: "", note: "" });
  const [done, setDone] = useState(false);

  const service = useMemo(
    () => SERVICES.find((s) => s.id === serviceId),
    [serviceId]
  );
  const dayObj = useMemo(
    () => days.find((d) => d.key === activeDay),
    [days, activeDay]
  );

  const canNext1 = Boolean(serviceId && slot);
  const canNext2 =
    form.name.trim().length > 1 && /^0\d{9,10}$/.test(form.phone.trim());

  const handleConfirm = () => {
    setDone(true);
  };

  if (done) {
    return (
      <main className="lc bk-wrap">
        <section className="bk-hero">
          <h1>Đặt lịch thành công 🎉</h1>
          <p>
            Cảm ơn bạn đã tin tưởng. Chúng tôi sẽ liên hệ xác nhận trong ít
            phút.
          </p>
        </section>

        <section className="bk-grid" style={{ marginTop: 20 }}>
          <div className="bk-card bk-s-card">
            <h2>✅ Thông tin đặt lịch</h2>
            <p>
              <b>Dịch vụ:</b> {service.name}
            </p>
            <p>
              <b>Thời gian:</b> {dayObj.label} • {slot}
            </p>
            <p>
              <b>Khách hàng:</b> {form.name} – {form.phone}
            </p>
            {form.note && (
              <p>
                <b>Ghi chú:</b> {form.note}
              </p>
            )}
          </div>
          <div className="bk-card">
            <h3>Gợi ý tiếp theo</h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Đến sớm 5–10 phút để được phục vụ nhanh.</li>
              <li>Vui lòng mang theo toa/bảng kết quả gần đây (nếu có).</li>
              <li>Cần đổi lịch? Gọi hotline hiển thị ở chân trang.</li>
            </ul>
            <div className="bk-actions">
              <button
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Đặt lịch mới
              </button>
              <button className="btn btn--ghost" onClick={() => setDone(false)}>
                Quay lại trang trước
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="lc bk-wrap">
      {/* HERO */}
      <section className="bk-hero">
        <h1>
          Đặt lịch dịch vụ <span>nhanh & đẹp</span>
        </h1>
        <p>Chọn dịch vụ • Chọn giờ • Nhập thông tin • Xác nhận</p>
      </section>

      {/* STEPS */}
      <ol className="bk-steps">
        <li className={step === 1 ? "active" : ""}>
          <span>1</span> Chọn dịch vụ & giờ
        </li>
        <li className={step === 2 ? "active" : ""}>
          <span>2</span> Thông tin khách
        </li>
        <li className={step === 3 ? "active" : ""}>
          <span>3</span> Xác nhận
        </li>
      </ol>

      {/* STEP 1 */}
      {step === 1 && (
        <section className="bk-grid">
          <div className="bk-card">
            <h3>Chọn dịch vụ</h3>
            <div className="bk-services">
              {SERVICES.map((s) => (
                <button
                  key={s.id}
                  className={`bk-service ${serviceId === s.id ? "active" : ""}`}
                  onClick={() => setServiceId(s.id)}
                >
                  <i className={s.icon} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 900 }}>{s.name}</div>
                    <small>
                      {s.dur} • {s.price}
                    </small>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="bk-card">
            <h3>Chọn khung giờ</h3>
            <div className="bk-days">
              {days.map((d) => (
                <details key={d.key} open={d.key === activeDay}>
                  <summary onClick={() => setActiveDay(d.key)}>
                    {d.label}
                  </summary>
                  <div className="bk-slots">
                    {d.slots.map((t) => (
                      <button
                        key={t}
                        className={`bk-slot ${slot === t ? "active" : ""}`}
                        onClick={() => {
                          setActiveDay(d.key);
                          setSlot(t);
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="bk-actions" style={{ gridColumn: "1 / -1" }}>
            <button
              className="btn btn-primary"
              disabled={!canNext1}
              onClick={() => setStep(2)}
            >
              Tiếp tục
            </button>
            <button
              className="btn btn--ghost"
              onClick={() => {
                setServiceId(SERVICES[0].id);
                setSlot("");
              }}
            >
              Hủy chọn
            </button>
          </div>
        </section>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <section className="bk-grid">
          <div className="bk-card">
            <h3>Thông tin của bạn</h3>
            <div className="bk-form">
              <label>Họ và tên</label>
              <label>Số điện thoại</label>

              <input
                placeholder="Nguyễn Văn A"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                placeholder="0912345678"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />

              <label style={{ gridColumn: "1 / -1" }}>Ghi chú (tuỳ chọn)</label>
              <textarea
                placeholder="Ví dụ: nhạy cảm với thuốc, muốn đo trước 19:00..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
              />
            </div>

            <div className="bk-actions">
              <button className="btn btn--ghost" onClick={() => setStep(1)}>
                Quay lại
              </button>
              <button
                className="btn btn-primary"
                disabled={!canNext2}
                onClick={() => setStep(3)}
              >
                Tiếp tục
              </button>
            </div>
          </div>

          <div className="bk-card bk-summary">
            <h3>Tóm tắt</h3>
            <h4>Thông tin đặt lịch</h4>
            <ul>
              <li>
                <span>Dịch vụ</span>: <b>{service.name}</b>
              </li>
              <li>
                <span>Thời gian</span>:{" "}
                <b>
                  {dayObj.label} • {slot || "—"}
                </b>
              </li>
              <li>
                <span>Khách hàng</span>: <b>{form.name || "—"}</b>
              </li>
              <li>
                <span>Điện thoại</span>: <b>{form.phone || "—"}</b>
              </li>
              {form.note && (
                <li>
                  <span>Ghi chú</span>: <b>{form.note}</b>
                </li>
              )}
              <li>
                <span>Giá</span>: <b>{service.price}</b>
              </li>
            </ul>
          </div>
        </section>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <section className="bk-grid">
          <div className="bk-card bk-summary">
            <h3>Xác nhận lần cuối</h3>
            <ul>
              <li>
                <span>Dịch vụ</span>: <b>{service.name}</b>
              </li>
              <li>
                <span>Ngày & giờ</span>:{" "}
                <b>
                  {dayObj.label} • {slot}
                </b>
              </li>
              <li>
                <span>Khách hàng</span>: <b>{form.name}</b>
              </li>
              <li>
                <span>Điện thoại</span>: <b>{form.phone}</b>
              </li>
              {form.note && (
                <li>
                  <span>Ghi chú</span>: <b>{form.note}</b>
                </li>
              )}
              <li>
                <span>Giá</span>: <b>{service.price}</b>
              </li>
            </ul>

            <div className="bk-actions">
              <button className="btn btn--ghost" onClick={() => setStep(2)}>
                Quay lại
              </button>
              <button className="btn btn-primary" onClick={handleConfirm}>
                Xác nhận đặt lịch
              </button>
            </div>
          </div>

          <div className="bk-card">
            <h3>Mẹo chuẩn bị</h3>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>Giữ tay thư giãn 5 phút trước khi đo huyết áp.</li>
              <li>Đường huyết: nếu đo lúc đói, nhịn ăn ≥ 8 giờ.</li>
              <li>
                Tiêm ngừa: mang giấy tờ tùy thân & thông tin tiền sử dị ứng.
              </li>
            </ul>
          </div>
        </section>
      )}
    </main>
  );
}
