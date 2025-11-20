# Script Insert Dữ Liệu Mẫu Cho Thống Kê

## Mô tả
Script này tạo dữ liệu mẫu để test các biểu đồ và thống kê trong Admin Dashboard.

## Dữ liệu được tạo

### 1. Đơn hàng (Orders)
- **8 tuần gần nhất**: 2-5 đơn hàng/tuần
- **12 tháng gần nhất**: 5-15 đơn hàng/tháng  
- **5 năm gần nhất**: 20-50 đơn hàng/năm
- Tổng cộng: ~289 đơn hàng với các trạng thái khác nhau (delivered, shipping, confirmed)

### 2. View Count
- Cập nhật `view_count` cho tất cả sản phẩm (100-5100 views)

### 3. Cart Items
- Mỗi user có 1-3 sản phẩm trong giỏ hàng
- Dùng để tính "Sản phẩm yêu thích"

### 4. Order Items
- Mỗi đơn hàng có 1-3 sản phẩm
- Tự động cập nhật `sold_count` cho sản phẩm

## Cách chạy

### Cách 1: Sử dụng npm script
```bash
cd Backend
npm run insert-sample-stats
```

### Cách 2: Chạy trực tiếp
```bash
cd Backend
node scripts/insert-sample-statistics-data.js
```

## Lưu ý

1. **Yêu cầu**: Database phải có ít nhất:
   - 1 user (customer)
   - 1 product (active)
   - 1 address

2. **Dữ liệu cũ**: Script sẽ:
   - Xóa tất cả cart items cũ
   - Giữ nguyên các đơn hàng cũ (không xóa)
   - Thêm đơn hàng mới vào

3. **Lỗi có thể gặp**:
   - Nếu `product_image` là base64 quá dài → tự động chuyển sang placeholder
   - Nếu `order_code` trùng → tự động tạo code mới

## Kết quả mong đợi

Sau khi chạy script, bạn sẽ có:
- ✅ ~200-300 đơn hàng với ngày tháng phân bố đều
- ✅ Doanh thu tổng: ~100-200 triệu VNĐ
- ✅ View count cho tất cả sản phẩm
- ✅ Cart items để test "Sản phẩm yêu thích"

## Test biểu đồ

Sau khi chạy script, vào Admin Dashboard:
1. Chọn tab **"Báo cáo thống kê"**
2. Thử các bộ lọc:
   - **Theo tuần**: Xem 8 tuần gần nhất
   - **Theo tháng**: Xem 12 tháng gần nhất
   - **Theo năm**: Xem 5 năm gần nhất
3. Kiểm tra các biểu đồ:
   - ✅ Biểu đồ cột: Doanh thu theo kỳ
   - ✅ Biểu đồ tròn: Sản phẩm bán chạy
   - ✅ Biểu đồ tròn: Sản phẩm được xem nhiều
   - ✅ Biểu đồ tròn: Sản phẩm yêu thích
   - ✅ Biểu đồ tròn: Lượt truy cập theo danh mục

## Xóa dữ liệu mẫu (nếu cần)

Nếu muốn xóa dữ liệu mẫu đã tạo:

```sql
-- Xóa đơn hàng mẫu (cẩn thận, sẽ xóa luôn order_items và order_timeline)
DELETE FROM orders WHERE order_code LIKE 'ORD%' AND created_at > '2024-01-01';

-- Reset view_count
UPDATE products SET view_count = 0;

-- Xóa cart items
DELETE FROM cart;

-- Reset sold_count (nếu muốn)
UPDATE products SET sold_count = 0;
```

