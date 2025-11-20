-- Script để sửa lỗi "Data too long for column 'product_image'"
-- Chạy script này trong database để cập nhật cột product_image

-- 1. Thay đổi kiểu dữ liệu của cột product_image từ VARCHAR(500) sang TEXT
ALTER TABLE order_items 
MODIFY COLUMN product_image TEXT DEFAULT NULL;

-- 2. Cập nhật stored procedure CreateOrder để lấy image theo thứ tự ưu tiên
DROP PROCEDURE IF EXISTS CreateOrder;

DELIMITER $$

CREATE PROCEDURE CreateOrder(
    IN p_user_id BIGINT,
    IN p_address_id BIGINT,
    IN p_payment_method VARCHAR(20),
    IN p_shipping_method VARCHAR(100),
    IN p_coupon_code VARCHAR(50),
    IN p_note TEXT,
    OUT p_order_id BIGINT,
    OUT p_order_code VARCHAR(50)
)
BEGIN
    DECLARE v_total_amount DECIMAL(12,2) DEFAULT 0;
    DECLARE v_shipping_fee DECIMAL(12,2) DEFAULT 30000;
    DECLARE v_discount_amount DECIMAL(12,2) DEFAULT 0;
    DECLARE v_final_amount DECIMAL(12,2);
    DECLARE v_order_code VARCHAR(50);
    DECLARE v_coupon_id BIGINT;
    SELECT COALESCE(SUM(p.price * c.quantity), 0) INTO v_total_amount
    FROM cart c
    INNER JOIN products p ON c.product_id = p.id
    WHERE c.user_id = p_user_id AND p.status = 'active' AND p.stock_status = 'in_stock';
    IF v_total_amount >= 200000 THEN
        SET v_shipping_fee = 0;
    END IF;
    IF p_coupon_code IS NOT NULL AND p_coupon_code != '' THEN
        SET v_discount_amount = CheckCouponValid(p_coupon_code, v_total_amount);
        IF v_discount_amount > 0 THEN
            SELECT id INTO v_coupon_id FROM coupons WHERE code = p_coupon_code;
        END IF;
    END IF;
    SET v_final_amount = v_total_amount + v_shipping_fee - v_discount_amount;
    SET v_order_code = GenerateOrderCode();
    INSERT INTO orders (
        order_code, user_id, address_id, total_amount, shipping_fee,
        discount_amount, final_amount, payment_method, shipping_method, note
    ) VALUES (
        v_order_code, p_user_id, p_address_id, v_total_amount, v_shipping_fee,
        v_discount_amount, v_final_amount, p_payment_method, p_shipping_method, p_note
    );
    SET p_order_id = LAST_INSERT_ID();
    SET p_order_code = v_order_code;
    INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal)
    SELECT
        p_order_id,
        p.id,
        p.name,
        COALESCE(
            (SELECT image_url FROM product_images WHERE product_id = p.id AND is_primary = TRUE LIMIT 1),
            p.cover_image,
            p.image,
            NULL
        ) AS product_image,
        p.price,
        c.quantity,
        p.price * c.quantity
    FROM cart c
    INNER JOIN products p ON c.product_id = p.id
    WHERE c.user_id = p_user_id AND p.status = 'active' AND p.stock_status = 'in_stock';
    UPDATE products p
    INNER JOIN cart c ON p.id = c.product_id
    SET p.stock_quantity = p.stock_quantity - c.quantity,
        p.sold_count = p.sold_count + c.quantity
    WHERE c.user_id = p_user_id;
    IF v_coupon_id IS NOT NULL THEN
        INSERT INTO order_coupons (order_id, coupon_id, discount_amount)
        VALUES (p_order_id, v_coupon_id, v_discount_amount);
        UPDATE coupons SET used_count = used_count + 1 WHERE id = v_coupon_id;
    END IF;
    INSERT INTO order_timeline (order_id, status, label, description)
    VALUES (p_order_id, 'pending', 'Đơn hàng đã được đặt', 'Khách hàng đã đặt hàng thành công');
    DELETE FROM cart WHERE user_id = p_user_id;
END$$

DELIMITER ;

