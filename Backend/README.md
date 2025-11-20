# Backend API - PharmaCity

Backend server sử dụng Node.js, Express và MySQL.

## Thông tin kết nối Database

- **Host:** localhost
- **Port:** 3306
- **Username:** root
- **Password:** 12345678
- **Database:** pharmacity_db

## Yêu cầu

- Node.js (v18 trở lên)
- MySQL Server (v8.0 trở lên)
- npm hoặc yarn

## Cài đặt

1. **Cài đặt dependencies:**
```bash
npm install
```

2. **Cấu hình database:**
   - Tạo file `.env` trong thư mục `Backend` với nội dung:
     ```
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=12345678
     DB_NAME=pharmacity_db
     PORT=3000
     NODE_ENV=development
     JWT_SECRET=your-secret-key-change-in-production
     ```

3. **Tạo database:**
   - Mở MySQL Workbench hoặc MySQL Command Line
   - Chạy file SQL để tạo database và các bảng:
     ```bash
     mysql -u root -p < database/schema.sql
     ```
   - Hoặc mở MySQL Workbench và chạy file `database/schema.sql`
   - Hoặc tạo database thủ công:
     ```sql
     CREATE DATABASE pharmacity_db;
     ```

4. **Chạy server:**
```bash
# Development mode (với nodemon - tự động restart)
npm run dev

# Production mode
npm start
```

## Kiểm tra kết nối

### Kiểm tra kết nối database:
```bash
npm run test-db
```

### Kiểm tra server:
Sau khi khởi động server, truy cập:
- Health check: http://localhost:3000/api/health
- API info: http://localhost:3000/api

## Cấu trúc thư mục

```
Backend/
├── config/
│   └── database.js      # Cấu hình kết nối MySQL
├── database/
│   └── schema.sql       # SQL script tạo database và tables
├── routes/              # API routes (sẽ thêm sau)
├── controllers/         # Controllers (sẽ thêm sau)
├── models/              # Database models (sẽ thêm sau)
├── middleware/          # Custom middleware (sẽ thêm sau)
├── scripts/
│   └── test-connection.js  # Script test kết nối
├── .env                 # Environment variables (không commit)
├── server.js            # Entry point
└── package.json
```

## Database Connection

Server sử dụng connection pool để quản lý kết nối MySQL hiệu quả. Thông tin kết nối được lấy từ file `.env`.

## API Endpoints

### Health Check
- `GET /api/health` - Kiểm tra trạng thái server và database

### API Info
- `GET /api` - Thông tin về API

## Lưu ý

- Đảm bảo MySQL server đang chạy trước khi start backend
- File `.env` không được commit lên git (đã có trong .gitignore)
- Thay đổi `JWT_SECRET` trong production environment

