import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export default function AuthModal({ open: openProp = false, onClose }) {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(openProp);
  const [tab, setTab] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });

  // 🔔 Cho phép mở modal từ mọi nơi bằng sự kiện "OPEN_AUTH"
  useEffect(() => {
    const fn = () => setOpen(true);
    document.addEventListener("OPEN_AUTH", fn);
    return () => document.removeEventListener("OPEN_AUTH", fn);
  }, []);

  // 🔄 Cập nhật khi prop thay đổi (nếu truyền open từ cha)
  useEffect(() => setOpen(openProp), [openProp]);

  // Reset form khi đổi tab
  useEffect(() => {
    if (open) {
      setError("");
      setForm({ name: "", email: "", password: "" });
      setShowPassword(false);
    }
  }, [tab, open]);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (tab === "login") {
        const user = await login({ email: form.email, password: form.password });
        setOpen(false);
        if (onClose) onClose();
        // Redirect dựa trên role
        if (user.role === "admin") {
          navigate("/admin");
        } else if (user.role === "employee") {
          navigate("/employee/chat");
        } else {
          // Customer sẽ ở lại trang hiện tại hoặc về trang chủ
          window.location.reload();
        }
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
        setOpen(false);
        if (onClose) onClose();
        // Customer mới đăng ký sẽ ở lại trang hiện tại
        window.location.reload();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="auth-backdrop"
      onClick={() => {
        setOpen(false);
        onClose?.();
      }}
    >
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="close-btn"
          onClick={() => {
            setOpen(false);
            onClose?.();
          }}
          aria-label="Đóng"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M18 6L6 18M6 6L18 18"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div className="auth-modal-header">
          <h2>{tab === "login" ? "Đăng nhập" : "Đăng ký"}</h2>
          <p>
            {tab === "login"
              ? "Nhập thông tin để đăng nhập vào tài khoản"
              : "Tạo tài khoản để tận hưởng ưu đãi đặc biệt"}
          </p>
        </div>

        <div className="auth-tabs">
          <button
            className={tab === "login" ? "active" : ""}
            onClick={() => setTab("login")}
            type="button"
          >
            Đăng nhập
          </button>
          <button
            className={tab === "register" ? "active" : ""}
            onClick={() => setTab("register")}
            type="button"
          >
            Đăng ký
          </button>
        </div>

        {error && (
          <div className="alert alert--error">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M10 18.3333C14.6024 18.3333 18.3333 14.6024 18.3333 10C18.3333 5.39763 14.6024 1.66667 10 1.66667C5.39763 1.66667 1.66667 5.39763 1.66667 10C1.66667 14.6024 5.39763 18.3333 10 18.3333Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 6.66667V10"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 13.3333H10.0083"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form className="auth-modal-form" onSubmit={handleSubmit}>
          {tab === "register" && (
            <div className="form-group">
              <label>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 10C11.841 10 13.3333 8.50762 13.3333 6.66667C13.3333 4.82572 11.841 3.33333 10 3.33333C8.15905 3.33333 6.66667 4.82572 6.66667 6.66667C6.66667 8.50762 8.15905 10 10 10Z"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M17.5 17.5C17.5 14.4125 14.1375 11.6667 10 11.6667C5.8625 11.6667 2.5 14.4125 2.5 17.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Họ và tên
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Nhập họ và tên của bạn"
                disabled={loading}
              />
            </div>
          )}
          <div className="form-group">
            <label>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.6667 17.5V15.8333C16.6667 14.9493 16.3155 14.1014 15.6904 13.4763C15.0652 12.8512 14.2174 12.5 13.3333 12.5H6.66667C5.78261 12.5 4.93477 12.8512 4.30964 13.4763C3.68452 14.1014 3.33333 14.9493 3.33333 15.8333V17.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 9.16667C11.841 9.16667 13.3333 7.67428 13.3333 5.83333C13.3333 3.99238 11.841 2.5 10 2.5C8.15905 2.5 6.66667 3.99238 6.66667 5.83333C6.66667 7.67428 8.15905 9.16667 10 9.16667Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Email
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              placeholder="Nhập email của bạn"
              disabled={loading}
            />
          </div>
          <div className="form-group">
            <label>
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.8333 9.16667H4.16667C3.24619 9.16667 2.5 9.91286 2.5 10.8333V16.6667C2.5 17.5871 3.24619 18.3333 4.16667 18.3333H15.8333C16.7538 18.3333 17.5 17.5871 17.5 16.6667V10.8333C17.5 9.91286 16.7538 9.16667 15.8333 9.16667Z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.83333 9.16667V5.83333C5.83333 4.72826 6.27232 3.66846 7.05372 2.88706C7.83512 2.10565 8.89493 1.66667 10 1.66667C11.1051 1.66667 12.1649 2.10565 12.9463 2.88706C13.7277 3.66846 14.1667 4.72826 14.1667 5.83333V9.16667"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Mật khẩu
            </label>
            <div className="input-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                required
                minLength={4}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="Nhập mật khẩu"
                disabled={loading}
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 2.5L17.5 17.5M8.15833 8.15833C7.84157 8.47509 7.66667 8.9087 7.66667 9.375C7.66667 10.308 8.425 11.0667 9.35833 11.0667C9.82463 11.0667 10.2582 10.8918 10.575 10.575M14.1417 14.1417C13.15 14.8833 11.9833 15.4167 10.625 15.4167C6.66667 15.4167 3.40833 12.5 1.66667 10C2.325 8.89167 3.19167 7.91667 4.19167 7.10833L14.1417 14.1417ZM6.975 6.975C5.80833 7.78333 4.83333 8.75 4.175 9.85833C4.80833 10.8083 5.64167 11.6417 6.60833 12.325L6.975 6.975ZM12.1917 4.10833C12.8083 3.95 13.425 3.85 14.0333 3.80833C13.8083 4.19167 13.5583 4.575 13.2833 4.94167L12.1917 4.10833ZM7.80833 3.30833C8.19167 3.25 8.58333 3.225 8.975 3.225C12.9333 3.225 16.1917 6.14167 17.9333 9.04167C17.5333 9.80833 17.05 10.525 16.5 11.175L15.4083 10.0833C15.75 9.60833 16.05 9.10833 16.3083 8.58333C15.0083 6.66667 13.0083 5.41667 10.625 5.41667C10.325 5.41667 10.0333 5.44167 9.75 5.48333L7.80833 3.30833Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.66667 10C1.66667 10 4.16667 4.16667 10 4.16667C15.8333 4.16667 18.3333 10 18.3333 10C18.3333 10 15.8333 15.8333 10 15.8333C4.16667 15.8333 1.66667 10 1.66667 10Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M10 12.5C11.3807 12.5 12.5 11.3807 12.5 10C12.5 8.61929 11.3807 7.5 10 7.5C8.61929 7.5 7.5 8.61929 7.5 10C7.5 11.3807 8.61929 12.5 10 12.5Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="btn btn--block btn--primary"
            disabled={loading}
          >
            {loading ? (
              <>
                <svg
                  className="spinner"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="10"
                    cy="10"
                    r="8"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeDasharray="32"
                    strokeDashoffset="32"
                  >
                    <animate
                      attributeName="stroke-dasharray"
                      dur="2s"
                      values="0 32;16 16;0 32;0 32"
                      repeatCount="indefinite"
                    />
                    <animate
                      attributeName="stroke-dashoffset"
                      dur="2s"
                      values="0;-16;-32;-32"
                      repeatCount="indefinite"
                    />
                  </circle>
                </svg>
                <span>
                  {tab === "login" ? "Đang đăng nhập..." : "Đang tạo tài khoản..."}
                </span>
              </>
            ) : (
              tab === "login"
                ? "Đăng nhập"
                : "Tạo tài khoản"
            )}
          </button>
        </form>

        <p className="switch-link">
          {tab === "login" ? (
            <>
              Chưa có tài khoản?{" "}
              <button
                type="button"
                className="link-primary"
                onClick={() => setTab("register")}
              >
                Đăng ký ngay
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{" "}
              <button
                type="button"
                className="link-primary"
                onClick={() => setTab("login")}
              >
                Đăng nhập
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
