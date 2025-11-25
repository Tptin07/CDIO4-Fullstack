// src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: "",
    password: "",
  });
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false,
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    const data = Object.fromEntries(new FormData(e.currentTarget));
    const newFieldErrors = {
      email: "",
      password: "",
    };
    
    let hasErrors = false;
    
    // Validate email
    if (!data.email || !data.email.trim()) {
      newFieldErrors.email = "Vui lòng nhập email";
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) {
      newFieldErrors.email = "Email không hợp lệ";
      hasErrors = true;
    }
    
    // Validate password
    if (!data.password || !data.password.trim()) {
      newFieldErrors.password = "Vui lòng nhập mật khẩu";
      hasErrors = true;
    }
    
    // Mark all fields as touched when submitting
    setTouchedFields({
      email: true,
      password: true,
    });
    setFieldErrors(newFieldErrors);

    if (hasErrors) {
      setLoading(false);
      return;
    }
    
    try {
      const user = await login({ email: data.email.trim(), password: data.password });
      // Redirect dựa trên role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "employee") {
        navigate("/employee/chat");
      } else {
        navigate("/"); // về trang chủ cho customer
      }
    } catch (err) {
      // Hiển thị thông báo lỗi, đặc biệt là khi tài khoản bị khóa
      const errorMessage = err.message || "Có lỗi xảy ra khi đăng nhập";
      setError(errorMessage);
      
      // Nếu tài khoản bị khóa, hiển thị thông báo đặc biệt
      if (errorMessage.includes("khóa") || errorMessage.includes("banned")) {
        // Thông báo đã được backend trả về, chỉ cần hiển thị
        // Có thể thêm styling đặc biệt nếu cần
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-banner">
          <div className="auth-banner-content">
            <h1>Chào mừng trở lại!</h1>
            <p>Đăng nhập để tiếp tục mua sắm và tích điểm tại Hiệu thuốc Việt</p>
            <img src="/img/vitc.svg" alt="Login banner" />
          </div>
        </div>
        <div className="auth-form">
          <div className="auth-form-header">
            <h2>Đăng nhập</h2>
            <p>Nhập thông tin để đăng nhập vào tài khoản của bạn</p>
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

          <form onSubmit={handleSubmit}>
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
                name="email"
                type="email"
                required
                placeholder="Nhập email của bạn"
                disabled={loading}
                className={fieldErrors.email ? "error" : ""}
                onChange={(e) => {
                  if (touchedFields.email) {
                    const email = e.target.value.trim();
                    if (!email) {
                      setFieldErrors({ ...fieldErrors, email: "Vui lòng nhập email" });
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      setFieldErrors({ ...fieldErrors, email: "Email không hợp lệ" });
                    } else {
                      setFieldErrors({ ...fieldErrors, email: "" });
                    }
                  }
                }}
                onBlur={(e) => {
                  setTouchedFields({ ...touchedFields, email: true });
                  const email = e.target.value.trim();
                  if (!email) {
                    setFieldErrors({ ...fieldErrors, email: "Vui lòng nhập email" });
                  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setFieldErrors({ ...fieldErrors, email: "Email không hợp lệ" });
                  } else {
                    setFieldErrors({ ...fieldErrors, email: "" });
                  }
                }}
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
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
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Nhập mật khẩu"
                  disabled={loading}
                  className={fieldErrors.password ? "error" : ""}
                  onChange={(e) => {
                    if (touchedFields.password) {
                      const password = e.target.value;
                      if (!password || !password.trim()) {
                        setFieldErrors({ ...fieldErrors, password: "Vui lòng nhập mật khẩu" });
                      } else {
                        setFieldErrors({ ...fieldErrors, password: "" });
                      }
                    }
                  }}
                  onBlur={(e) => {
                    setTouchedFields({ ...touchedFields, password: true });
                    const password = e.target.value;
                    if (!password || !password.trim()) {
                      setFieldErrors({ ...fieldErrors, password: "Vui lòng nhập mật khẩu" });
                    } else {
                      setFieldErrors({ ...fieldErrors, password: "" });
                    }
                  }}
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
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
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
                  <span>Đang đăng nhập...</span>
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <p className="switch-link">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="link-primary">
              Đăng ký ngay
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
