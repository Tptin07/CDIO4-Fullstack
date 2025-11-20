-- Backend/database/create_notifications_table.sql
-- Migration script to create notifications table

CREATE TABLE IF NOT EXISTS notifications (
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

