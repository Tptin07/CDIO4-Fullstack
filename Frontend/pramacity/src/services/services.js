const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || "Không thể kết nối máy chủ");
  }
  return data.data ?? data;
}

export function getServices(params = {}) {
  const searchParams = new URLSearchParams();
  if (params.status) searchParams.append("status", params.status);
  if (params.search) searchParams.append("search", params.search);
  const queryString = searchParams.toString();
  return request(`/services${queryString ? `?${queryString}` : ""}`);
}

export function getServiceById(id) {
  return request(`/services/${id}`);
}

