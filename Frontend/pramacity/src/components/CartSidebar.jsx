// src/components/CartSidebar.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { dispatchCartUpdated } from "../services/products";
import * as cartService from "../services/cart";

export default function CartSidebar({ open, onClose }) {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lock body scroll when sidebar is open and listen for cart updates
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      loadCart();
    } else {
      document.body.style.overflow = "";
    }

    // Listen for cart updates from other pages
    const handleCartUpdate = () => {
      if (open) loadCart();
    };
    document.addEventListener("CART_UPDATED", handleCartUpdate);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("CART_UPDATED", handleCartUpdate);
    };
  }, [open]);

  // Load cart from API
  async function loadCart() {
    try {
      setLoading(true);
      const cartData = await cartService.getCart();
      
      // Transform data to match frontend format
      const enriched = cartData.items.map((item) => ({
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        price: item.price,
        old_price: item.old_price,
        image: item.image || "/img/placeholder.jpg",
        img: item.image || "/img/placeholder.jpg",
        cover: item.image || "/img/placeholder.jpg",
        qty: item.quantity,
        quantity: item.quantity,
        subtotal: item.subtotal,
      }));
      
      setCartItems(enriched);
    } catch (err) {
      console.error("Error loading cart:", err);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }

  // Format price
  function formatPrice(price) {
    return new Intl.NumberFormat("vi-VN").format(price) + "₫";
  }

  // Update quantity
  async function updateQty(cartItemId, newQty) {
    if (newQty < 1) return;
    try {
      await cartService.updateCartItem(cartItemId, newQty);
      dispatchCartUpdated();
      await loadCart();
    } catch (err) {
      console.error("Error updating cart:", err);
    }
  }

  // Remove item
  async function removeItem(cartItemId) {
    try {
      await cartService.removeFromCart(cartItemId);
      dispatchCartUpdated();
      await loadCart();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  }

  // Calculate totals
  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.subtotal || (item.price || 0) * (item.qty || 1)),
    0
  );
  const total = subtotal;

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div className={`cart-overlay ${open ? "is-open" : ""}`} onClick={onClose}></div>

      {/* Sidebar */}
      <div className={`cart-sidebar ${open ? "is-open" : ""}`}>
        <div className="cart-header">
          <h2>Giỏ hàng của bạn</h2>
          <button className="cart-close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="cart-body">
          {loading ? (
            <div className="cart-loading">
              <p>Đang tải giỏ hàng...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">🛒</div>
              <p>Giỏ hàng của bạn đang trống</p>
              <Link to="/ban-chay" className="btn" onClick={onClose}>
                Tiếp tục mua sắm
              </Link>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {cartItems.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="cart-item"
                    style={{ 
                      animationDelay: `${index * 0.05}s` 
                    }}
                  >
                    <div className="cart-item-image">
                      <img
                        src={item.img || item.cover || item.image || "/img/vitc.png"}
                        alt={item.name}
                      />
                    </div>
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">
                        <Link to={`/san-pham/${item.product_id}`} onClick={onClose}>
                          {item.name}
                        </Link>
                      </h4>
                      <div className="cart-item-price">
                        {formatPrice(item.price || 0)}
                      </div>
                      <div className="cart-item-controls">
                        <div className="qty-wrapper">
                          <button
                            className="qty-btn qty-minus"
                            onClick={() => updateQty(item.id, (item.qty || 1) - 1)}
                          >
                            −
                          </button>
                          <input
                            type="number"
                            className="qty-input"
                            value={item.qty || 1}
                            min="1"
                            onChange={(e) =>
                              updateQty(item.id, parseInt(e.target.value) || 1)
                            }
                          />
                          <button
                            className="qty-btn qty-plus"
                            onClick={() => updateQty(item.id, (item.qty || 1) + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="cart-item-delete"
                          onClick={() => removeItem(item.id)}
                          title="Xóa sản phẩm"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-footer cart-footer-animate">
            <div className="cart-summary">
              <div className="cart-summary-row">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="cart-summary-row">
                <span>Phí vận chuyển:</span>
                <span>Miễn phí</span>
              </div>
              <div className="cart-summary-row cart-summary-total">
                <span>Tổng cộng:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <Link
              to="/gio-hang"
              className="btn btn--block btn-checkout"
              onClick={onClose}
            >
              Thanh toán
            </Link>
            <Link
              to="/ban-chay"
              className="cart-continue-link"
              onClick={onClose}
            >
              ← Tiếp tục mua sắm
            </Link>
          </div>
        )}
      </div>
    </>
  );
}

