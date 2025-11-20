# Hướng dẫn kết nối Database

## Thông tin kết nối

Dựa trên cấu hình của bạn:
- **Host:** localhost
- **Port:** 3306
- **Username:** root
- **Password:** 12345678
- **Database:** pharmacity_db

## Bước 1: Cài đặt dependencies

Mở terminal trong thư mục `Backend` và chạy:
```bash
npm install
```

## Bước 2: Tạo file .env

Tạo file `.env` trong thư mục `Backend` với nội dung sau:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=12345678
DB_NAME=pharmacity_db
PORT=3000
NODE_ENV=development
JWT_SECRET=your-secret-key-change-in-production
```

## Bước 3: Tạo Database

### Cách 1: Sử dụng MySQL Workbench (Khuyến nghị)
1. Mở MySQL Workbench
2. Kết nối tới MySQL server (localhost:3306, user: root, password: 12345678)
3. Mở file `database/schema.sql` trong MySQL Workbench
4. Chạy toàn bộ script (Execute hoặc Ctrl+Shift+Enter)

### Cách 2: Sử dụng Command Line
```bash
mysql -u root -p12345678 < database/schema.sql
```

### Cách 3: Tạo thủ công
1. Mở MySQL Workbench hoặc MySQL Command Line
2. Kết nối với: user: root, password: 12345678
3. Chạy lệnh:
```sql
CREATE DATABASE pharmacity_db;
```
4. Sau đó chạy các lệnh CREATE TABLE trong file `database/schema.sql`

## Bước 4: Kiểm tra kết nối

Chạy lệnh để kiểm tra kết nối:
```bash
npm run test-db
```

Nếu thấy thông báo "✅ Kết nối database thành công!" thì bạn đã cấu hình đúng.

## Bước 5: Khởi động Server

```bash
# Development mode (tự động restart khi có thay đổi)
npm run dev

# Hoặc Production mode
npm start
```

Server sẽ chạy tại: http://localhost:3000

## Kiểm tra Server

Mở trình duyệt và truy cập:
- http://localhost:3000/api/health - Kiểm tra trạng thái server và database
- http://localhost:3000/api - Thông tin về API

## Xử lý lỗi

### Lỗi: "Access denied for user 'root'@'localhost'"
- Kiểm tra mật khẩu MySQL là `12345678` trong file `.env`
- Đảm bảo MySQL server đang chạy

### Lỗi: "Unknown database 'pharmacity_db'"
- Chạy file `database/schema.sql` để tạo database
- Hoặc tạo database thủ công: `CREATE DATABASE pharmacity_db;`

### Lỗi: "Can't connect to MySQL server"
- Kiểm tra MySQL server đang chạy
- Kiểm tra port 3306 có đúng không
- Kiểm tra firewall có chặn kết nối không

