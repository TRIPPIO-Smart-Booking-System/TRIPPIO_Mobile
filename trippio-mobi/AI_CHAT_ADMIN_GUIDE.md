# Hướng dẫn sử dụng AI Chat và Admin Dashboard

## 🚀 Tính năng mới đã thêm

### 1. AI Chat Assistant
- **Vị trí**: Trang chủ → "AI Assistant"
- **Chức năng**: Trò chuyện với AI để được tư vấn về du lịch
- **Công nghệ**: Google Gemini API
- **Tính năng**:
  - Chat real-time với AI
  - Gợi ý câu hỏi thông minh
  - Xử lý lỗi và thông báo trạng thái
  - Giao diện đẹp với react-native-gifted-chat

### 2. Admin Dashboard
- **Vị trí**: Trang chủ → "Admin Dashboard"
- **Chức năng**: Quản lý toàn bộ hệ thống
- **Tính năng**:
  - Tổng quan thống kê (người dùng, đặt phòng, doanh thu)
  - Quản lý người dùng
  - Quản lý đặt phòng
  - Quản lý khách sạn
  - Quản lý phương tiện
  - Quản lý shows/giải trí
  - Quản lý thanh toán
  - Thống kê và báo cáo
  - Cài đặt hệ thống

## 📋 Cài đặt và cấu hình

### Bước 1: Cài đặt dependencies
```bash
cd trippio-mobi
npm install
```

### Bước 2: Cấu hình Google AI API
1. Làm theo hướng dẫn trong `GOOGLE_AI_SETUP.md`
2. Tạo file `.env` trong thư mục `trippio-mobi/`:
```env
GOOGLE_AI_API_KEY=your_actual_api_key_here
```

### Bước 3: Chạy ứng dụng
```bash
npm start
# hoặc
expo start
```

## 🔧 Cấu trúc code

### Files đã tạo/cập nhật:

#### 1. AI Chat
- `src/screens/AIChatScreen.js` - Màn hình chat với AI
- `src/api/aiChat.js` - API client cho Google Gemini
- `src/constants/aiConfig.js` - Cấu hình AI

#### 2. Admin Dashboard
- `src/screens/AdminDashboardScreen.js` - Màn hình admin dashboard
- `src/constants/adminConfig.js` - Cấu hình admin

#### 3. Navigation
- `App.js` - Thêm navigation cho AI Chat và Admin Dashboard
- `src/screens/HomeScreen.js` - Thêm nút truy cập tính năng mới

#### 4. Configuration
- `.env.example` - Template cho environment variables
- `.gitignore` - Thêm .env vào ignore list
- `GOOGLE_AI_SETUP.md` - Hướng dẫn setup Google Console

## 🎨 Giao diện

### AI Chat Screen
- Header với tên AI và trạng thái kết nối
- Chat interface với react-native-gifted-chat
- Nút menu để xóa cuộc trò chuyện và kiểm tra kết nối
- Typing indicator khi AI đang trả lời
- Error handling với thông báo lỗi thân thiện

### Admin Dashboard Screen
- Header với nút back và settings
- Cards thống kê với số liệu tổng quan
- Grid menu với các chức năng quản lý
- Content area hiển thị thông tin theo section được chọn
- Pull-to-refresh để cập nhật dữ liệu

### Home Screen
- Thêm section "Tính năng đặc biệt"
- 2 cards: AI Assistant và Admin Dashboard
- Icons và màu sắc đẹp mắt
- Responsive design

## 🔒 Bảo mật

- API key được lưu trong environment variables
- Không commit API key vào git
- Error handling không expose thông tin nhạy cảm
- Rate limiting và validation input

## 🚨 Lưu ý quan trọng

1. **API Key**: Đảm bảo thay thế `YOUR_API_KEY_HERE` bằng API key thực từ Google Console
2. **Backend**: Các tính năng admin hiện tại sử dụng mock data, cần tích hợp với backend thực
3. **Permissions**: Admin Dashboard cần kiểm tra quyền truy cập trong thực tế
4. **Error Handling**: Cần test kỹ các trường hợp lỗi mạng và API

## 🔄 Tích hợp với Backend

Để tích hợp với backend thực, cần:

1. **Admin API**: Tạo các API endpoints cho admin dashboard
2. **Authentication**: Thêm kiểm tra quyền admin
3. **Real-time data**: Kết nối với database thực
4. **Analytics**: Tích hợp với hệ thống thống kê

## 📱 Testing

1. Test AI Chat với các câu hỏi khác nhau
2. Test Admin Dashboard với mock data
3. Test navigation giữa các màn hình
4. Test error handling khi không có internet
5. Test với API key không hợp lệ

## 🎯 Tính năng có thể mở rộng

1. **AI Chat**:
   - Lưu lịch sử chat
   - Voice input/output
   - Image recognition
   - Multi-language support

2. **Admin Dashboard**:
   - Real-time notifications
   - Advanced analytics
   - User management
   - Content management
   - System monitoring

Chúc bạn sử dụng thành công! 🎉
