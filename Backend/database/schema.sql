
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    avatar TEXT DEFAULT NULL,
    role ENUM('customer', 'admin', 'employee') DEFAULT 'customer',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categories (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    parent_id BIGINT DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT DEFAULT NULL,
    short_description VARCHAR(500) DEFAULT NULL,
    category_id BIGINT NOT NULL,
    brand VARCHAR(100) DEFAULT NULL,
    sku VARCHAR(100) UNIQUE DEFAULT NULL,
    price DECIMAL(12, 2) NOT NULL,
    old_price DECIMAL(12, 2) DEFAULT NULL,
    sale_percent INT DEFAULT NULL,
    sale_label VARCHAR(50) DEFAULT NULL,
    stock_quantity INT DEFAULT 0,
    stock_status ENUM('in_stock', 'out_of_stock', 'on_backorder') DEFAULT 'in_stock',
    rating DECIMAL(3, 2) DEFAULT 0.00,
    sold_count INT DEFAULT 0,
    view_count INT DEFAULT 0,
    image VARCHAR(500) DEFAULT NULL,
    cover_image VARCHAR(500) DEFAULT NULL,
    status ENUM('active', 'inactive', 'draft') DEFAULT 'active',
    is_featured BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    is_bestseller BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_slug (slug),
    INDEX idx_category (category_id),
    INDEX idx_status (status),
    INDEX idx_price (price),
    INDEX idx_featured (is_featured),
    INDEX idx_new (is_new),
    INDEX idx_bestseller (is_bestseller),
    FULLTEXT idx_search (name, description, short_description)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_images (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    alt_text VARCHAR(255) DEFAULT NULL,
    sort_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE addresses (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    province VARCHAR(100) NOT NULL,
    district VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    street_address TEXT NOT NULL,
    postal_code VARCHAR(10) DEFAULT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user (user_id),
    INDEX idx_default (is_default)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_code VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT NOT NULL,
    address_id BIGINT NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    shipping_fee DECIMAL(12, 2) DEFAULT 0,
    discount_amount DECIMAL(12, 2) DEFAULT 0,
    final_amount DECIMAL(12, 2) NOT NULL,
    payment_method ENUM('COD', 'bank_transfer', 'credit_card', 'e_wallet') DEFAULT 'COD',
    payment_status ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
    shipping_method VARCHAR(100) DEFAULT NULL,
    shipping_status ENUM('pending', 'confirmed', 'shipping', 'delivered', 'cancelled') DEFAULT 'pending',
    status ENUM('pending', 'confirmed', 'processing', 'shipping', 'delivered', 'cancelled', 'refunded') DEFAULT 'pending',
    note TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (address_id) REFERENCES addresses(id) ON DELETE RESTRICT,
    INDEX idx_order_code (order_code),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    product_image TEXT DEFAULT NULL,
    price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL,
    subtotal DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_timeline (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    status VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    INDEX idx_order (order_id),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE cart (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (user_id, product_id),
    INDEX idx_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE posts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT DEFAULT NULL,
    content LONGTEXT NOT NULL,
    cover_image VARCHAR(500) DEFAULT NULL,
    category VARCHAR(100) DEFAULT NULL,
    author VARCHAR(100) DEFAULT NULL,
    tags JSON DEFAULT NULL,
    read_minutes INT DEFAULT 5,
    view_count INT DEFAULT 0,
    status ENUM('published', 'draft', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_status (status),
    INDEX idx_published (published_at),
    FULLTEXT idx_search (title, excerpt, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE services (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    service_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    duration VARCHAR(50) DEFAULT NULL,
    price VARCHAR(100) DEFAULT NULL,
    icon VARCHAR(100) DEFAULT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (service_code),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE appointments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    appointment_code VARCHAR(50) UNIQUE NOT NULL,
    user_id BIGINT DEFAULT NULL,
    service_id BIGINT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TIME NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255) DEFAULT NULL,
    note TEXT DEFAULT NULL,
    status ENUM('pending', 'confirmed', 'completed', 'cancelled', 'no_show') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    INDEX idx_code (appointment_code),
    INDEX idx_user (user_id),
    INDEX idx_service (service_id),
    INDEX idx_date (appointment_date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE reviews (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255) DEFAULT NULL,
    comment TEXT DEFAULT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_user (user_id),
    INDEX idx_status (status),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE product_comments (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    product_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    parent_id BIGINT DEFAULT NULL,
    content TEXT NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'deleted') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES product_comments(id) ON DELETE CASCADE,
    INDEX idx_product (product_id),
    INDEX idx_user (user_id),
    INDEX idx_parent (parent_id),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE coupons (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    discount_type ENUM('percentage', 'fixed') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    min_purchase DECIMAL(12, 2) DEFAULT 0,
    max_discount DECIMAL(12, 2) DEFAULT NULL,
    usage_limit INT DEFAULT NULL,
    used_count INT DEFAULT 0,
    valid_from TIMESTAMP NOT NULL,
    valid_until TIMESTAMP NOT NULL,
    status ENUM('active', 'inactive', 'expired') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_status (status),
    INDEX idx_valid (valid_from, valid_until)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE notifications (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('order_new', 'order_status_change', 'product_low_stock', 'system') DEFAULT 'system',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    related_id BIGINT DEFAULT NULL COMMENT 'ID của đơn hàng, sản phẩm, etc.',
    related_type VARCHAR(50) DEFAULT NULL COMMENT 'order, product, etc.',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_type (type),
    INDEX idx_related (related_type, related_id),
    INDEX idx_read (is_read),
    INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE order_coupons (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_id BIGINT NOT NULL,
    coupon_id BIGINT NOT NULL,
    discount_amount DECIMAL(12, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (coupon_id) REFERENCES coupons(id) ON DELETE RESTRICT,
    INDEX idx_order (order_id),
    INDEX idx_coupon (coupon_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO categories (name, slug, description, status) VALUES
('Thuốc kê đơn', 'thuoc-ke-don', 'Các loại thuốc cần kê đơn', 'active'),
('Thuốc không kê đơn', 'thuoc-khong-ke-don', 'Thuốc không cần kê đơn', 'active'),
('Thực phẩm chức năng', 'thuc-pham-chuc-nang', 'Thực phẩm bổ sung dinh dưỡng', 'active'),
('Chăm sóc da', 'cham-soc-da', 'Sản phẩm chăm sóc da mặt và cơ thể', 'active'),
('Khẩu trang', 'khau-trang', 'Khẩu trang y tế và khẩu trang vải', 'active'),
('Thiết bị y tế', 'thiet-bi-y-te', 'Thiết bị đo lường và chăm sóc sức khỏe', 'active'),
('Vitamin', 'vitamin', 'Các loại vitamin và khoáng chất', 'active');

INSERT INTO services (service_code, name, duration, price, icon, status) VALUES
('bp', 'Đo huyết áp – tư vấn tim mạch', '10–15 phút', 'Miễn phí', 'ri-heart-pulse-line', 'active'),
('glu', 'Đo đường huyết – HbA1c', '15 phút', '49.000đ', 'ri-drop-line', 'active'),
('bmi', 'Đo BMI – tư vấn dinh dưỡng', '10 phút', 'Miễn phí', 'ri-body-scan-line', 'active'),
('skin', 'Chăm sóc da – soi da', '20 phút', '79.000đ', 'ri-sparkling-2-line', 'active'),
('vac', 'Tiêm ngừa (theo mùa)', '20–30 phút', 'Theo vắc-xin', 'ri-shield-check-line', 'active'),
('ship', 'Giao thuốc tận nhà 2h', '2 giờ', 'Từ 15.000đ', 'ri-truck-line', 'active');

INSERT INTO users (name, email, password, phone, role, status) VALUES
('Admin', 'admin@pharmacity.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901234567', 'admin', 'active'),
('Nguyễn Văn An', 'nguyenvanan@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0912345678', 'customer', 'active'),
('Trần Thị Bình', 'tranthibinh@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0923456789', 'customer', 'active'),
('Lê Văn Cường', 'levancuong@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0934567890', 'customer', 'active'),
('Phạm Thị Dung', 'phamthidung@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0945678901', 'customer', 'active'),
('Hoàng Thị Mai', 'hoangthimai@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0956789012', 'customer', 'active'),
('Trương Minh Tuấn', 'truongminhtuan@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0967890123', 'customer', 'active'),
('Võ Thị Hương', 'vothihuong@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0978901234', 'customer', 'active'),
('Đỗ Văn Đức', 'dovanduc@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0989012345', 'customer', 'active'),
('Bùi Thị Lan', 'buithilan@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0990123456', 'customer', 'active'),
('Phan Văn Hùng', 'phanvanhung@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901237890', 'customer', 'active'),
('Ngô Thị Hoa', 'ngothihoa@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0912348901', 'customer', 'active'),
('Lý Văn Nam', 'lyvannam@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0923459012', 'customer', 'active'),
('Đặng Thị Linh', 'dangthilinh@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0934560123', 'customer', 'active'),
('Dương Minh Khoa', 'duongminhkhoa@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0945671234', 'customer', 'active'),
('Nguyễn Thị Ngọc', 'nguyenthingoc@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0956782345', 'customer', 'active'),
('Trần Văn Phong', 'tranvanphong@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0967893456', 'customer', 'active'),
('Lê Thị Thanh', 'lethithanh@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0978904567', 'customer', 'active'),
('Phạm Minh Quang', 'phamminhquang@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0989015678', 'customer', 'active'),
('Hoàng Thị Hạnh', 'hoangthihanh@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0990126789', 'customer', 'active'),
('Vũ Văn Sơn', 'vuvanson@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0901238910', 'customer', 'active'),
('Đinh Thị Nga', 'dinhthinga@gmail.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', '0912349021', 'customer', 'active');

INSERT INTO products (name, slug, description, short_description, category_id, brand, sku, price, old_price, sale_percent, sale_label, stock_quantity, stock_status, rating, sold_count, view_count, status, is_featured, is_new, is_bestseller) VALUES
('Paracetamol 500mg', 'paracetamol-500mg', 'Thuốc giảm đau, hạ sốt hiệu quả, an toàn cho người lớn và trẻ em', 'Thuốc giảm đau hạ sốt', 2, 'Traphaco', 'SKU001', 25000.00, 30000.00, 17, 'Giảm 17%', 500, 'in_stock', 4.5, 1200, 3500, 'active', TRUE, FALSE, TRUE),
('Vitamin C 1000mg', 'vitamin-c-1000mg', 'Bổ sung vitamin C tăng cường sức đề kháng, chống oxy hóa', 'Vitamin C tăng đề kháng', 7, 'Nature Made', 'SKU002', 150000.00, NULL, NULL, NULL, 300, 'in_stock', 4.8, 850, 2100, 'active', TRUE, TRUE, FALSE),
('Khẩu trang y tế 3 lớp', 'khau-trang-y-te-3-lop', 'Khẩu trang y tế 3 lớp, lọc bụi mịn, vi khuẩn hiệu quả', 'Khẩu trang y tế chất lượng cao', 5, '3M', 'SKU003', 45000.00, 50000.00, 10, 'Giảm 10%', 1000, 'in_stock', 4.6, 2500, 5800, 'active', FALSE, FALSE, TRUE),
('Kem chống nắng SPF50+', 'kem-chong-nang-spf50', 'Kem chống nắng bảo vệ da khỏi tia UV, không gây nhờn dính', 'Chống nắng hiệu quả SPF50+', 4, 'La Roche-Posay', 'SKU004', 320000.00, 380000.00, 16, 'Giảm 16%', 150, 'in_stock', 4.7, 420, 980, 'active', TRUE, TRUE, FALSE),
('Máy đo huyết áp điện tử', 'may-do-huyet-ap-dien-tu', 'Máy đo huyết áp tự động, màn hình LCD lớn, dễ sử dụng', 'Thiết bị đo huyết áp tại nhà', 6, 'Omron', 'SKU005', 850000.00, NULL, NULL, NULL, 80, 'in_stock', 4.9, 180, 450, 'active', TRUE, FALSE, FALSE),
('Omega-3 1000mg', 'omega-3-1000mg', 'Viên uống Omega-3 tốt cho tim mạch, não bộ và mắt', 'Bổ sung Omega-3 cho sức khỏe', 3, 'Nature\'s Bounty', 'SKU006', 280000.00, 320000.00, 13, 'Giảm 13%', 200, 'in_stock', 4.6, 320, 750, 'active', FALSE, TRUE, FALSE),
('Nước rửa tay khô 70%', 'nuoc-rua-tay-kho-70', 'Nước rửa tay khô diệt khuẩn 70%, không cần nước', 'Diệt khuẩn tay nhanh chóng', 2, 'Lifebuoy', 'SKU007', 35000.00, NULL, NULL, NULL, 600, 'in_stock', 4.4, 1500, 3200, 'active', FALSE, FALSE, TRUE),
('Vitamin D3 2000IU', 'vitamin-d3-2000iu', 'Bổ sung Vitamin D3 tăng cường hấp thu canxi, tốt cho xương', 'Vitamin D3 cho xương chắc khỏe', 7, 'Solgar', 'SKU008', 220000.00, 250000.00, 12, 'Giảm 12%', 250, 'in_stock', 4.5, 280, 620, 'active', FALSE, FALSE, FALSE),
('Serum vitamin C', 'serum-vitamin-c', 'Serum vitamin C làm sáng da, giảm thâm nám, chống lão hóa', 'Serum làm đẹp da', 4, 'The Ordinary', 'SKU009', 450000.00, 520000.00, 13, 'Giảm 13%', 120, 'in_stock', 4.8, 195, 480, 'active', TRUE, TRUE, FALSE),
('Thuốc ho Prospan', 'thuoc-ho-prospan', 'Sirop ho thảo dược, an toàn cho trẻ em và người lớn', 'Thuốc ho thảo dược', 2, 'Engelhard Arzneimittel', 'SKU010', 125000.00, NULL, NULL, NULL, 400, 'in_stock', 4.7, 680, 1650, 'active', FALSE, FALSE, TRUE);

INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES
(1, '/images/products/paracetamol-500mg-1.jpg', 'Paracetamol 500mg - Hộp thuốc', 1, TRUE),
(1, '/images/products/paracetamol-500mg-2.jpg', 'Paracetamol 500mg - Viên thuốc', 2, FALSE),
(2, '/images/products/vitamin-c-1000mg-1.jpg', 'Vitamin C 1000mg - Lọ thuốc', 1, TRUE),
(2, '/images/products/vitamin-c-1000mg-2.jpg', 'Vitamin C 1000mg - Viên thuốc', 2, FALSE),
(3, '/images/products/khau-trang-y-te-1.jpg', 'Khẩu trang y tế 3 lớp', 1, TRUE),
(3, '/images/products/khau-trang-y-te-2.jpg', 'Khẩu trang y tế - Chi tiết', 2, FALSE),
(4, '/images/products/kem-chong-nang-1.jpg', 'Kem chống nắng SPF50+', 1, TRUE),
(4, '/images/products/kem-chong-nang-2.jpg', 'Kem chống nắng - Bao bì', 2, FALSE),
(5, '/images/products/may-do-huyet-ap-1.jpg', 'Máy đo huyết áp điện tử', 1, TRUE),
(5, '/images/products/may-do-huyet-ap-2.jpg', 'Máy đo huyết áp - Sử dụng', 2, FALSE),
(6, '/images/products/omega-3-1.jpg', 'Omega-3 1000mg', 1, TRUE),
(7, '/images/products/nuoc-rua-tay-1.jpg', 'Nước rửa tay khô 70%', 1, TRUE),
(8, '/images/products/vitamin-d3-1.jpg', 'Vitamin D3 2000IU', 1, TRUE),
(9, '/images/products/serum-vitamin-c-1.jpg', 'Serum vitamin C', 1, TRUE),
(10, '/images/products/thuoc-ho-prospan-1.jpg', 'Thuốc ho Prospan', 1, TRUE);

INSERT INTO addresses (user_id, full_name, phone, province, district, ward, street_address, postal_code, is_default) VALUES
(2, 'Nguyễn Văn An', '0912345678', 'Hồ Chí Minh', 'Quận 1', 'Phường Bến Nghé', '123 Đường Nguyễn Huệ', '700000', TRUE),
(2, 'Nguyễn Văn An', '0912345678', 'Hồ Chí Minh', 'Quận 3', 'Phường Võ Thị Sáu', '456 Đường Lê Văn Sỹ', '700000', FALSE),
(3, 'Trần Thị Bình', '0923456789', 'Hà Nội', 'Quận Hoàn Kiếm', 'Phường Hàng Bông', '789 Phố Hàng Bông', '100000', TRUE),
(4, 'Lê Văn Cường', '0934567890', 'Đà Nẵng', 'Quận Hải Châu', 'Phường Thanh Bình', '321 Đường Trần Phú', '550000', TRUE),
(5, 'Phạm Thị Dung', '0945678901', 'Hồ Chí Minh', 'Quận 7', 'Phường Tân Phú', '654 Đường Nguyễn Thị Thập', '700000', TRUE),
(6, 'Hoàng Thị Mai', '0956789012', 'Hà Nội', 'Quận Cầu Giấy', 'Phường Dịch Vọng', '789 Đường Hoàng Quốc Việt', '100000', TRUE),
(7, 'Trương Minh Tuấn', '0967890123', 'Hồ Chí Minh', 'Quận Bình Thạnh', 'Phường 25', '456 Đường Xô Viết Nghệ Tĩnh', '700000', TRUE),
(8, 'Võ Thị Hương', '0978901234', 'Đà Nẵng', 'Quận Thanh Khê', 'Phường Thanh Khê Tây', '321 Đường Lê Độ', '550000', TRUE),
(9, 'Đỗ Văn Đức', '0989012345', 'Hà Nội', 'Quận Đống Đa', 'Phường Láng Thượng', '654 Đường Láng', '100000', TRUE),
(10, 'Bùi Thị Lan', '0990123456', 'Hồ Chí Minh', 'Quận Tân Bình', 'Phường 15', '987 Đường Cộng Hòa', '700000', TRUE),
(11, 'Phan Văn Hùng', '0901237890', 'Hải Phòng', 'Quận Hải An', 'Phường Đằng Hải', '159 Đường Trần Phú', '180000', TRUE),
(12, 'Ngô Thị Hoa', '0912348901', 'Hồ Chí Minh', 'Quận Phú Nhuận', 'Phường 10', '753 Đường Phan Đình Phùng', '700000', TRUE),
(13, 'Lý Văn Nam', '0923459012', 'Cần Thơ', 'Quận Ninh Kiều', 'Phường An Hòa', '246 Đường 3 Tháng 2', '940000', TRUE),
(14, 'Đặng Thị Linh', '0934560123', 'Hà Nội', 'Quận Hai Bà Trưng', 'Phường Bạch Đằng', '852 Đường Bạch Đằng', '100000', TRUE),
(15, 'Dương Minh Khoa', '0945671234', 'Hồ Chí Minh', 'Quận 2', 'Phường An Phú', '741 Đường Nguyễn Thị Định', '700000', TRUE),
(16, 'Nguyễn Thị Ngọc', '0956782345', 'Đà Nẵng', 'Quận Sơn Trà', 'Phường Mân Thái', '369 Đường Hoàng Sa', '550000', TRUE),
(17, 'Trần Văn Phong', '0967893456', 'Hà Nội', 'Quận Ba Đình', 'Phường Điện Biên', '258 Đường Điện Biên Phủ', '100000', TRUE),
(18, 'Lê Thị Thanh', '0978904567', 'Hồ Chí Minh', 'Quận 10', 'Phường 15', '147 Đường Lý Thường Kiệt', '700000', TRUE),
(19, 'Phạm Minh Quang', '0989015678', 'Hải Phòng', 'Quận Lê Chân', 'Phường An Biên', '963 Đường Lạch Tray', '180000', TRUE),
(20, 'Hoàng Thị Hạnh', '0990126789', 'Hà Nội', 'Quận Tây Hồ', 'Phường Xuân La', '741 Đường Xuân La', '100000', TRUE),
(21, 'Vũ Văn Sơn', '0901238910', 'Hồ Chí Minh', 'Quận Gò Vấp', 'Phường 16', '852 Đường Quang Trung', '700000', TRUE),
(22, 'Đinh Thị Nga', '0912349021', 'Đà Nẵng', 'Quận Ngũ Hành Sơn', 'Phường Mỹ An', '159 Đường Võ Nguyên Giáp', '550000', TRUE);

INSERT INTO coupons (code, name, description, discount_type, discount_value, min_purchase, max_discount, usage_limit, used_count, valid_from, valid_until, status) VALUES
('WELCOME10', 'Giảm 10% cho khách hàng mới', 'Áp dụng cho đơn hàng đầu tiên', 'percentage', 10.00, 100000.00, 50000.00, 1000, 45, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'active'),
('FREESHIP', 'Miễn phí vận chuyển', 'Miễn phí ship cho đơn từ 200k', 'fixed', 30000.00, 200000.00, 30000.00, NULL, 120, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'active'),
('SALE20', 'Giảm 20% đơn hàng', 'Giảm 20% cho đơn hàng từ 500k', 'percentage', 20.00, 500000.00, 200000.00, 500, 89, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'active'),
('VIP50K', 'Giảm 50.000đ', 'Giảm 50k cho đơn từ 300k', 'fixed', 50000.00, 300000.00, 50000.00, 2000, 234, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'active'),
('NEWYEAR15', 'Tết giảm 15%', 'Chương trình khuyến mãi Tết', 'percentage', 15.00, 150000.00, 100000.00, NULL, 567, '2024-01-01 00:00:00', '2024-12-31 23:59:59', 'active');

INSERT INTO orders (order_code, user_id, address_id, total_amount, shipping_fee, discount_amount, final_amount, payment_method, payment_status, shipping_method, shipping_status, status, note) VALUES
('ORD2024001', 2, 1, 400000.00, 30000.00, 40000.00, 390000.00, 'COD', 'paid', 'Giao hàng nhanh', 'delivered', 'delivered', 'Giao trong giờ hành chính'),
('ORD2024002', 3, 3, 750000.00, 30000.00, 150000.00, 630000.00, 'bank_transfer', 'paid', 'Giao hàng tiêu chuẩn', 'shipping', 'shipping', NULL),
('ORD2024003', 4, 4, 280000.00, 30000.00, 0.00, 310000.00, 'COD', 'pending', 'Giao hàng nhanh', 'pending', 'pending', 'Giao trước 18h'),
('ORD2024004', 2, 2, 125000.00, 30000.00, 0.00, 155000.00, 'e_wallet', 'paid', 'Giao hàng tiêu chuẩn', 'confirmed', 'confirmed', NULL),
('ORD2024005', 5, 5, 570000.00, 0.00, 57000.00, 513000.00, 'credit_card', 'paid', 'Giao hàng nhanh', 'delivered', 'delivered', 'Đã sử dụng mã FREESHIP');

INSERT INTO order_items (order_id, product_id, product_name, product_image, price, quantity, subtotal) VALUES
(1, 1, 'Paracetamol 500mg', '/images/products/paracetamol-500mg-1.jpg', 25000.00, 4, 100000.00),
(1, 3, 'Khẩu trang y tế 3 lớp', '/images/products/khau-trang-y-te-1.jpg', 45000.00, 2, 90000.00),
(1, 7, 'Nước rửa tay khô 70%', '/images/products/nuoc-rua-tay-1.jpg', 35000.00, 6, 210000.00),
(2, 2, 'Vitamin C 1000mg', '/images/products/vitamin-c-1000mg-1.jpg', 150000.00, 2, 300000.00),
(2, 4, 'Kem chống nắng SPF50+', '/images/products/kem-chong-nang-1.jpg', 320000.00, 1, 320000.00),
(2, 9, 'Serum vitamin C', '/images/products/serum-vitamin-c-1.jpg', 450000.00, 1, 450000.00),
(3, 6, 'Omega-3 1000mg', '/images/products/omega-3-1.jpg', 280000.00, 1, 280000.00),
(4, 10, 'Thuốc ho Prospan', '/images/products/thuoc-ho-prospan-1.jpg', 125000.00, 1, 125000.00),
(5, 5, 'Máy đo huyết áp điện tử', '/images/products/may-do-huyet-ap-1.jpg', 850000.00, 1, 850000.00),
(5, 8, 'Vitamin D3 2000IU', '/images/products/vitamin-d3-1.jpg', 220000.00, 1, 220000.00);

INSERT INTO order_timeline (order_id, status, label, description) VALUES
(1, 'pending', 'Đơn hàng đã được đặt', 'Khách hàng đã đặt hàng thành công'),
(1, 'confirmed', 'Đơn hàng đã được xác nhận', 'Nhân viên đã xác nhận đơn hàng'),
(1, 'processing', 'Đang chuẩn bị hàng', 'Đang lấy hàng từ kho'),
(1, 'shipping', 'Đang giao hàng', 'Đơn hàng đang được vận chuyển'),
(1, 'delivered', 'Đã giao hàng', 'Đơn hàng đã được giao thành công'),
(2, 'pending', 'Đơn hàng đã được đặt', 'Khách hàng đã đặt hàng thành công'),
(2, 'confirmed', 'Đơn hàng đã được xác nhận', 'Nhân viên đã xác nhận đơn hàng'),
(2, 'processing', 'Đang chuẩn bị hàng', 'Đang lấy hàng từ kho'),
(2, 'shipping', 'Đang giao hàng', 'Đơn hàng đang được vận chuyển'),
(3, 'pending', 'Đơn hàng đã được đặt', 'Khách hàng đã đặt hàng thành công'),
(4, 'pending', 'Đơn hàng đã được đặt', 'Khách hàng đã đặt hàng thành công'),
(4, 'confirmed', 'Đơn hàng đã được xác nhận', 'Nhân viên đã xác nhận đơn hàng'),
(5, 'pending', 'Đơn hàng đã được đặt', 'Khách hàng đã đặt hàng thành công'),
(5, 'confirmed', 'Đơn hàng đã được xác nhận', 'Nhân viên đã xác nhận đơn hàng'),
(5, 'processing', 'Đang chuẩn bị hàng', 'Đang lấy hàng từ kho'),
(5, 'shipping', 'Đang giao hàng', 'Đơn hàng đang được vận chuyển'),
(5, 'delivered', 'Đã giao hàng', 'Đơn hàng đã được giao thành công');

INSERT INTO cart (user_id, product_id, quantity) VALUES
(2, 2, 1),
(2, 6, 2),
(3, 4, 1),
(3, 9, 1),
(4, 1, 3),
(4, 3, 5),
(4, 7, 2),
(5, 5, 1),
(5, 8, 1);

INSERT INTO posts (title, slug, excerpt, content, cover_image, category, author, tags, read_minutes, view_count, status, published_at) VALUES
('10 cách tăng cường sức đề kháng tự nhiên', '10-cach-tang-cuong-suc-de-khang-tu-nhien', 'Khám phá các phương pháp đơn giản để tăng cường hệ miễn dịch một cách tự nhiên và hiệu quả', '<p>Trong thời đại hiện nay, việc tăng cường sức đề kháng là vô cùng quan trọng. Dưới đây là 10 cách đơn giản mà bạn có thể áp dụng ngay hôm nay...</p>', '/images/posts/suc-de-khang.jpg', 'Sức khỏe', 'BS. Nguyễn Văn A', '["sức khỏe", "đề kháng", "miễn dịch"]', 8, 1250, 'published', '2024-01-15 10:00:00'),
('Hướng dẫn sử dụng vitamin C đúng cách', 'huong-dan-su-dung-vitamin-c-dung-cach', 'Vitamin C là dưỡng chất quan trọng nhưng cần sử dụng đúng cách để đạt hiệu quả tối đa', '<p>Vitamin C là một trong những vitamin quan trọng nhất cho cơ thể. Tuy nhiên, không phải ai cũng biết cách sử dụng đúng...</p>', '/images/posts/vitamin-c.jpg', 'Dinh dưỡng', 'ThS. Trần Thị B', '["vitamin", "dinh dưỡng", "sức khỏe"]', 6, 890, 'published', '2024-01-20 14:30:00'),
('Cách chọn khẩu trang y tế chất lượng', 'cach-chon-khau-trang-y-te-chat-luong', 'Hướng dẫn chi tiết cách phân biệt và chọn mua khẩu trang y tế đạt chuẩn', '<p>Khẩu trang y tế là vật dụng không thể thiếu trong cuộc sống hiện đại. Tuy nhiên, làm sao để chọn được sản phẩm chất lượng?...</p>', '/images/posts/khau-trang.jpg', 'Sức khỏe', 'DS. Lê Văn C', '["khẩu trang", "bảo vệ", "sức khỏe"]', 5, 2100, 'published', '2024-02-01 09:00:00'),
('Chăm sóc da mùa hè với kem chống nắng', 'cham-soc-da-mua-he-voi-kem-chong-nang', 'Bí quyết bảo vệ làn da khỏi tác hại của tia UV trong mùa hè nắng nóng', '<p>Mùa hè là thời điểm da dễ bị tổn thương bởi tia UV. Việc sử dụng kem chống nắng đúng cách là vô cùng quan trọng...</p>', '/images/posts/kem-chong-nang.jpg', 'Làm đẹp', 'BS. Phạm Thị D', '["chăm sóc da", "kem chống nắng", "làm đẹp"]', 7, 1560, 'published', '2024-02-10 11:00:00'),
('Tầm quan trọng của Omega-3 đối với sức khỏe', 'tam-quan-trong-cua-omega-3-doi-voi-suc-khoe', 'Omega-3 là axit béo thiết yếu có nhiều lợi ích cho tim mạch, não bộ và mắt', '<p>Omega-3 là một trong những dưỡng chất quan trọng nhất mà cơ thể không thể tự sản xuất. Hãy cùng tìm hiểu về lợi ích của nó...</p>', '/images/posts/omega-3.jpg', 'Dinh dưỡng', 'ThS. Nguyễn Thị E', '["omega-3", "dinh dưỡng", "sức khỏe tim mạch"]', 9, 980, 'published', '2024-02-15 16:00:00');

INSERT INTO appointments (appointment_code, user_id, service_id, service_name, appointment_date, appointment_time, customer_name, customer_phone, customer_email, note, status) VALUES
('APT2024001', 2, 1, 'Đo huyết áp – tư vấn tim mạch', '2024-03-01', '09:00:00', 'Nguyễn Văn An', '0912345678', 'nguyenvanan@gmail.com', 'Kiểm tra định kỳ', 'confirmed'),
('APT2024002', 3, 2, 'Đo đường huyết – HbA1c', '2024-03-02', '10:30:00', 'Trần Thị Bình', '0923456789', 'tranthibinh@gmail.com', NULL, 'pending'),
('APT2024003', NULL, 3, 'Đo BMI – tư vấn dinh dưỡng', '2024-03-03', '14:00:00', 'Lê Văn Cường', '0934567890', 'levancuong@gmail.com', 'Tư vấn chế độ ăn', 'confirmed'),
('APT2024004', 4, 4, 'Chăm sóc da – soi da', '2024-03-05', '15:30:00', 'Lê Văn Cường', '0934567890', 'levancuong@gmail.com', NULL, 'pending'),
('APT2024005', 5, 1, 'Đo huyết áp – tư vấn tim mạch', '2024-03-06', '08:30:00', 'Phạm Thị Dung', '0945678901', 'phamthidung@gmail.com', 'Kiểm tra sức khỏe', 'completed');

INSERT INTO reviews (product_id, user_id, rating, title, comment, status) VALUES
(1, 2, 5, 'Sản phẩm tốt', 'Thuốc hiệu quả, giảm đau nhanh. Đóng gói cẩn thận, giao hàng nhanh.', 'approved'),
(1, 3, 4, 'Hài lòng', 'Sản phẩm đúng như mô tả, giá cả hợp lý.', 'approved'),
(2, 2, 5, 'Vitamin C chất lượng', 'Uống đều đặn thấy sức đề kháng tốt hơn rõ rệt. Sẽ mua lại.', 'approved'),
(3, 4, 4, 'Khẩu trang tốt', 'Chất lượng tốt, vừa vặn, không gây khó chịu khi đeo.', 'approved'),
(4, 3, 5, 'Kem chống nắng tuyệt vời', 'Kem thấm nhanh, không nhờn dính, bảo vệ da tốt. Rất hài lòng!', 'approved'),
(5, 5, 5, 'Máy đo chính xác', 'Máy dễ sử dụng, đo chính xác. Phù hợp để theo dõi sức khỏe tại nhà.', 'approved'),
(6, 2, 4, 'Omega-3 tốt', 'Sản phẩm chất lượng, uống thấy cải thiện sức khỏe tim mạch.', 'approved'),
(7, 4, 4, 'Nước rửa tay tiện lợi', 'Tiện lợi, diệt khuẩn tốt, mùi hương dễ chịu.', 'approved'),
(9, 3, 5, 'Serum hiệu quả', 'Da sáng hơn rõ rệt sau 2 tuần sử dụng. Sản phẩm đáng mua!', 'approved'),
(10, 2, 4, 'Thuốc ho hiệu quả', 'Con tôi uống thấy giảm ho nhanh, an toàn cho trẻ em.', 'approved');

INSERT INTO product_comments (product_id, user_id, content, parent_id, status) VALUES
(1, 2, 'Sản phẩm này rất tốt, tôi đã dùng và thấy hiệu quả ngay. Giao hàng cũng nhanh nữa!', NULL, 'approved'),
(1, 3, 'Đúng vậy, tôi cũng thấy sản phẩm này rất hiệu quả. Giá cả cũng hợp lý.', NULL, 'approved'),
(1, 4, 'Cảm ơn bạn đã chia sẻ. Tôi sẽ thử mua sản phẩm này.', 1, 'approved'),
(2, 2, 'Vitamin C này chất lượng tốt, uống đều đặn thấy sức đề kháng tăng rõ rệt.', NULL, 'approved'),
(2, 3, 'Bạn uống như thế nào vậy? Một ngày bao nhiêu viên?', 4, 'approved'),
(2, 2, 'Tôi uống 1 viên mỗi ngày sau bữa sáng. Bạn có thể tham khảo hướng dẫn trên bao bì nhé.', 5, 'approved'),
(3, 4, 'Khẩu trang này vừa vặn, không gây khó chịu khi đeo lâu. Chất lượng tốt!', NULL, 'approved'),
(4, 3, 'Kem chống nắng này thấm nhanh, không nhờn dính. Rất phù hợp cho da dầu như tôi.', NULL, 'approved'),
(4, 5, 'Bạn dùng SPF bao nhiêu? Có bị bết dính không?', 8, 'approved'),
(5, 5, 'Máy đo huyết áp này rất chính xác và dễ sử dụng. Phù hợp để theo dõi sức khỏe tại nhà.', NULL, 'approved');

INSERT INTO order_coupons (order_id, coupon_id, discount_amount) VALUES
(1, 1, 40000.00),
(2, 3, 150000.00),
(5, 2, 30000.00),
(5, 4, 50000.00);

DELIMITER $$

CREATE FUNCTION GenerateOrderCode() RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE last_number INT DEFAULT 0;
    DECLARE new_code VARCHAR(50);
    
    -- Lấy số thứ tự lớn nhất từ các mã cũ (nếu chưa có thì = 0)
    -- Format: ORD + yyMM + NNNN (ví dụ: ORD25110001)
    -- SUBSTRING từ vị trí 8 (sau 'ORD' + 4 ký tự yyMM) để lấy phần số thứ tự
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(order_code, 8) AS UNSIGNED)), 
        0
    ) INTO last_number
    FROM orders 
    WHERE order_code LIKE CONCAT('ORD', DATE_FORMAT(NOW(), '%y%m'), '%');
    
    -- Tăng lên 1 và định dạng lại 4 chữ số (0001, 0123, 9999,...)
    SET last_number = last_number + 1;
    
    -- Tạo mã mới: ORD + yyMM + số thứ tự 4 chữ số
    -- Ví dụ: ORD25110001 cho tháng 11/2025, số thứ tự 1
    SET new_code = CONCAT(
        'ORD',
        DATE_FORMAT(NOW(), '%y%m'),        -- ví dụ: 2511 cho tháng 11/2025
        LPAD(last_number, 4, '0')          -- 0001, 0002,...
    );
    
    RETURN new_code;
END$$

CREATE FUNCTION GenerateAppointmentCode() RETURNS VARCHAR(50)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE last_number INT DEFAULT 0;
    DECLARE new_code VARCHAR(50);
    
    -- Lấy số thứ tự lớn nhất từ các mã cũ (nếu chưa có thì = 0)
    -- Format: APT + yyMM + NNNN (ví dụ: APT25110001)
    -- SUBSTRING từ vị trí 8 (sau 'APT' + 4 ký tự yyMM) để lấy phần số thứ tự
    SELECT COALESCE(
        MAX(CAST(SUBSTRING(appointment_code, 8) AS UNSIGNED)), 
        0
    ) INTO last_number
    FROM appointments 
    WHERE appointment_code LIKE CONCAT('APT', DATE_FORMAT(NOW(), '%y%m'), '%');
    
    -- Tăng lên 1 và định dạng lại 4 chữ số (0001, 0123, 9999,...)
    SET last_number = last_number + 1;
    
    -- Tạo mã mới: APT + yyMM + số thứ tự 4 chữ số
    -- Ví dụ: APT25110001 cho tháng 11/2025, số thứ tự 1
    SET new_code = CONCAT(
        'APT',
        DATE_FORMAT(NOW(), '%y%m'),        -- ví dụ: 2511 cho tháng 11/2025
        LPAD(last_number, 4, '0')          -- 0001, 0002,...
    );
    
    RETURN new_code;
END$$

CREATE FUNCTION GetProductRating(product_id_param BIGINT) RETURNS DECIMAL(3,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE avg_rating DECIMAL(3,2);
    SELECT COALESCE(AVG(rating), 0.00) INTO avg_rating
    FROM reviews
    WHERE product_id = product_id_param AND status = 'approved';
    RETURN avg_rating;
END$$

CREATE FUNCTION CheckCouponValid(
    coupon_code_param VARCHAR(50),
    order_amount DECIMAL(12,2)
) RETURNS DECIMAL(12,2)
READS SQL DATA
DETERMINISTIC
BEGIN
    DECLARE discount_amount DECIMAL(12,2) DEFAULT 0;
    DECLARE coupon_discount_type VARCHAR(20);
    DECLARE coupon_discount_value DECIMAL(10,2);
    DECLARE coupon_min_purchase DECIMAL(12,2);
    DECLARE coupon_max_discount DECIMAL(12,2);
    DECLARE coupon_usage_limit INT;
    DECLARE coupon_used_count INT;
    DECLARE coupon_status VARCHAR(20);
    DECLARE coupon_valid_from TIMESTAMP;
    DECLARE coupon_valid_until TIMESTAMP;
    SELECT
        discount_type, discount_value, min_purchase, max_discount,
        usage_limit, used_count, status, valid_from, valid_until
    INTO
        coupon_discount_type, coupon_discount_value, coupon_min_purchase,
        coupon_max_discount, coupon_usage_limit, coupon_used_count,
        coupon_status, coupon_valid_from, coupon_valid_until
    FROM coupons
    WHERE code = coupon_code_param;
    IF coupon_discount_type IS NULL THEN
        RETURN 0;
    END IF;
    IF coupon_status != 'active' THEN
        RETURN 0;
    END IF;
    IF NOW() < coupon_valid_from OR NOW() > coupon_valid_until THEN
        RETURN 0;
    END IF;
    IF coupon_usage_limit IS NOT NULL AND coupon_used_count >= coupon_usage_limit THEN
        RETURN 0;
    END IF;
    IF order_amount < coupon_min_purchase THEN
        RETURN 0;
    END IF;
    IF coupon_discount_type = 'percentage' THEN
        SET discount_amount = order_amount * coupon_discount_value / 100;
        IF coupon_max_discount IS NOT NULL AND discount_amount > coupon_max_discount THEN
            SET discount_amount = coupon_max_discount;
        END IF;
    ELSE
        SET discount_amount = coupon_discount_value;
    END IF;
    RETURN discount_amount;
END$$

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

CREATE PROCEDURE UpdateProductRating(IN p_product_id BIGINT)
BEGIN
    DECLARE v_avg_rating DECIMAL(3,2);
    SELECT COALESCE(AVG(rating), 0.00) INTO v_avg_rating
    FROM reviews
    WHERE product_id = p_product_id AND status = 'approved';
    UPDATE products
    SET rating = v_avg_rating
    WHERE id = p_product_id;
END$$

CREATE PROCEDURE GetBestSellingProducts(
    IN p_limit INT,
    IN p_category_id BIGINT
)
BEGIN
    SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.old_price,
        p.sale_percent,
        p.image,
        p.rating,
        p.sold_count,
        p.view_count,
        c.name AS category_name
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active'
        AND (p_category_id IS NULL OR p.category_id = p_category_id)
    ORDER BY p.sold_count DESC, p.rating DESC
    LIMIT p_limit;
END$$

CREATE PROCEDURE GetNewProducts(IN p_limit INT)
BEGIN
    SELECT
        p.id,
        p.name,
        p.slug,
        p.price,
        p.old_price,
        p.sale_percent,
        p.image,
        p.rating,
        p.sold_count,
        c.name AS category_name
    FROM products p
    INNER JOIN categories c ON p.category_id = c.id
    WHERE p.status = 'active' AND p.is_new = TRUE
    ORDER BY p.created_at DESC
    LIMIT p_limit;
END$$

CREATE PROCEDURE GetRevenueByDateRange(
    IN p_start_date DATE,
    IN p_end_date DATE
)
BEGIN
    SELECT
        DATE(created_at) AS order_date,
        COUNT(*) AS total_orders,
        SUM(final_amount) AS total_revenue,
        SUM(shipping_fee) AS total_shipping_fee,
        SUM(discount_amount) AS total_discount,
        AVG(final_amount) AS avg_order_value
    FROM orders
    WHERE DATE(created_at) BETWEEN p_start_date AND p_end_date
        AND status NOT IN ('cancelled', 'refunded')
    GROUP BY DATE(created_at)
    ORDER BY order_date DESC;
END$$

CREATE PROCEDURE GetOrdersByStatus(
    IN p_user_id BIGINT,
    IN p_status VARCHAR(50),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SELECT
        o.id,
        o.order_code,
        o.total_amount,
        o.final_amount,
        o.payment_method,
        o.payment_status,
        o.shipping_status,
        o.status,
        o.created_at,
        a.full_name,
        a.phone,
        a.street_address,
        a.district,
        a.province
    FROM orders o
    INNER JOIN addresses a ON o.address_id = a.id
    WHERE (p_user_id IS NULL OR o.user_id = p_user_id)
        AND (p_status IS NULL OR o.status = p_status)
    ORDER BY o.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END$$

CREATE PROCEDURE SearchProducts(
    IN p_search_term VARCHAR(255),
    IN p_category_id BIGINT,
    IN p_min_price DECIMAL(12,2),
    IN p_max_price DECIMAL(12,2),
    IN p_sort_by VARCHAR(50),
    IN p_limit INT,
    IN p_offset INT
)
BEGIN
    SET @sql = CONCAT('
        SELECT
            p.id,
            p.name,
            p.slug,
            p.price,
            p.old_price,
            p.sale_percent,
            p.image,
            p.rating,
            p.sold_count,
            p.stock_status,
            c.name AS category_name
        FROM products p
        INNER JOIN categories c ON p.category_id = c.id
        WHERE p.status = \'active\'
            AND (\'', p_search_term, '\' IS NULL OR \'', p_search_term, '\' = \'\' OR
                 MATCH(p.name, p.description, p.short_description) AGAINST(\'', p_search_term, '\' IN NATURAL LANGUAGE MODE))
            AND (', IFNULL(p_category_id, 'NULL'), ' IS NULL OR p.category_id = ', IFNULL(p_category_id, 'NULL'), ')
            AND (', IFNULL(p_min_price, 'NULL'), ' IS NULL OR p.price >= ', IFNULL(p_min_price, 'NULL'), ')
            AND (', IFNULL(p_max_price, 'NULL'), ' IS NULL OR p.price <= ', IFNULL(p_max_price, 'NULL'), ')
        ORDER BY ',
        CASE p_sort_by
            WHEN 'price_asc' THEN 'p.price ASC'
            WHEN 'price_desc' THEN 'p.price DESC'
            WHEN 'rating' THEN 'p.rating DESC'
            WHEN 'sold' THEN 'p.sold_count DESC'
            WHEN 'newest' THEN 'p.created_at DESC'
            ELSE 'p.created_at DESC'
        END,
        ' LIMIT ', p_limit, ' OFFSET ', p_offset
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
END$$

CREATE PROCEDURE UpdateOrderStatus(
    IN p_order_id BIGINT,
    IN p_new_status VARCHAR(50),
    IN p_label VARCHAR(255),
    IN p_description TEXT
)
BEGIN
    DECLARE v_old_status VARCHAR(50);
    SELECT status INTO v_old_status FROM orders WHERE id = p_order_id;
    UPDATE orders
    SET status = p_new_status,
        updated_at = NOW()
    WHERE id = p_order_id;
    IF p_new_status = 'delivered' THEN
        UPDATE orders SET payment_status = 'paid' WHERE id = p_order_id;
    END IF;
    IF p_new_status = 'shipping' THEN
        UPDATE orders SET shipping_status = 'shipping' WHERE id = p_order_id;
    ELSEIF p_new_status = 'delivered' THEN
        UPDATE orders SET shipping_status = 'delivered' WHERE id = p_order_id;
    ELSEIF p_new_status = 'cancelled' THEN
        UPDATE orders SET shipping_status = 'cancelled' WHERE id = p_order_id;
    END IF;
    INSERT INTO order_timeline (order_id, status, label, description)
    VALUES (p_order_id, p_new_status, p_label, p_description);
END$$

DELIMITER ;
