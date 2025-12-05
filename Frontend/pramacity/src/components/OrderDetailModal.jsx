// src/components/OrderDetailModal.jsx
export default function OrderDetailModal({
  open,
  order,
  user,
  onClose,
  onCancel,
}) {
  if (!open || !order) return null;

  // Kiểm tra xem có thể hủy đơn hàng không
  // Cho phép hủy nếu đơn hàng chưa bị hủy và chưa giao
  // Các trạng thái có thể hủy: pending, confirmed, processing
  // Các trạng thái không thể hủy: cancelled, delivered, shipping
  const status = (order.status || "").toLowerCase();
  const shippingStatus = (order.shipping_status || "").toLowerCase();

  // Đơn giản hóa logic: chỉ cần kiểm tra status chính
  const canCancel = status && status !== "cancelled" && status !== "delivered";

  // Debug log
  console.log("OrderDetailModal - canCancel check:", {
    status,
    shippingStatus,
    canCancel,
    hasOnCancel: !!onCancel,
    orderId: order.id,
  });

  // Tính toán giá trị
  const subtotal =
    order.items?.reduce((s, it) => {
      const price = it.price || 0;
      const qty = it.qty || it.quantity || 1;
      return s + price * qty;
    }, 0) || 0;

  const shipFee = order.shipping_fee || (subtotal >= 300000 ? 0 : 15000);
  const discountAmount = order.discount_amount || 0;
  const total = order.final_amount || subtotal + shipFee - discountAmount;

  // Format địa chỉ
  const formatAddress = () => {
    if (!order.address) return "—";
    if (typeof order.address === "string") return order.address;
    if (order.address.street_address) {
      const addr = order.address;
      return `${addr.street_address}, ${addr.ward || ""}, ${
        addr.district || ""
      }, ${addr.province || ""}`
        .replace(/,\s*,/g, ",")
        .replace(/^,|,$/g, "");
    }
    return "—";
  };

  // Format payment method
  const formatPaymentMethod = () => {
    if (!order.payment_method) return "—";
    const method = order.payment_method.toLowerCase();
    if (method === "cod") return "Thanh toán khi nhận hàng (COD)";
    if (method === "online" || method === "vnpay" || method === "momo")
      return "Thanh toán online";
    return order.payment_method;
  };

  // Format payment status
  const formatPaymentStatus = () => {
    if (!order.payment_status) return "—";
    const status = order.payment_status.toLowerCase();
    if (status === "paid") return "Đã thanh toán";
    if (status === "pending") return "Chờ thanh toán";
    if (status === "failed") return "Thất bại";
    return order.payment_status;
  };

  // Format shipping status
  const formatShippingStatus = () => {
    if (!order.shipping_status) return statusLabel(order.status);
    const status = order.shipping_status.toLowerCase();
    if (status === "pending") return "Chờ lấy hàng";
    if (status === "shipping") return "Đang giao hàng";
    if (status === "delivered") return "Đã giao hàng";
    return order.shipping_status;
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="order-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="om-head">
          <div className="om-head-left">
            <div className="om-title">
              <i className="ri-file-list-3-line"></i>
              <div>
                <b>Chi tiết đơn hàng</b>
                <span className="muted">#{order.order_code || order.id}</span>
              </div>
            </div>
            <span className={`status ${order.status}`}>
              {statusLabel(order.status)}
            </span>
          </div>
          <button className="om-close" onClick={onClose} title="Đóng">
            <i className="ri-close-line"></i>
          </button>
        </div>

        {/* Body */}
        <div className="om-body">
          {/* Cột trái: Danh sách sản phẩm */}
          <div className="om-col om-col-left">
            <div className="om-section">
              <h4>
                <i className="ri-shopping-cart-line"></i>
                Sản phẩm ({order.items?.length || 0})
              </h4>
              <ul className="om-items">
                {order.items && order.items.length > 0 ? (
                  order.items.map((it, i) => (
                    <li key={i}>
                      <div className="thumb">
                        {it.image ? (
                          <img src={it.image} alt={it.name || "Sản phẩm"} />
                        ) : (
                          <i className="ri-capsule-line"></i>
                        )}
                      </div>
                      <div className="info">
                        <div className="name">
                          {it.name || it.product_name || "Sản phẩm"}
                        </div>
                        <div className="meta">
                          <span className="muted">
                            Số lượng: {it.qty || it.quantity || 1}
                          </span>
                          {it.price && (
                            <span className="unit-price">
                              {fmt(it.price)}/sản phẩm
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="price">
                        {fmt((it.price || 0) * (it.qty || it.quantity || 1))}
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="om-empty">
                    <i className="ri-information-line"></i>
                    <span>Không có sản phẩm</span>
                  </li>
                )}
              </ul>

              {/* Tóm tắt giá */}
              <div className="om-summary">
                <div className="om-summary-row">
                  <span>Tạm tính</span>
                  <b>{fmt(subtotal)}</b>
                </div>
                {discountAmount > 0 && (
                  <div className="om-summary-row om-discount">
                    <span>
                      <i className="ri-discount-percent-line"></i>
                      Giảm giá
                    </span>
                    <b>-{fmt(discountAmount)}</b>
                  </div>
                )}
                <div className="om-summary-row">
                  <span>
                    <i className="ri-truck-line"></i>
                    Phí vận chuyển
                  </span>
                  <b>{shipFee > 0 ? fmt(shipFee) : "Miễn phí"}</b>
                </div>
                <div className="om-summary-row om-total">
                  <span>Tổng cộng</span>
                  <b>{fmt(total)}</b>
                </div>
              </div>
            </div>
          </div>

          {/* Cột phải: Thông tin giao hàng + Thanh toán + Timeline */}
          <div className="om-col om-col-right">
            {/* Thông tin giao hàng */}
            <div className="om-section">
              <h4>
                <i className="ri-map-pin-line"></i>
                Thông tin giao hàng
              </h4>
              <div className="om-card">
                <div className="om-card-row">
                  <span className="om-label">
                    <i className="ri-user-line"></i>
                    Người nhận
                  </span>
                  <b>{order.address?.full_name || user?.name || "—"}</b>
                </div>
                <div className="om-card-row">
                  <span className="om-label">
                    <i className="ri-phone-line"></i>
                    Số điện thoại
                  </span>
                  <b>{order.address?.phone || user?.phone || "—"}</b>
                </div>
                <div className="om-card-row">
                  <span className="om-label">
                    <i className="ri-map-pin-2-line"></i>
                    Địa chỉ
                  </span>
                  <b>{formatAddress()}</b>
                </div>
                <div className="om-card-row">
                  <span className="om-label">
                    <i className="ri-calendar-line"></i>
                    Ngày đặt hàng
                  </span>
                  <b>
                    {new Date(order.createdAt).toLocaleString("vi-VN", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </b>
                </div>
              </div>
            </div>

            {/* Thông tin thanh toán */}
            <div className="om-section">
              <h4>
                <i className="ri-bank-card-line"></i>
                Thông tin thanh toán
              </h4>
              <div className="om-card">
                <div className="om-card-row">
                  <span className="om-label">
                    <i className="ri-wallet-3-line"></i>
                    Phương thức
                  </span>
                  <b>{formatPaymentMethod()}</b>
                </div>
                <div className="om-card-row">
                  <span className="om-label">
                    <i className="ri-checkbox-circle-line"></i>
                    Trạng thái thanh toán
                  </span>
                  <b
                    className={order.payment_status === "paid" ? "om-paid" : ""}
                  >
                    {formatPaymentStatus()}
                  </b>
                </div>
                <div className="om-card-row">
                  <span className="om-label">
                    <i className="ri-truck-line"></i>
                    Trạng thái vận chuyển
                  </span>
                  <b
                    className={
                      order.shipping_status === "delivered"
                        ? "om-delivered"
                        : ""
                    }
                  >
                    {formatShippingStatus()}
                  </b>
                </div>
              </div>
            </div>

            {/* Tiến trình */}
            {order.timeline && order.timeline.length > 0 && (
              <div className="om-section">
                <h4>
                  <i className="ri-time-line"></i>
                  Tiến trình đơn hàng
                </h4>
                <ul className="om-timeline">
                  {order.timeline.map((t, idx) => (
                    <li key={idx} className={idx === 0 ? "active" : ""}>
                      <div className="dot" />
                      <div className="tl-content">
                        <b>{t.label || t.status}</b>
                        <div className="muted">
                          {new Date(t.at || t.created_at).toLocaleString(
                            "vi-VN",
                            {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Footer với nút hủy đơn hàng */}
        {onCancel && (
          <div className="om-footer">
            {canCancel ? (
              <button
                className="btn btn-danger btn-cancel-order"
                onClick={onCancel}
                type="button"
              >
                <i className="ri-delete-bin-line"></i>
                Hủy đơn hàng
              </button>
            ) : (
              <div className="om-footer-note">
                <i className="ri-information-line"></i>
                <span>
                  {status === "cancelled"
                    ? "Đơn hàng đã được hủy"
                    : status === "delivered" || shippingStatus === "delivered"
                    ? "Đơn hàng đã được giao, không thể hủy"
                    : shippingStatus === "shipping"
                    ? "Đơn hàng đang được giao, không thể hủy"
                    : "Không thể hủy đơn hàng này"}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function fmt(n) {
  const num = Number(n);
  if (!Number.isFinite(num)) return "—";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(num);
}
function statusLabel(s) {
  return (
    {
      shipping: "Đang giao",
      delivered: "Đã giao",
      pending: "Chờ xử lý",
      cancelled: "Đã hủy",
    }[s] || s
  );
}
