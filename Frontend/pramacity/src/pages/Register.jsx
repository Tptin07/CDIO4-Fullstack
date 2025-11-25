// src/pages/Register.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../utils/AuthContext";

export default function Register() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    name: "",
    email: "",
    password: "",
    repassword: "",
  });
  const [touchedFields, setTouchedFields] = useState({
    name: false,
    email: false,
    password: false,
    repassword: false,
  });
  const [nameValue, setNameValue] = useState("");

  // Validation functions
  function validateName(name) {
    if (!name || !name.trim()) {
      return "Vui lòng nhập họ và tên";
    }
    const trimmedName = name.trim();

    // Kiểm tra độ dài (phải >= 5 ký tự)
    if (trimmedName.length < 5) {
      return "Họ và tên phải có ít nhất 5 ký tự";
    }

    if (/\d/.test(trimmedName)) {
      return "Họ và tên không được chứa số";
    }

    // Kiểm tra xem có chữ cái in hoa không (không được có chữ in hoa)
    if (/[A-Z]/.test(trimmedName)) {
      return "Họ và tên không được có chữ cái in hoa";
    }

    return "";
  }

  function validatePassword(password) {
    if (!password || !password.trim()) {
      return "Vui lòng nhập mật khẩu";
    }

    // Kiểm tra độ dài (phải > 5 ký tự, tức là >= 6)
    if (password.length <= 5) {
      return "Mật khẩu phải lớn hơn 5 ký tự";
    }

    // Kiểm tra tất cả các yêu cầu phải được thỏa mãn đồng thời
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
      password
    );

    if (!hasUpperCase) {
      return "Mật khẩu phải có ít nhất một chữ cái in hoa";
    }

    if (!hasLowerCase) {
      return "Mật khẩu phải có ít nhất một chữ cái thường";
    }

    if (!hasNumber) {
      return "Mật khẩu phải có ít nhất một chữ số";
    }

    if (!hasSpecialChar) {
      return "Mật khẩu phải có ít nhất một ký tự đặc biệt";
    }

    return "";
  }

  // Hàm để filter số và ký tự đặc biệt khỏi họ tên, và chuyển chữ in hoa thành chữ thường
  function filterNameInput(value) {
    // Loại bỏ số và ký tự đặc biệt, chỉ giữ lại chữ cái và dấu cách
    let filtered = value.replace(
      /[^a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđA-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\s]/g,
      ""
    );
    // Chuyển tất cả chữ in hoa thành chữ thường
    filtered = filtered.toLowerCase();
    return filtered;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    const data = Object.fromEntries(new FormData(e.currentTarget));
    // Sử dụng nameValue từ state thay vì data.name
    const nameToValidate = nameValue || data.name || "";
    const emailToValidate = data.email || "";
    const passwordToValidate = data.password || "";
    const repasswordToValidate = data.repassword || "";

    const newFieldErrors = {
      name: "",
      email: "",
      password: "",
      repassword: "",
    };

    let hasErrors = false;

    // Validate name - BẮT BUỘC
    const nameError = validateName(nameToValidate);
    if (nameError) {
      newFieldErrors.name = nameError;
      hasErrors = true;
    }

    // Validate email - BẮT BUỘC
    if (!emailToValidate || !emailToValidate.trim()) {
      newFieldErrors.email = "Vui lòng nhập email";
      hasErrors = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailToValidate.trim())) {
      newFieldErrors.email = "Email không hợp lệ";
      hasErrors = true;
    }

    // Validate password - BẮT BUỘC
    // Kiểm tra lại một lần nữa để đảm bảo
    if (!passwordToValidate || !passwordToValidate.trim()) {
      newFieldErrors.password = "Vui lòng nhập mật khẩu";
      hasErrors = true;
    } else {
      const passwordError = validatePassword(passwordToValidate);
      if (passwordError) {
        newFieldErrors.password = passwordError;
        hasErrors = true;
      }
    }

    // Validate repassword - BẮT BUỘC
    if (!repasswordToValidate || !repasswordToValidate.trim()) {
      newFieldErrors.repassword = "Vui lòng nhập lại mật khẩu";
      hasErrors = true;
    } else if (passwordToValidate !== repasswordToValidate) {
      newFieldErrors.repassword = "Mật khẩu nhập lại không khớp";
      hasErrors = true;
    }

    // Mark all fields as touched when submitting
    setTouchedFields({
      name: true,
      email: true,
      password: true,
      repassword: true,
    });
    setFieldErrors(newFieldErrors);

    // QUAN TRỌNG: Không cho phép submit nếu có bất kỳ lỗi nào
    if (hasErrors) {
      setLoading(false);
      return; // Dừng lại, không tiếp tục submit
    }

    // Chỉ khi KHÔNG có lỗi mới tiếp tục
    setLoading(true);

    try {
      await signup({
        name: nameToValidate.trim(),
        email: data.email.trim(),
        password: data.password,
      });
      navigate("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-banner">
          <div className="auth-banner-content">
            <h1>Tham gia Hiệu thuốc Việt!</h1>
            <p>
              Tạo tài khoản để tận hưởng ưu đãi đặc biệt và tích điểm thưởng
            </p>
            <img src="/img/sunscreen.svg" alt="Register banner" />
          </div>
        </div>
        <div className="auth-form">
          <div className="auth-form-header">
            <h2>Đăng ký tài khoản</h2>
            <p>Điền thông tin để tạo tài khoản mới</p>
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

          <form onSubmit={handleSubmit} noValidate>
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
                Họ tên
              </label>
              <input
                name="name"
                type="text"
                required
                value={nameValue}
                placeholder="Nhập họ và tên của bạn (ít nhất 5 ký tự, không có số, không có chữ in hoa)"
                disabled={loading}
                className={fieldErrors.name ? "error" : ""}
                onInput={(e) => {
                  // onInput chạy ngay khi giá trị thay đổi, kể cả paste, drag-drop, etc
                  const originalValue = e.target.value;
                  const filteredValue = filterNameInput(originalValue);

                  // Nếu có ký tự không hợp lệ, ngăn chặn và hiển thị thông báo
                  if (originalValue !== filteredValue) {
                    // Cập nhật giá trị với giá trị đã được filter
                    setNameValue(filteredValue);
                    setFieldErrors({
                      ...fieldErrors,
                      name: "Họ và tên không được chứa số hoặc ký tự đặc biệt",
                    });
                    // Force update input value
                    e.target.value = filteredValue;
                  } else {
                    setNameValue(filteredValue);
                    if (touchedFields.name) {
                      const error = validateName(filteredValue);
                      setFieldErrors({ ...fieldErrors, name: error });
                    }
                  }
                }}
                onChange={(e) => {
                  // onChange chỉ để trigger React re-render
                  const filteredValue = filterNameInput(e.target.value);
                  setNameValue(filteredValue);
                  if (touchedFields.name) {
                    const error = validateName(filteredValue);
                    setFieldErrors({ ...fieldErrors, name: error });
                  }
                }}
                onKeyDown={(e) => {
                  // Ngăn chặn nhập số và ký tự đặc biệt ngay từ đầu
                  const char = e.key;
                  // Cho phép các phím điều hướng và xóa
                  if (
                    e.key === "Backspace" ||
                    e.key === "Delete" ||
                    e.key === "ArrowLeft" ||
                    e.key === "ArrowRight" ||
                    e.key === "ArrowUp" ||
                    e.key === "ArrowDown" ||
                    e.key === "Tab" ||
                    e.key === "Enter" ||
                    e.ctrlKey ||
                    e.metaKey
                  ) {
                    return;
                  }
                  if (
                    /\d/.test(char) ||
                    /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(char)
                  ) {
                    e.preventDefault();
                    setFieldErrors({
                      ...fieldErrors,
                      name: "Họ và tên không được chứa số hoặc ký tự đặc biệt",
                    });
                  }
                  // Chữ in hoa sẽ được tự động chuyển thành chữ thường trong onInput
                }}
                onPaste={(e) => {
                  e.preventDefault();
                  const pastedText = (
                    e.clipboardData || window.clipboardData
                  ).getData("text");
                  const filteredText = filterNameInput(pastedText);
                  const newValue = filterNameInput(nameValue + filteredText);
                  setNameValue(newValue);
                  if (pastedText !== filteredText) {
                    setFieldErrors({
                      ...fieldErrors,
                      name: "Họ và tên không được chứa số hoặc ký tự đặc biệt",
                    });
                  } else if (touchedFields.name) {
                    const error = validateName(newValue);
                    setFieldErrors({ ...fieldErrors, name: error });
                  }
                }}
                onBlur={(e) => {
                  setTouchedFields({ ...touchedFields, name: true });
                  const error = validateName(nameValue);
                  setFieldErrors({ ...fieldErrors, name: error });
                }}
              />
              {fieldErrors.name && (
                <span className="field-error">{fieldErrors.name}</span>
              )}
              {!fieldErrors.name && (
                <span className="field-hint">
                  <i className="ri-information-line"></i> Yêu cầu: Ít nhất 5 ký
                  tự, chỉ chữ cái thường, không có số và ký tự đặc biệt
                </span>
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
                      setFieldErrors({
                        ...fieldErrors,
                        email: "Vui lòng nhập email",
                      });
                    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                      setFieldErrors({
                        ...fieldErrors,
                        email: "Email không hợp lệ",
                      });
                    } else {
                      setFieldErrors({ ...fieldErrors, email: "" });
                    }
                  }
                }}
                onBlur={(e) => {
                  setTouchedFields({ ...touchedFields, email: true });
                  const email = e.target.value.trim();
                  if (!email) {
                    setFieldErrors({
                      ...fieldErrors,
                      email: "Vui lòng nhập email",
                    });
                  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    setFieldErrors({
                      ...fieldErrors,
                      email: "Email không hợp lệ",
                    });
                  } else {
                    setFieldErrors({ ...fieldErrors, email: "" });
                  }
                }}
              />
              {fieldErrors.email && (
                <span className="field-error">{fieldErrors.email}</span>
              )}
              {!fieldErrors.email && (
                <span className="field-hint">
                  <i className="ri-information-line"></i> Nhập địa chỉ email hợp
                  lệ (ví dụ: example@email.com)
                </span>
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
                  minLength={6}
                  placeholder="Nhập mật khẩu (lớn hơn 5 ký tự, có chữ hoa, chữ thường, chữ số, ký tự đặc biệt)"
                  disabled={loading}
                  className={fieldErrors.password ? "error" : ""}
                  onChange={(e) => {
                    if (touchedFields.password) {
                      const password = e.target.value;
                      const error = validatePassword(password);
                      setFieldErrors((prev) => {
                        const newErrors = { ...prev, password: error };
                        // Validate repassword again if it has been touched
                        if (touchedFields.repassword) {
                          const form = e.target.form;
                          const repassword = form?.repassword?.value || "";
                          if (repassword) {
                            if (password !== repassword) {
                              newErrors.repassword =
                                "Mật khẩu nhập lại không khớp";
                            } else {
                              newErrors.repassword = "";
                            }
                          }
                        }
                        return newErrors;
                      });
                    }
                  }}
                  onBlur={(e) => {
                    setTouchedFields({ ...touchedFields, password: true });
                    const error = validatePassword(e.target.value);
                    setFieldErrors({ ...fieldErrors, password: error });
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
              {!fieldErrors.password && (
                <span className="field-hint">
                  <i className="ri-information-line"></i> Yêu cầu: Lớn hơn 5 ký
                  tự, có chữ hoa, chữ thường, chữ số và ký tự đặc biệt
                </span>
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
                Nhập lại mật khẩu
              </label>
              <div className="input-wrapper">
                <input
                  name="repassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  minLength={6}
                  placeholder="Nhập lại mật khẩu để xác nhận"
                  disabled={loading}
                  className={fieldErrors.repassword ? "error" : ""}
                  onChange={(e) => {
                    if (touchedFields.repassword) {
                      const repassword = e.target.value;
                      const form = e.target.form;
                      const password = form?.password?.value || "";
                      if (!repassword || !repassword.trim()) {
                        setFieldErrors({
                          ...fieldErrors,
                          repassword: "Vui lòng nhập lại mật khẩu",
                        });
                      } else if (password !== repassword) {
                        setFieldErrors({
                          ...fieldErrors,
                          repassword: "Mật khẩu nhập lại không khớp",
                        });
                      } else {
                        setFieldErrors({ ...fieldErrors, repassword: "" });
                      }
                    }
                  }}
                  onBlur={(e) => {
                    setTouchedFields({ ...touchedFields, repassword: true });
                    const repassword = e.target.value;
                    const form = e.target.form;
                    const password = form?.password?.value || "";
                    if (!repassword || !repassword.trim()) {
                      setFieldErrors({
                        ...fieldErrors,
                        repassword: "Vui lòng nhập lại mật khẩu",
                      });
                    } else if (password !== repassword) {
                      setFieldErrors({
                        ...fieldErrors,
                        repassword: "Mật khẩu nhập lại không khớp",
                      });
                    } else {
                      setFieldErrors({ ...fieldErrors, repassword: "" });
                    }
                  }}
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
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
              {fieldErrors.repassword && (
                <span className="field-error">{fieldErrors.repassword}</span>
              )}
              {!fieldErrors.repassword && (
                <span className="field-hint">
                  <i className="ri-information-line"></i> Nhập lại mật khẩu để
                  xác nhận (phải khớp với mật khẩu ở trên)
                </span>
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
                  <span>Đang tạo tài khoản...</span>
                </>
              ) : (
                "Tạo tài khoản"
              )}
            </button>
          </form>

          <p className="switch-link">
            Đã có tài khoản?{" "}
            <Link to="/login" className="link-primary">
              Đăng nhập
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
