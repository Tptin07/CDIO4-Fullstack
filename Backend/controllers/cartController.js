import * as cartModel from "../models/cartModel.js";
import { validateId } from "../utils/validateId.js";

/**
 * POST /api/cart
 * Thêm sản phẩm vào giỏ hàng
 */
export async function addToCart(req, res) {
  try {
    // Kiểm tra user đã đăng nhập
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng",
      });
    }

    const userId = req.user.userId; // Lấy từ JWT token (token có trường userId)
    const { product_id, quantity = 1 } = req.body;

    // Validation
    if (!product_id || product_id === undefined || product_id === null) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp product_id",
      });
    }

    // Validate product_id - loại bỏ ID tạm thời
    let validatedProductId;
    try {
      validatedProductId = validateId(product_id, "product_id");
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "ID sản phẩm không hợp lệ",
      });
    }

    // Đảm bảo quantity là số hợp lệ
    const qty = parseInt(quantity) || 1;
    if (qty < 1 || !Number.isInteger(qty)) {
      return res.status(400).json({
        success: false,
        message: "Số lượng phải là số nguyên lớn hơn 0",
      });
    }

    // Đảm bảo userId và product_id không phải undefined
    if (!userId || userId === undefined) {
      return res.status(401).json({
        success: false,
        message: "Không xác định được người dùng",
      });
    }

    const result = await cartModel.addToCart(userId, validatedProductId, qty);

    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in addToCart:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi thêm sản phẩm vào giỏ hàng",
    });
  }
}

/**
 * GET /api/cart
 * Lấy tất cả sản phẩm trong giỏ hàng
 */
export async function getCart(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập để xem giỏ hàng",
      });
    }

    const userId = req.user.userId;

    const cartItems = await cartModel.getCart(userId);

    // Tính tổng tiền
    let totalAmount = 0;
    const enrichedItems = cartItems.map((item) => {
      const subtotal = parseFloat(item.price) * item.quantity;
      totalAmount += subtotal;

      return {
        id: item.id,
        product_id: item.product_id,
        name: item.name,
        price: parseFloat(item.price),
        old_price: item.old_price ? parseFloat(item.old_price) : null,
        sale_percent: item.sale_percent,
        image: item.image || "/img/placeholder.jpg",
        quantity: item.quantity,
        note: item.note || null,
        stock_quantity: item.stock_quantity,
        stock_status: item.stock_status,
        subtotal: subtotal,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
    });

    res.json({
      success: true,
      data: {
        items: enrichedItems,
        total_amount: totalAmount,
        item_count: cartItems.length,
      },
    });
  } catch (error) {
    console.error("❌ Error in getCart:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy giỏ hàng",
      error: error.message,
    });
  }
}

/**
 * PUT /api/cart/:id
 * Cập nhật số lượng sản phẩm trong giỏ hàng
 */
export async function updateCartItem(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userId = req.user.userId;
    const { id } = req.params;
    const { quantity, note } = req.body;

    if (!id || id === undefined) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp cart item id",
      });
    }

    // Validate cartItemId - loại bỏ ID tạm thời
    let cartItemId;
    try {
      cartItemId = validateId(id, "cart_item_id");
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message || "ID sản phẩm trong giỏ hàng không hợp lệ",
      });
    }

    const qty = parseInt(quantity);
    if (!qty || qty < 1 || !Number.isInteger(qty)) {
      return res.status(400).json({
        success: false,
        message: "Số lượng phải là số nguyên lớn hơn 0",
      });
    }

    // Note là optional, có thể là string hoặc null
    const noteText = note && typeof note === 'string' ? note.trim() : null;

    const result = await cartModel.updateCartItem(userId, cartItemId, qty, noteText);

    res.json({
      success: true,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in updateCartItem:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi cập nhật giỏ hàng",
    });
  }
}

/**
 * DELETE /api/cart/:id
 * Xóa sản phẩm khỏi giỏ hàng
 */
export async function removeFromCart(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userId = req.user.userId;
    const { id } = req.params;

    if (!id || id === undefined) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng cung cấp cart item id",
      });
    }

    // Đảm bảo id là số nguyên
    const cartItemId = parseInt(id);
    if (isNaN(cartItemId) || cartItemId <= 0) {
      console.error("❌ Invalid cart item id in removeFromCart:", id, typeof id);
      return res.status(400).json({
        success: false,
        message: "ID sản phẩm trong giỏ hàng không hợp lệ",
      });
    }

    const result = await cartModel.removeFromCart(userId, cartItemId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("❌ Error in removeFromCart:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Lỗi khi xóa sản phẩm khỏi giỏ hàng",
    });
  }
}

/**
 * DELETE /api/cart
 * Xóa tất cả sản phẩm trong giỏ hàng
 */
export async function clearCart(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userId = req.user.userId;

    const result = await cartModel.clearCart(userId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("❌ Error in clearCart:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi xóa giỏ hàng",
      error: error.message,
    });
  }
}

/**
 * GET /api/cart/count
 * Lấy số lượng sản phẩm trong giỏ hàng
 */
export async function getCartCount(req, res) {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Vui lòng đăng nhập",
      });
    }

    const userId = req.user.userId;

    const result = await cartModel.getCartCount(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in getCartCount:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi khi lấy số lượng giỏ hàng",
      error: error.message,
    });
  }
}
