-- Tạo VIEW để dễ dàng query bình luận với thông tin user
-- VIEW này kết hợp bảng reviews và users để lấy đầy đủ thông tin

CREATE OR REPLACE VIEW v_product_reviews AS
SELECT 
    r.id,
    r.product_id,
    r.user_id,
    r.rating,
    r.title,
    r.comment AS content,
    r.created_at,
    r.updated_at,
    u.name AS user_name,
    u.avatar AS user_avatar,
    u.email AS user_email,
    p.name AS product_name,
    p.slug AS product_slug
FROM reviews r
INNER JOIN users u ON r.user_id = u.id
INNER JOIN products p ON r.product_id = p.id
ORDER BY r.created_at DESC;

-- Tạo VIEW để thống kê đánh giá theo sản phẩm
CREATE OR REPLACE VIEW v_product_rating_stats AS
SELECT 
    product_id,
    COUNT(*) AS total_reviews,
    AVG(rating) AS avg_rating,
    SUM(CASE WHEN rating = 5 THEN 1 ELSE 0 END) AS rating_5,
    SUM(CASE WHEN rating = 4 THEN 1 ELSE 0 END) AS rating_4,
    SUM(CASE WHEN rating = 3 THEN 1 ELSE 0 END) AS rating_3,
    SUM(CASE WHEN rating = 2 THEN 1 ELSE 0 END) AS rating_2,
    SUM(CASE WHEN rating = 1 THEN 1 ELSE 0 END) AS rating_1
FROM reviews
GROUP BY product_id;

