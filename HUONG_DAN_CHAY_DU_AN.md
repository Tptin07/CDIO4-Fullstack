# Hướng Dẫn Chạy Dự Án PharmaCity

Hướng dẫn chi tiết để clone và chạy dự án PharmaCity từ GitHub.

## 📋 Yêu Cầu Hệ Thống

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

- **Node.js** (phiên bản 18 trở lên) - [Download tại đây](https://nodejs.org/)
- **MySQL Server** (phiên bản 8.0 trở lên) - [Download tại đây](https://dev.mysql.com/downloads/mysql/)
- **npm** hoặc **yarn** (đi kèm với Node.js)
- **Git** - [Download tại đây](https://git-scm.com/)

## 🚀 Bước 1: Clone Dự Án Từ GitHub

Mở terminal/command prompt và chạy lệnh:

```bash
git clone <URL_REPO_GITHUB>
cd CDIO4
```

Thay `<URL_REPO_GITHUB>` bằng URL thực tế của repository trên GitHub.

## 🗄️ Bước 2: Cài Đặt và Cấu Hình Database

### Cách 1: Sử dụng phpMyAdmin

#### 2.1. Khởi động MySQL và phpMyAdmin

1. Khởi động MySQL Server (thường tự động khởi động cùng Windows hoặc chạy service MySQL)
2. Mở trình duyệt và truy cập: `http://localhost/phpmyadmin` (hoặc port mà bạn đã cấu hình)

#### 2.2. Tạo Database

1. Đăng nhập vào phpMyAdmin với thông tin:

   - **Username:** `root` (hoặc username MySQL của bạn)
   - **Password:** `12345678` (hoặc password MySQL của bạn)

2. Tạo database mới:
   - Click vào tab **"Databases"** ở menu trên
   - Nhập tên database: `pharmacity_db`
   - Chọn **Collation:** `utf8mb4_unicode_ci`
   - Click nút **"Create"**

#### 2.3. Import Schema SQL

1. Chọn database `pharmacity_db` vừa tạo từ danh sách bên trái
2. Click vào tab **"Import"** ở menu trên
3. Click nút **"Choose File"** và chọn file: `Backend/database/schema.sql`
4. Đảm bảo **Format** là `SQL`
5. Click nút **"Go"** ở cuối trang
6. Đợi quá trình import hoàn tất (có thể mất vài phút)

#### 2.4. Kiểm tra

1. Sau khi import xong, kiểm tra các bảng đã được tạo:
   - Click vào database `pharmacity_db` ở menu bên trái
   - Bạn sẽ thấy danh sách các bảng như: `users`, `products`, `categories`, `orders`, v.v.

---

### Cách 2: Sử dụng MySQL Workbench

#### 2.1. Khởi động MySQL Workbench

1. Mở ứng dụng **MySQL Workbench**
2. Kết nối đến MySQL Server:
   - Click vào connection đã có sẵn (thường là `Local instance MySQL`)
   - Hoặc tạo connection mới với thông tin:
     - **Hostname:** `localhost`
     - **Port:** `3306`
     - **Username:** `root`
     - **Password:** `12345678` (hoặc password MySQL của bạn)

#### 2.2. Tạo Database

1. Sau khi kết nối thành công, mở một query tab mới (hoặc nhấn `Ctrl+T`)
2. Chạy lệnh SQL sau để tạo database:

```sql
CREATE DATABASE IF NOT EXISTS pharmacity_db
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

3. Chọn database vừa tạo:
   - Click vào dropdown database ở thanh toolbar (hoặc chạy lệnh `USE pharmacity_db;`)

#### 2.3. Import Schema SQL

**Phương pháp 1: Chạy file SQL trực tiếp**

1. Mở file `Backend/database/schema.sql` trong MySQL Workbench:
   - File → Open SQL Script → Chọn file `Backend/database/schema.sql`
2. Đảm bảo đã chọn database `pharmacity_db` (kiểm tra dropdown database)
3. Click nút **Execute** (hoặc nhấn `Ctrl+Shift+Enter`) để chạy toàn bộ script
4. Đợi quá trình import hoàn tất

**Phương pháp 2: Import từ Command Line**

Mở terminal/command prompt và chạy:

```bash
mysql -u root -p pharmacity_db < Backend/database/schema.sql
```

Nhập password khi được yêu cầu.

#### 2.4. Kiểm tra

1. Trong MySQL Workbench, mở **Navigator** panel bên trái
2. Mở rộng **Schemas** → `pharmacity_db` → **Tables**
3. Kiểm tra các bảng đã được tạo thành công

---

## ⚙️ Bước 3: Cấu Hình Backend

### 3.1. Cài Đặt Dependencies

Mở terminal và di chuyển vào thư mục Backend:

```bash
cd Backend
npm install
```

### 3.2. Tạo File .env

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

**Lưu ý:**

- Thay đổi `DB_PASSWORD` nếu password MySQL của bạn khác
- Thay đổi `JWT_SECRET` bằng một chuỗi bí mật ngẫu nhiên (đặc biệt quan trọng trong production)

### 3.3. Kiểm Tra Kết Nối Database

Chạy lệnh để kiểm tra kết nối:

```bash
npm run test-db
```

Nếu thấy thông báo "✅ Kết nối database thành công!" thì bạn đã cấu hình đúng.

---

## 🎨 Bước 4: Cấu Hình Frontend

### 4.1. Cài Đặt Dependencies

Mở terminal mới (giữ terminal Backend đang chạy) và di chuyển vào thư mục Frontend:

```bash
cd Frontend/pramacity
npm install
```

### 4.2. Cấu Hình API URL (Tùy chọn)

Frontend mặc định sử dụng `http://localhost:3000/api` để kết nối với Backend.

Nếu Backend chạy trên port khác, bạn có thể tạo file `.env` trong thư mục `Frontend/pramacity`:

```env
VITE_API_URL=http://localhost:3000/api
```

**Lưu ý:** Thay đổi port nếu Backend của bạn chạy trên port khác (ví dụ: `http://localhost:3001/api`).

---

## ▶️ Bước 5: Chạy Dự Án

### 5.1. Chạy Backend Server

Trong terminal đầu tiên (đã ở thư mục `Backend`):

```bash
# Development mode (tự động restart khi có thay đổi)
npm run dev

# Hoặc Production mode
npm start
```

Backend sẽ chạy tại: `http://localhost:3000`

### 5.2. Chạy Frontend

Trong terminal thứ hai (đã ở thư mục `Frontend/pramacity`):

```bash
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173` (hoặc port khác nếu 5173 đã được sử dụng)

### 5.3. Truy Cập Ứng Dụng

Mở trình duyệt và truy cập:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000/api

---

## ✅ Bước 6: Kiểm Tra

### Kiểm Tra Backend

1. Health check: http://localhost:3000/api/health
2. API info: http://localhost:3000/api

Nếu thấy response JSON thì Backend đã chạy thành công.

### Kiểm Tra Frontend

1. Mở http://localhost:5173
2. Kiểm tra giao diện có hiển thị đúng không
3. Thử các chức năng đăng nhập, xem sản phẩm, v.v.

---

## 🔧 Xử Lý Lỗi Thường Gặp

### Lỗi kết nối database

**Lỗi:** `ER_ACCESS_DENIED_ERROR` hoặc `ECONNREFUSED`

**Giải pháp:**

- Kiểm tra MySQL Server đang chạy
- Kiểm tra username và password trong file `.env` đúng chưa
- Kiểm tra port MySQL (mặc định là 3306)

### Lỗi database không tồn tại

**Lỗi:** `Unknown database 'pharmacity_db'`

**Giải pháp:**

- Đảm bảo đã tạo database `pharmacity_db` theo hướng dẫn ở Bước 2
- Kiểm tra tên database trong file `.env` đúng chưa

### Lỗi port đã được sử dụng

**Lỗi:** `Port 3000 is already in use`

**Giải pháp:**

- Thay đổi port trong file `.env`: `PORT=3001` (hoặc port khác)
- Hoặc tắt ứng dụng đang sử dụng port đó

### Lỗi import schema SQL

**Lỗi:** Import bị lỗi hoặc timeout

**Giải pháp:**

- Kiểm tra file `schema.sql` có đầy đủ không
- Thử import từng phần nhỏ
- Tăng `max_allowed_packet` trong MySQL:
  ```sql
  SET GLOBAL max_allowed_packet=67108864; -- 64MB
  ```

---

## 📝 Lưu Ý Quan Trọng

1. **File .env không được commit lên Git** - Đảm bảo file `.env` đã có trong `.gitignore`
2. **Thay đổi JWT_SECRET trong production** - Sử dụng chuỗi ngẫu nhiên mạnh
3. **Đảm bảo MySQL Server đang chạy** trước khi start Backend
4. **Kiểm tra firewall** nếu không kết nối được database
5. **Backup database** trước khi chạy các script migration

---

## 📞 Hỗ Trợ

Nếu gặp vấn đề, vui lòng:

1. Kiểm tra lại các bước trên
2. Xem log lỗi trong terminal
3. Kiểm tra file README.md trong thư mục Backend và Frontend
4. Liên hệ team phát triển

---

**Chúc bạn chạy dự án thành công! 🎉**
