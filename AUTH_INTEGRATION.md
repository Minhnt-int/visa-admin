# 🔄 Cập Nhật Admin Panel - Tích Hợp Backend Auth

## ✅ Đã Cập Nhật

### 1. **Login Component** (`src/app/authentication/login/AuthLogin.tsx`)
- ✅ Đổi endpoint từ `/api/auth/login-token` → `/api/auth/login`
- ✅ Cập nhật format response: `response.data.data` thay vì `response.data`
- ✅ Xử lý error format mới: `error.response.data.error.message`

### 2. **NextAuth Route** (`src/app/api/auth/[...nextauth]/route.ts`)
- ✅ Đổi endpoint từ `/api/auth/login-token` → `/api/auth/login`
- ✅ Cập nhật request body: sử dụng `email` thay vì `username`
- ✅ Cập nhật response parsing: `data.data` thay vì `data` trực tiếp

### 3. **Token Refresher** (`src/utils/tokenRefresher.ts`)
- ✅ Đổi endpoint từ `/api/auth/refresh-token` → `/api/auth/refresh`
- ✅ Cập nhật response format: `data.data.accessToken`

### 4. **API Service** (`src/services/ApiService.ts`)
- ✅ Đổi token key từ `"token"` → `"accessToken"`
- ✅ Cập nhật interceptor để xử lý 401 và redirect đúng

## 📝 Format API Mới

### Login Request
```typescript
POST /api/auth/login
Body: { email: string, password: string }
```

### Login Response
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "accessToken": "jwt_token",
    "refreshToken": "refresh_token",
    "user": {
      "id": 1,
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### Refresh Token
```typescript
POST /api/auth/refresh
Body: { refreshToken: string }

Response: {
  "success": true,
  "data": {
    "accessToken": "new_jwt_token"
  }
}
```

## 🔧 Environment Variables

Đảm bảo `visa-admin/.env.local` có:

```env
NEXT_PUBLIC_API_URL=http://localhost:3002
```

## 🧪 Test

1. **Test Login:**
   ```bash
   # Từ admin panel
   Email: admin@example.com (hoặc email từ seed)
   Password: Admin@123 (hoặc từ SEED_ADMIN_PASSWORD)
   ```

2. **Verify Token Storage:**
   - Kiểm tra `localStorage.getItem('accessToken')` có token
   - Kiểm tra `localStorage.getItem('user')` có user info

3. **Test API Calls:**
   - Token tự động được thêm vào header `Authorization: Bearer <token>`
   - Kiểm tra console network tab để verify

## ⚠️ Lưu Ý

- Backend API yêu cầu `email` (không phải `username`)
- Response format: `{ success: true, data: {...} }`
- Error format: `{ success: false, error: { message: "..." } }`
- Token key trong localStorage: `accessToken` (không phải `token`)

