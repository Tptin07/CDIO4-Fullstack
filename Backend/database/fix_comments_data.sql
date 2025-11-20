-- Script để sửa dữ liệu comments mẫu nếu đã insert sai
-- Chạy script này nếu parent_id không đúng

-- Xóa dữ liệu cũ nếu có
DELETE FROM product_comments WHERE product_id IN (1, 2, 3, 4, 5);

-- Insert lại với parent_id đúng
-- Lưu ý: parent_id phải trỏ đến id của comment cha (không phải id của chính nó)
INSERT INTO product_comments (product_id, user_id, content, parent_id, status) VALUES
-- Product 1: 2 comments cha, 1 reply
(1, 2, 'Sản phẩm này rất tốt, tôi đã dùng và thấy hiệu quả ngay. Giao hàng cũng nhanh nữa!', NULL, 'approved'),
(1, 3, 'Đúng vậy, tôi cũng thấy sản phẩm này rất hiệu quả. Giá cả cũng hợp lý.', NULL, 'approved'),
-- Reply cho comment đầu tiên (id sẽ là 1 sau khi insert)
(1, 4, 'Cảm ơn bạn đã chia sẻ. Tôi sẽ thử mua sản phẩm này.', 
 (SELECT id FROM (SELECT id FROM product_comments WHERE product_id = 1 AND parent_id IS NULL ORDER BY id LIMIT 1) AS temp), 
 'approved'),

-- Product 2: 1 comment cha, 2 replies
(2, 2, 'Vitamin C này chất lượng tốt, uống đều đặn thấy sức đề kháng tăng rõ rệt.', NULL, 'approved'),
-- Reply cho comment trên (id sẽ là 4)
(2, 3, 'Bạn uống như thế nào vậy? Một ngày bao nhiêu viên?', 
 (SELECT id FROM (SELECT id FROM product_comments WHERE product_id = 2 AND parent_id IS NULL ORDER BY id LIMIT 1) AS temp), 
 'approved'),
-- Reply cho reply trên (id sẽ là 5)
(2, 2, 'Tôi uống 1 viên mỗi ngày sau bữa sáng. Bạn có thể tham khảo hướng dẫn trên bao bì nhé.', 
 (SELECT id FROM (SELECT id FROM product_comments WHERE product_id = 2 AND parent_id IS NOT NULL ORDER BY id LIMIT 1) AS temp), 
 'approved'),

-- Product 3: 1 comment
(3, 4, 'Khẩu trang này vừa vặn, không gây khó chịu khi đeo lâu. Chất lượng tốt!', NULL, 'approved'),

-- Product 4: 1 comment cha, 1 reply
(4, 3, 'Kem chống nắng này thấm nhanh, không nhờn dính. Rất phù hợp cho da dầu như tôi.', NULL, 'approved'),
-- Reply cho comment trên (id sẽ là 8)
(4, 5, 'Bạn dùng SPF bao nhiêu? Có bị bết dính không?', 
 (SELECT id FROM (SELECT id FROM product_comments WHERE product_id = 4 AND parent_id IS NULL ORDER BY id LIMIT 1) AS temp), 
 'approved'),

-- Product 5: 1 comment
(5, 5, 'Máy đo huyết áp này rất chính xác và dễ sử dụng. Phù hợp để theo dõi sức khỏe tại nhà.', NULL, 'approved');

