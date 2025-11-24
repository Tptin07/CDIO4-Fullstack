// src/pages/DatLich.jsx
import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import "../assets/css/booking.css";
import { useAuth } from "../utils/AuthContext";
import { getServices } from "../services/services";
import { createAppointment } from "../services/appointments";

function toast(message) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const t = document.createElement("div");
  t.className = "toast-item";
  t.textContent = message;
  wrap.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 300);
  }, 2200);
}

const SLOT_CONFIG = {
  startHour: 8,
  endHour: 20,
  stepMinutes: 30,
};

const pad = (value) => String(value).padStart(2, "0");

function buildDays() {
  const days = [];
  const now = new Date();
  for (let d = 0; d < 7; d++) {
    const base = new Date(now);
    base.setDate(now.getDate() + d);
    const label = base.toLocaleDateString("vi-VN", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
    const items = [];
    for (let hour = SLOT_CONFIG.startHour; hour <= SLOT_CONFIG.endHour; hour++) {
      for (let minute = 0; minute < 60; minute += SLOT_CONFIG.stepMinutes) {
        const slotDate = new Date(base);
        slotDate.setHours(hour, minute, 0, 0);
        if (d === 0 && slotDate < now) continue;
        const dateStr = `${slotDate.getFullYear()}-${pad(
          slotDate.getMonth() + 1
        )}-${pad(slotDate.getDate())}`;
        const timeStr = `${pad(slotDate.getHours())}:${pad(
          slotDate.getMinutes()
        )}`;
        items.push({
          id: `${dateStr}T${timeStr}`,
          date: dateStr,
          time: timeStr,
          label: slotDate.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }
    }
    days.push({ label, items });
  }
  return days;
}

const formatSlotDisplay = (slot) => {
  if (!slot) return "—";
  const dt = new Date(`${slot.date}T${slot.time}`);
  return dt.toLocaleString("vi-VN");
};

const normalizePhone = (phone) => phone.replace(/\s+/g, "");

export default function DatLich() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const preselectQuery = searchParams.get("service") || "";

  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState("");

  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(preselectQuery);
  const [slot, setSlot] = useState(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setServicesLoading(true);
      setServicesError("");
      try {
        const data = await getServices();
        if (!active) return;
        setServices(data);
        if (data.length) {
          const normalized = preselectQuery?.toLowerCase() || "";
          const preferred =
            data.find((s) => String(s.id) === preselectQuery) ||
            data.find(
              (s) =>
                s.serviceCode &&
                s.serviceCode.toLowerCase() === normalized
            );
          setServiceId(String(preferred ? preferred.id : data[0].id));
        }
      } catch (error) {
        if (active) {
          setServicesError(error.message || "Không thể tải danh sách dịch vụ");
        }
      } finally {
        if (active) setServicesLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [preselectQuery]);

  useEffect(() => {
    if (!user) return;
    setName((prev) => prev || user.name || "");
    setPhone((prev) => prev || user.phone || "");
  }, [user]);

  const selected = useMemo(() => {
    return services.find((s) => String(s.id) === String(serviceId)) || null;
  }, [services, serviceId]);

  const days = useMemo(() => buildDays(), []);

  const canNextFromStep1 = Boolean(selected && slot);
  const canNextFromStep2 =
    Boolean(name.trim()) &&
    /^(0|\+84)\d{9,10}$/.test(normalizePhone(phone));

  const handleSubmit = async () => {
    if (!selected) return toast("Vui lòng chọn dịch vụ");
    if (!slot) return toast("Vui lòng chọn khung giờ");
    if (!canNextFromStep2) {
      return toast("Điền họ tên và số điện thoại hợp lệ");
    }

    try {
      setSubmitting(true);
      const payload = {
        serviceId: selected.id,
        appointmentDate: slot.date,
        appointmentTime: slot.time,
        customerName: name.trim(),
        customerPhone: normalizePhone(phone),
        customerEmail: user?.email || undefined,
        note: note.trim() || undefined,
      };
      const result = await createAppointment(payload);
      setSuccess(result);
      toast("Đặt lịch thành công!");
    } catch (error) {
      toast(error.message || "Có lỗi khi đặt lịch");
    } finally {
      setSubmitting(false);
    }
  };

  if (servicesLoading) {
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

  if (servicesError && services.length === 0) {
    return (
      <main className="lc">
        <section className="bk-wrap">
          <div className="error-box">
            <p>{servicesError}</p>
          </div>
        </section>
      </main>
    );
  }

  if (success) {
    const dt = success.scheduledAt ? new Date(success.scheduledAt) : null;
    return (
      <main className="lc">
        <section className="bk-success">
          <div className="bk-s-card">
            <i className="ri-checkbox-circle-line"></i>
            <h2>
              Mã đặt lịch:{" "}
              {success.appointmentCode || success.code || "Đang cập nhật"}
            </h2>
            <p>
              Dịch vụ: <b>{success.serviceName || selected?.name}</b>
              <br />
              Thời gian:{" "}
              <b>
                {dt
                  ? dt.toLocaleString("vi-VN")
                  : formatSlotDisplay(slot) || "—"}
              </b>
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

        {servicesError && services.length > 0 && (
          <div
            style={{
              marginBottom: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "var(--rounded)",
              background: "var(--warning-bg)",
              color: "var(--warning)",
            }}
          >
            {servicesError}
          </div>
        )}

        {step === 1 && (
          <div className="bk-grid">
            <div className="bk-card">
              <h3>
                <i className="ri-list-check"></i> Chọn dịch vụ
              </h3>
              <div className="bk-services">
                {services.length === 0 ? (
                  <div className="bk-empty">Chưa có dịch vụ khả dụng</div>
                ) : (
                  services.map((s) => (
                    <button
                      key={s.id}
                      className={`bk-service ${
                        String(serviceId) === String(s.id) ? "active" : ""
                      }`}
                      onClick={() => setServiceId(String(s.id))}
                    >
                      <i className={s.icon}></i>
                      <div>
                        <b>{s.name}</b>
                        <small>
                          {s.duration || "—"} • {s.price || "Liên hệ"}
                        </small>
                      </div>
                    </button>
                  ))
                )}
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
                          key={t.id}
                          className={`bk-slot ${
                            slot?.id === t.id ? "active" : ""
                          }`}
                          onClick={() => setSlot(t)}
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
                  <b>{formatSlotDisplay(slot)}</b>
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
                  <b>{formatSlotDisplay(slot)}</b>
                </li>
                <li>
                  <span>Giá</span>
                  <b>{selected?.price}</b>
                </li>
                <li>
                  <span>Khách hàng</span>
                  <b>{name}</b>
                </li>
                <li>
                  <span>Số điện thoại</span>
                  <b>{phone}</b>
                </li>
                {note && (
                  <li>
                    <span>Ghi chú</span>
                    <b>{note}</b>
                  </li>
                )}
              </ul>
              <div className="bk-actions">
                <button className="btn btn--ghost" onClick={() => setStep(2)}>
                  Chỉnh sửa
                </button>
                <button
                  className="btn"
                  onClick={handleSubmit}
                  disabled={submitting}
                >
                  {submitting ? "Đang xử lý..." : "Xác nhận đặt lịch"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

