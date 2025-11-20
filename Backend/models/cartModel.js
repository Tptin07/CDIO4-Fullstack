import { query } from "../config/database.js";

/**
 * Thêm sản phẩm vào giỏ hàng hoặc cập nhật số lượng nếu đã tồn tại
 */
export async function addToCart(userId, productId, quantity = 1) {
  // Kiểm tra sản phẩm có tồn tại và còn hàng không
  const [product] = await query(
    `SELECT id, name, price, stock_quantity, stock_status, status, 
     COALESCE((SELECT image_url FROM product_images WHERE product_id = products.id AND is_primary = TRUE LIMIT 1), 
              cover_image, image) AS image
     FROM products 
     WHERE id = ? AND status = 'active'`,
    [productId]
  );

  if (!product) {
    throw new Error("Sản phẩm không tồn tại hoặc đã bị vô hiệu hóa");
  }

  if (product.stock_status !== "in_stock") {
    throw new Error("Sản phẩm hiện không còn hàng");
  }

  // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
  const [existingCartItem] = await query(
    `SELECT id, quantity FROM cart 
     WHERE user_id = ? AND product_id = ?`,
    [userId, productId]
  );

  if (existingCartItem) {
    // Cập nhật số lượng
    const newQuantity = existingCartItem.quantity + quantity;
    
    // Kiểm tra số lượng không vượt quá tồn kho
    if (newQuantity > product.stock_quantity) {
      throw new Error(
        `Số lượng sản phẩm vượt quá tồn kho. Hiện còn ${product.stock_quantity} sản phẩm.`
      );
    }

    await query(
      `UPDATE cart 
       SET quantity = ?, updated_at = NOW() 
       WHERE id = ?`,
      [newQuantity, existingCartItem.id]
    );

    return {
      id: existingCartItem.id,
      user_id: userId,
      product_id: productId,
      quantity: newQuantity,
      message: "Đã cập nhật số lượng sản phẩm trong giỏ hàng",
    };
  } else {
    // Kiểm tra số lượng không vượt quá tồn kho
    if (quantity > product.stock_quantity) {
      throw new Error(
        `Số lượng sản phẩm vượt quá tồn kho. Hiện còn ${product.stock_quantity} sản phẩm.`
      );
    }

    // Thêm mới vào giỏ hàng
    const result = await query(
      `INSERT INTO cart (user_id, product_id, quantity) 
       VALUES (?, ?, ?)`,
      [userId, productId, quantity]
    );

    return {
      id: result.insertId,
      user_id: userId,
      product_id: productId,
      quantity: quantity,
      message: "Đã thêm sản phẩm vào giỏ hàng",
    };
  }
}

/**
 * Lấy tất cả sản phẩm trong giỏ hàng của user
 */
export async function getCart(userId) {
  const cartItems = await query(
    `SELECT 
      c.id,
      c.product_id,
      c.quantity,
      c.note,
      c.created_at,
      c.updated_at,
      p.name,
      p.price,
      p.old_price,
      p.sale_percent,
      p.stock_quantity,
      p.stock_status,
      COALESCE(
        (SELECT image_url FROM product_images 
         WHERE product_id = p.id AND is_primary = TRUE LIMIT 1),
        p.cover_image,
        p.image
      ) AS image
    FROM cart c
    INNER JOIN products p ON c.product_id = p.id
    WHERE c.user_id = ? AND p.status = 'active'
    ORDER BY c.created_at DESC`,
    [userId]
  );

  return cartItems;
}

/**
 * Cập nhật số lượng và ghi chú sản phẩm trong giỏ hàng
 */
export async function updateCartItem(userId, cartItemId, quantity, note = null) {
  if (quantity < 1) {
    throw new Error("Số lượng phải lớn hơn 0");
  }

  // Kiểm tra cart item có thuộc về user không
  const [cartItem] = await query(
    `SELECT c.*, p.stock_quantity, p.stock_status 
     FROM cart c
     INNER JOIN products p ON c.product_id = p.id
     WHERE c.id = ? AND c.user_id = ?`,
    [cartItemId, userId]
  );

  if (!cartItem) {
    throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
  }

  // Kiểm tra số lượng không vượt quá tồn kho
  if (quantity > cartItem.stock_quantity) {
    throw new Error(
      `Số lượng sản phẩm vượt quá tồn kho. Hiện còn ${cartItem.stock_quantity} sản phẩm.`
    );
  }

  // Cập nhật cả quantity và note
  await query(
    `UPDATE cart 
     SET quantity = ?, note = ?, updated_at = NOW() 
     WHERE id = ? AND user_id = ?`,
    [quantity, note || null, cartItemId, userId]
  );

  return {
    id: cartItemId,
    quantity: quantity,
    note: note || null,
    message: "Đã cập nhật sản phẩm trong giỏ hàng",
  };
}

/**
 * Xóa sản phẩm khỏi giỏ hàng
 */
export async function removeFromCart(userId, cartItemId) {
  const result = await query(
    `DELETE FROM cart 
     WHERE id = ? AND user_id = ?`,
    [cartItemId, userId]
  );

  if (result.affectedRows === 0) {
    throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
  }

  return {
    message: "Đã xóa sản phẩm khỏi giỏ hàng",
  };
}

/**
 * Xóa tất cả sản phẩm trong giỏ hàng của user
 */
export async function clearCart(userId) {
  await query(`DELETE FROM cart WHERE user_id = ?`, [userId]);
  return {
    message: "Đã xóa tất cả sản phẩm trong giỏ hàng",
  };
}

/**
 * Đếm số lượng sản phẩm trong giỏ hàng
 */
export async function getCartCount(userId) {
  const [result] = await query(
    `SELECT COUNT(*) as count, COALESCE(SUM(quantity), 0) as total_quantity
     FROM cart 
     WHERE user_id = ?`,
    [userId]
  );

  return {
    items: result.count,
    totalQuantity: result.total_quantity,
  };
}

