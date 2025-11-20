-- Script để thêm mã giảm giá TINDEPTRAI vào database
-- Chạy script này bằng lệnh: mysql -u root -p pharmacity_db < insert_tindeptrai_coupon.sql

INSERT INTO coupons (
    code, 
    name, 
    description, 
    discount_type, 
    discount_value, 
    min_purchase, 
    max_discount, 
    usage_limit, 
    used_count, 
    valid_from, 
    valid_until, 
    status
) VALUES (
    'TINDEPTRAI',
    'Mã giảm giá TINDEPTRAI',
    'Mã giảm giá đặc biệt TINDEPTRAI - Giảm 15% cho đơn hàng từ 100k',
    'percentage',
    15.00,
    100000.00,
    100000.00,
    100,
    0,
    '2024-01-01 00:00:00',
    '2024-12-31 23:59:59',
    'active'
);

-- Kiểm tra kết quả
SELECT * FROM coupons WHERE code = 'TINDEPTRAI';

