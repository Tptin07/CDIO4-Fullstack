-- Migration script để hỗ trợ lưu base64 images vào product_images và products
-- Chạy script này nếu cần lưu ảnh base64 (thường dài hơn 500 ký tự)

-- Cập nhật bảng product_images: image_url từ VARCHAR(500) sang TEXT
ALTER TABLE product_images 
MODIFY COLUMN image_url TEXT NOT NULL;

-- Cập nhật bảng products: image và cover_image từ VARCHAR(500) sang TEXT (nếu chưa)
ALTER TABLE products 
MODIFY COLUMN image TEXT DEFAULT NULL;

ALTER TABLE products 
MODIFY COLUMN cover_image TEXT DEFAULT NULL;

