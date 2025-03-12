# API Documentation - Hệ thống Quản lý Sản xuất Bún

### Headers
Tất cả các API (trừ đăng nhập và đăng ký) yêu cầu JWT token trong header:
```
Authorization: Bearer <token>
Content-Type: application/json
```

### Phân quyền
Hệ thống có 2 role chính:
- Admin: Toàn quyền quản lý
- User: Quyền cơ bản

## API Endpoints

### 1. Đăng nhập
- **URL:** `POST /api/users/login`
- **Access:** Public
- **Request Body:**
```json
{
    "username": "string",
    "password": "string"
}
```
- **Response Success: (200)**
```json
{
    "success": true,
    "data": {
        "token": "string",
        "user": {
            "id": "integer",
            "username": "string",
            "fullName": "string",
            "email": "string",
            "roles": ["string"]
        }
    }
}
```

### 2. Đăng ký
- **URL:** `POST /api/users/register`
- **Access:** Public
- **Request Body:**
```json
{
    "username": "string",
    "password": "string",
    "fullName": "string",
    "email": "string",
    "phone": "string"
}
```
- **Validation:**
  - Username: 3-30 ký tự
  - Password: Tối thiểu 6 ký tự, phải có chữ hoa, chữ thường và số
  - Email: Định dạng email hợp lệ
  - Phone: 10-11 số
- **Response Success: (201)**
```json
{
    "success": true,
    "message": "Đăng ký tài khoản thành công"
}
```

### 3. Đổi mật khẩu
- **URL:** `PUT /api/users/change-password`
- **Access:** Authenticated User
- **Request Body:**
```json
{
    "oldPassword": "string",
    "newPassword": "string"
}
```
- **Validation:**
  - newPassword: Tối thiểu 6 ký tự, phải có chữ hoa, chữ thường và số
- **Response Success: (200)**
```json
{
    "success": true,
    "message": "Đổi mật khẩu thành công"
}
```

### 4. Lấy danh sách người dùng
- **URL:** `GET /api/users`
- **Access:** Admin only
- **Query Parameters:**
  - `page`: Số trang (mặc định: 1)
  - `limit`: Số lượng item trên trang (mặc định: 10, tối đa: 100)
  - `search`: Tìm kiếm theo tên, email, username
  - `status`: Lọc theo trạng thái (0: Khóa, 1: Hoạt động)
- **Response Success: (200)**
```json
{
    "success": true,
    "data": [
        {
            "id": "integer",
            "username": "string",
            "fullName": "string",
            "email": "string",
            "phone": "string",
            "status": "integer",
            "createdAt": "datetime",
            "roles": ["string"]
        }
    ],
    "pagination": {
        "total": "integer",
        "totalPages": "integer",
        "page": "integer",
        "limit": "integer",
        "hasNextPage": "boolean",
        "hasPrevPage": "boolean"
    }
}
```

### 5. Chi tiết người dùng
- **URL:** `GET /api/users/:id`
- **Access:** Admin only
- **Response Success: (200)**
```json
{
    "success": true,
    "data": {
        "id": "integer",
        "username": "string",
        "fullName": "string",
        "email": "string",
        "phone": "string",
        "status": "integer",
        "createdAt": "datetime",
        "roles": ["string"]
    }
}
```

### 6. Cập nhật người dùng
- **URL:** `PUT /api/users/:id`
- **Access:** Admin only
- **Request Body:**
```json
{
    "fullName": "string",
    "email": "string",
    "phone": "string",
    "status": "integer"
}
```
- **Validation:**
  - fullName: 2-100 ký tự
  - email: Định dạng email hợp lệ
  - phone: 10-11 số
  - status: 0 hoặc 1
- **Response Success: (200)**
```json
{
    "success": true,
    "message": "Cập nhật thông tin người dùng thành công"
}
```

### 7. Xóa người dùng
- **URL:** `DELETE /api/users/:id`
- **Access:** Admin only
- **Lưu ý:** Không thể xóa Admin cuối cùng
- **Response Success: (200)**
```json
{
    "success": true,
    "message": "Xóa người dùng thành công"
}
```

### 8. Gán quyền cho người dùng
- **URL:** `POST /api/users/assign-role`
- **Access:** Admin only
- **Request Body:**
```json
{
    "userId": "integer",
    "roleIds": ["integer"]
}
```
- **Lưu ý:** Không thể xóa quyền Admin của Admin cuối cùng
- **Response Success: (200)**
```json
{
    "success": true,
    "message": "Gán quyền thành công",
    "data": {
        "userId": "integer",
        "roles": [
            {
                "Id": "integer",
                "Ten_quyen": "string"
            }
        ]
    }
}
```

## Xử lý lỗi

### Mã lỗi HTTP
- 200: Thành công
- 201: Tạo mới thành công
- 400: Lỗi dữ liệu đầu vào
- 401: Chưa xác thực hoặc token không hợp lệ
- 403: Không có quyền truy cập
- 404: Không tìm thấy tài nguyên
- 500: Lỗi server

### Cấu trúc Response lỗi
```json
{
    "success": false,
    "message": "Mô tả lỗi",
    "error": "Chi tiết lỗi (chỉ trong môi trường development)",
    "errors": [
        {
            "field": "Tên trường",
            "message": "Mô tả lỗi của trường"
        }
    ]
}
```

## Ví dụ

### Đăng nhập
```bash
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "Admin123@"
  }'
```

### Lấy danh sách người dùng (với token)
```bash
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer <your_token>" \
  -H "Content-Type: application/json"
```

## Lưu ý quan trọng
1. Tất cả requests phải bao gồm token xác thực trong header (trừ đăng nhập và đăng ký)
2. Dữ liệu trả về luôn ở định dạng JSON
3. Các giá trị thời gian sử dụng định dạng ISO 8601
4. Phân trang được áp dụng cho các API lấy danh sách
5. Hệ thống có 2 role chính: Admin và User
6. Không thể xóa Admin cuối cùng của hệ thống
