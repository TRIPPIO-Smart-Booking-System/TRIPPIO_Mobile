# Hướng dẫn Hệ thống Phân quyền TRIPPIO Mobile

## 🔐 Tổng quan hệ thống phân quyền

Hệ thống phân quyền của TRIPPIO Mobile được tích hợp với backend .NET Core và sử dụng JWT tokens để xác thực và phân quyền.

### Các vai trò (Roles) trong hệ thống:

1. **Admin** (`admin`)
   - Toàn quyền truy cập Admin Dashboard
   - Quản lý tất cả dữ liệu hệ thống
   - Có thể xem và chỉnh sửa thông tin người dùng

2. **Staff** (`staff`) 
   - Truy cập một số chức năng quản lý
   - Hỗ trợ khách hàng
   - Xem báo cáo cơ bản

3. **Customer** (`customer` hoặc `user`)
   - Người dùng thông thường
   - Chỉ truy cập các chức năng cơ bản
   - Không thể truy cập Admin Dashboard

## 🏗️ Kiến trúc hệ thống

### 1. UserContext (`src/contexts/UserContext.js`)
- Quản lý trạng thái user toàn cục
- Lưu trữ thông tin user và roles
- Cung cấp các hàm kiểm tra quyền truy cập

### 2. Backend Integration
- Sử dụng JWT tokens từ backend
- Roles được trả về trong response login
- Phân quyền dựa trên roles trong JWT claims

### 3. Frontend Permission Checks
- `checkAdminAccess()`: Kiểm tra quyền admin
- `checkStaffAccess()`: Kiểm tra quyền staff
- `hasRole(role)`: Kiểm tra role cụ thể
- `hasAnyRole(roles)`: Kiểm tra một trong các roles

## 📱 Cách sử dụng trong Components

### 1. Import UserContext
```javascript
import { useUser } from '../contexts/UserContext';
```

### 2. Sử dụng trong Component
```javascript
const { user, isAdmin, checkAdminAccess, hasRole } = useUser();

// Kiểm tra quyền admin
if (checkAdminAccess()) {
  // Hiển thị nút Admin Dashboard
}

// Kiểm tra role cụ thể
if (hasRole('staff')) {
  // Hiển thị chức năng cho staff
}
```

### 3. Conditional Rendering
```javascript
// Chỉ hiển thị cho admin
{checkAdminAccess() && (
  <TouchableOpacity onPress={() => navigation.navigate('AdminDashboard')}>
    <Text>Admin Dashboard</Text>
  </TouchableOpacity>
)}

// Hiển thị cho nhiều roles
{hasAnyRole(['admin', 'staff']) && (
  <Text>Chức năng quản lý</Text>
)}
```

## 🔧 Cấu hình và Setup

### 1. Backend Requirements
- JWT tokens phải chứa roles trong claims
- Roles được trả về trong login response
- API endpoints được bảo vệ bằng `[Authorize]`

### 2. Frontend Setup
- UserContext được wrap quanh toàn bộ app
- Login response phải chứa roles
- AsyncStorage lưu trữ user data và roles

### 3. Navigation Protection
- AdminDashboardScreen kiểm tra quyền khi mount
- Redirect về trang trước nếu không có quyền
- Hiển thị thông báo lỗi phù hợp

## 🛡️ Bảo mật

### 1. Frontend Security
- Kiểm tra quyền ở cả UI và navigation
- Không expose sensitive data cho user thường
- Validate permissions trước khi gọi API

### 2. Backend Security
- JWT tokens được verify ở mọi request
- Roles được check ở controller level
- API endpoints được bảo vệ bằng attributes

### 3. Data Protection
- User data được lưu trữ an toàn trong AsyncStorage
- Tokens được refresh khi cần thiết
- Logout xóa toàn bộ user data

## 📋 Checklist Implementation

### ✅ Đã hoàn thành:
- [x] UserContext với quản lý roles
- [x] HomeScreen ẩn Admin Dashboard cho user thường
- [x] AdminDashboardScreen kiểm tra quyền truy cập
- [x] ProfileScreen hiển thị nút Admin cho admin
- [x] LoginScreen lưu roles vào UserContext
- [x] Logout xóa toàn bộ user data

### 🔄 Cần làm thêm:
- [ ] Tạo API client cho admin endpoints
- [ ] Implement real-time permission updates
- [ ] Thêm permission checks cho các API calls
- [ ] Tạo admin-specific screens
- [ ] Implement role-based UI components

## 🚀 Testing

### 1. Test Cases
- [ ] Login với tài khoản admin → hiển thị Admin Dashboard
- [ ] Login với tài khoản customer → ẩn Admin Dashboard
- [ ] Truy cập trực tiếp AdminDashboard → redirect nếu không có quyền
- [ ] Logout → xóa toàn bộ user data
- [ ] Refresh app → giữ nguyên permissions

### 2. Test Accounts
- **Admin**: `VietAdmin` / `Admin@123$`
- **Customer**: Tạo tài khoản mới qua Register

## 🐛 Troubleshooting

### 1. Admin Dashboard không hiển thị
- Kiểm tra roles trong user data
- Verify JWT token có chứa roles
- Check UserContext state

### 2. Permission denied errors
- Kiểm tra JWT token validity
- Verify roles trong backend response
- Check AsyncStorage data

### 3. Login không lưu roles
- Kiểm tra login response structure
- Verify UserContext login function
- Check AsyncStorage permissions

## 📚 API Reference

### UserContext Methods
```javascript
// Login user với roles
await loginUser(userData);

// Logout và xóa data
await logoutUser();

// Kiểm tra quyền admin
checkAdminAccess();

// Kiểm tra quyền staff  
checkStaffAccess();

// Kiểm tra role cụ thể
hasRole('admin');

// Kiểm tra một trong các roles
hasAnyRole(['admin', 'staff']);
```

### Backend Endpoints
```
POST /api/admin/auth/login
GET  /api/admin/user/paging
POST /api/admin/user
PUT  /api/admin/user/{id}
DELETE /api/admin/user
```

## 🎯 Best Practices

1. **Luôn kiểm tra quyền** trước khi hiển thị UI
2. **Sử dụng UserContext** thay vì AsyncStorage trực tiếp
3. **Validate permissions** ở cả frontend và backend
4. **Handle errors gracefully** khi không có quyền
5. **Test thoroughly** với các roles khác nhau

Chúc bạn sử dụng thành công hệ thống phân quyền! 🎉
