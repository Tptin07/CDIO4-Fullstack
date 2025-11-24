const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const TOKEN_KEY = "auth_token";

function getAuthHeaders(requireAuth = false) {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token && requireAuth) {
    throw new Error("Vui lòng đăng nhập để thực hiện thao tác này.");
  }
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, { method = "GET", body, requireAuth = false } = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(requireAuth),
  };

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Không thể kết nối máy chủ");
  }
  return data.data ?? data;
}

export function createAppointment(payload) {
  return request("/appointments", {
    method: "POST",
    body: payload,
  });
}

export function getMyAppointments() {
  return request("/appointments", {
    requireAuth: true,
  });
}

export function getAppointmentDetail(id) {
  return request(`/appointments/${id}`, {
    requireAuth: true,
  });
}

export function cancelAppointment(id, reason = "") {
  return request(`/appointments/${id}/cancel`, {
    method: "PATCH",
    body: { reason },
    requireAuth: true,
  });
}

