# Admin Dashboard API Guide

## Tổng quan
Admin Dashboard đã được cập nhật để sử dụng dữ liệu thật từ API thay vì mock data. Dashboard hiển thị các thống kê quan trọng về hệ thống Trippio.

## Các tính năng chính

### 1. Thống kê tổng quan
- **Tổng số người dùng**: Lấy từ API `/api/admin/user/paging`
- **Tổng số đơn hàng**: Lấy từ API `/api/order`
- **Tổng doanh thu**: Lấy từ API `/api/order/revenue` (tháng hiện tại)
- **Tổng số khách sạn**: Lấy từ API `/api/hotel`
- **Tổng số đặt phòng**: Lấy từ API `/api/booking`

### 2. Loading States
- Hiển thị loading spinner khi đang tải dữ liệu
- Thông báo "Đang tải dữ liệu..." trong quá trình load

### 3. Error Handling
- Hiển thị thông báo lỗi khi không thể tải dữ liệu
- Nút "Thử lại" để reload dữ liệu
- Alert thông báo lỗi cho người dùng

### 4. Pull-to-Refresh
- Kéo xuống để refresh dữ liệu
- Cập nhật real-time các thống kê

## API Endpoints được sử dụng

### Dashboard Stats
```javascript
// Lấy thống kê tổng quan
GET /api/admin/user/paging?keyword=&pageIndex=1&pageSize=1
GET /api/order
GET /api/order/revenue?from=2024-01-01&to=2024-01-31
GET /api/hotel
GET /api/booking
```

### Quản lý Users
```javascript
// Lấy danh sách users với phân trang
GET /api/admin/user/paging?keyword=&pageIndex=1&pageSize=10

// Lấy user theo ID
GET /api/admin/user/{id}
```

### Quản lý Orders
```javascript
// Lấy danh sách orders
GET /api/order?page=1&pageSize=10&status=

// Cập nhật trạng thái order
PUT /api/order/{id}/status?status=COMPLETED
```

### Quản lý Bookings
```javascript
// Lấy danh sách bookings
GET /api/booking?page=1&pageSize=10&status=

// Cập nhật trạng thái booking
PUT /api/booking/{id}/status?status=CONFIRMED
```

### Quản lý Hotels
```javascript
// Lấy danh sách hotels
GET /api/hotel?page=1&pageSize=10
```

### Thống kê Doanh thu
```javascript
// Lấy doanh thu theo khoảng thời gian
GET /api/order/revenue?from=2024-01-01&to=2024-01-31

// Lấy thống kê thanh toán
GET /api/payment/total?from=2024-01-01&to=2024-01-31
```

## Cách sử dụng

### 1. Truy cập Dashboard
- Đăng nhập với tài khoản admin
- Vào Profile > Admin Dashboard
- Hệ thống sẽ tự động kiểm tra quyền truy cập

### 2. Xem thống kê
- Dashboard hiển thị 4 thẻ thống kê chính
- Dữ liệu được cập nhật real-time
- Có thể pull-to-refresh để cập nhật

### 3. Quản lý các module
- Chọn module từ menu bên dưới
- Mỗi module hiển thị thông tin tương ứng
- Có thể thực hiện các thao tác quản lý

## Xử lý lỗi

### Lỗi kết nối API
- Hiển thị màn hình lỗi với icon cảnh báo
- Nút "Thử lại" để reload
- Thông báo lỗi rõ ràng cho người dùng

### Lỗi quyền truy cập
- Kiểm tra quyền admin trước khi hiển thị
- Redirect về màn hình trước nếu không có quyền
- Alert thông báo lỗi quyền

## Cấu trúc dữ liệu

### Dashboard Stats Response
```javascript
{
  totalUsers: number,
  totalOrders: number,
  totalBookings: number,
  totalRevenue: number,
  totalHotels: number
}
```

### User Paging Response
```javascript
{
  results: UserDto[],
  currentPage: number,
  rowCount: number,
  pageSize: number
}
```

## Lưu ý quan trọng

1. **Authentication**: Cần đăng nhập với tài khoản admin
2. **Permissions**: Một số API cần quyền cụ thể
3. **Error Handling**: Tất cả API calls đều có error handling
4. **Performance**: Sử dụng Promise.allSettled để tối ưu performance
5. **Real-time**: Dữ liệu được cập nhật mỗi khi vào dashboard

## Troubleshooting

### Dashboard không hiển thị dữ liệu
1. Kiểm tra kết nối internet
2. Kiểm tra API server có chạy không
3. Kiểm tra token authentication
4. Thử pull-to-refresh

### Lỗi 403 Forbidden
1. Kiểm tra tài khoản có quyền admin không
2. Kiểm tra token có hợp lệ không
3. Đăng nhập lại nếu cần

### Lỗi 500 Internal Server Error
1. Kiểm tra logs server
2. Kiểm tra database connection
3. Liên hệ developer để fix
