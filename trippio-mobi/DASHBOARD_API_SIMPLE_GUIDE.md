# Dashboard API Simple Guide

## Tổng quan
API Dashboard Simple được thiết kế để lấy dữ liệu thống kê thật từ backend thông qua user ID, với fallback sang mock data khi cần thiết.

## Cách hoạt động

### 1. Lấy dữ liệu từ API thật
- **Users**: `/api/admin/user/paging` - Lấy tổng số users
- **Revenue**: `/api/order/revenue` - Lấy doanh thu tháng hiện tại
- **Hotels**: `/api/hotel` - Lấy danh sách khách sạn
- **Orders**: `/api/order/user/{userId}` - Lấy orders từ user mẫu
- **Bookings**: `/api/booking/user/{userId}` - Lấy bookings từ user mẫu

### 2. Fallback Strategy
- Nếu API không hoạt động → Sử dụng mock data
- Nếu không có dữ liệu → Sử dụng mock data
- Luôn đảm bảo dashboard có dữ liệu để hiển thị

## API Endpoints được sử dụng

### Users API
```javascript
GET /api/admin/user/paging?keyword=&pageIndex=1&pageSize=1
// Trả về: { rowCount: number, results: UserDto[] }
```

### Revenue API
```javascript
GET /api/order/revenue?from=2024-01-01&to=2024-01-31
// Trả về: number (doanh thu)
```

### Hotels API
```javascript
GET /api/hotel
// Trả về: HotelDto[]
```

### Orders API (theo user)
```javascript
GET /api/order/user/{userId}
// Trả về: OrderDto[]
```

### Bookings API (theo user)
```javascript
GET /api/booking/user/{userId}
// Trả về: BookingDto[]
```

## Cách sử dụng

### 1. Import API
```javascript
import { dashboardSimpleApi } from '../api/dashboard-simple';
```

### 2. Lấy thống kê
```javascript
const stats = await dashboardSimpleApi.getBasicStats();
console.log(stats);
// Output: {
//   totalUsers: 1250,
//   totalOrders: 342,
//   totalRevenue: 125000000,
//   totalHotels: 45,
//   totalBookings: 189
// }
```

### 3. Lấy mock data
```javascript
const mockStats = dashboardSimpleApi.getMockStats();
console.log(mockStats);
```

## Logging và Debug

API sẽ log chi tiết quá trình lấy dữ liệu:

```
Fetching dashboard stats from API...
✓ Users count: 1250
✓ Revenue: 125000000
✓ Hotels count: 45
Testing with user: 123e4567-e89b-12d3-a456-426614174000
✓ Orders count from user: 5
✓ Bookings count from user: 3
Final dashboard stats: { totalUsers: 1250, ... }
```

## Error Handling

### 1. API không hoạt động
```
✗ Users API error: Network Error
✗ Revenue API error: 500 Internal Server Error
```
→ Sử dụng mock data

### 2. Không có dữ liệu
```
Using mock data as fallback
```
→ Hiển thị dữ liệu mẫu

### 3. Lỗi kết nối
```
Error fetching basic stats: TypeError: Cannot read property 'get' of undefined
```
→ Trả về mock data

## Cấu trúc dữ liệu

### Dashboard Stats Response
```javascript
{
  totalUsers: number,      // Tổng số users
  totalOrders: number,     // Tổng số orders
  totalRevenue: number,    // Doanh thu (VND)
  totalHotels: number,     // Tổng số khách sạn
  totalBookings: number    // Tổng số bookings
}
```

## Performance

- **Parallel API calls**: Gọi nhiều API cùng lúc
- **Limited user sampling**: Chỉ lấy dữ liệu từ user đầu tiên
- **Fast fallback**: Chuyển sang mock data nhanh chóng
- **Caching**: Có thể cache kết quả để tăng tốc

## Testing

### Test API
```javascript
import { testDashboardSimpleApi, testApiConnection } from '../api/test-dashboard-simple';

// Test API
const result = await testDashboardSimpleApi();
console.log('Test result:', result);

// Test connection
const connection = await testApiConnection();
console.log('Connection result:', connection);
```

## Troubleshooting

### 1. Dashboard hiển thị 0
- Kiểm tra API server có chạy không
- Kiểm tra authentication token
- Xem logs để debug

### 2. Lỗi "Cannot read property 'get' of undefined"
- Kiểm tra import `client` từ `./client`
- Đảm bảo `apiClient` được khởi tạo đúng

### 3. Dữ liệu không cập nhật
- Kiểm tra API response
- Xem logs để debug
- Thử pull-to-refresh

## Lưu ý quan trọng

1. **Authentication**: Cần đăng nhập với tài khoản admin
2. **API Limits**: Giới hạn 5 users để tránh quá tải
3. **Error Handling**: Luôn có fallback data
4. **Performance**: Sử dụng Promise.allSettled để tối ưu
5. **Logging**: Chi tiết để debug dễ dàng
