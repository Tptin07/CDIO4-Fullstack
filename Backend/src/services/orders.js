// src/services/orders.js
const ORDERS_KEY = "demo_orders";

function readOrders() {
  try {
    return JSON.parse(localStorage.getItem(ORDERS_KEY)) || [];
  } catch {
    return [];
  }
}
function writeOrders(orders) {
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

export function seedOrdersIfEmpty(userId) {
  const orders = readOrders();
  if (orders.some((o) => o.userId === userId)) return;

  const now = Date.now();
  const samples = [
    {
      id: "DH" + (now - 2),
      userId,
      createdAt: now - 86400000 * 6,
      status: "delivered",
      address: "123 Lý Thường Kiệt, P.7, Q.10, TP.HCM",
      shipping: "GHN - Giao tiết kiệm",
      payment: "COD",
      items: [
        { name: "Vitamin C 500mg", qty: 2, price: 45000 },
        { name: "Khẩu trang 4D", qty: 1, price: 30000 },
      ],
      timeline: buildTimeline("delivered", now - 86400000 * 6),
      note: "Giao giờ hành chính.",
    },
    {
      id: "DH" + (now - 1),
      userId,
      createdAt: now - 86400000 * 2,
      status: "shipping",
      address: "25 Trần Hưng Đạo, P. Phạm Ngũ Lão, Q.1, TP.HCM",
      shipping: "J&T - Nhanh",
      payment: "COD",
      items: [{ name: "Kem chống nắng SPF50", qty: 1, price: 160000 }],
      timeline: buildTimeline("shipping", now - 86400000 * 2),
      note: "",
    },
  ];
  writeOrders([...orders, ...samples]);
}

export function getOrdersByUser(userId) {
  return readOrders()
    .filter((o) => o.userId === userId)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function getOrderById(id) {
  return readOrders().find((o) => o.id === id) || null;
}

export function getAllOrders() {
  return readOrders().sort((a, b) => b.createdAt - a.createdAt);
}

export function updateOrderStatus(id, status) {
  const orders = readOrders();
  const idx = orders.findIndex((o) => o.id === id);
  if (idx === -1) throw new Error("Không tìm thấy đơn hàng");

  orders[idx].status = status;
  
  // Update timeline based on status
  if (status === "shipping" && !orders[idx].timeline.find((t) => t.label === "Đã bàn giao vận chuyển")) {
    orders[idx].timeline.push({
      label: "Đã bàn giao vận chuyển",
      at: new Date().toISOString(),
    });
  }
  if (status === "delivered" && !orders[idx].timeline.find((t) => t.label === "Đã giao")) {
    orders[idx].timeline.push({
      label: "Đã giao",
      at: new Date().toISOString(),
    });
  }
  
  writeOrders(orders);
  return orders[idx];
}

export function deleteOrder(id) {
  const orders = readOrders();
  const filtered = orders.filter((o) => o.id !== id);
  writeOrders(filtered);
  return true;
}

// Helpers
function buildTimeline(status, start) {
  const mk = (label, d) => ({ label, at: new Date(d).toISOString() });
  const t1 = mk("Tạo đơn hàng", start);
  const t2 = mk("Đã xác nhận", start + 3 * 60 * 60 * 1000);
  const t3 = mk("Đã bàn giao vận chuyển", start + 12 * 60 * 60 * 1000);
  const t4 = mk("Đang giao", start + 36 * 60 * 60 * 1000);
  const t5 = mk("Đã giao", start + 60 * 60 * 60 * 1000);
  if (status === "shipping") return [t1, t2, t3, t4];
  if (status === "delivered") return [t1, t2, t3, t4, t5];
  return [t1, t2];
}
