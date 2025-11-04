# Hướng dẫn Setup Google AI API cho TRIPPIO Mobile

## Bước 1: Tạo Google Cloud Project

1. Truy cập [Google Cloud Console](https://console.cloud.google.com/)
2. Đăng nhập bằng tài khoản Google của bạn
3. Tạo project mới:
   - Click "Select a project" ở top bar
   - Click "New Project"
   - Nhập tên project: `trippio-ai-chat`
   - Chọn organization (nếu có)
   - Click "Create"

## Bước 2: Enable Gemini API

1. Trong Google Cloud Console, chọn project vừa tạo
2. Vào "APIs & Services" > "Library"
3. Tìm kiếm "Generative Language API" hoặc "Gemini API"
4. Click vào API và click "Enable"

## Bước 3: Tạo API Key

1. Vào "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "API Key"
3. Copy API key được tạo
4. (Tùy chọn) Click "Restrict Key" để giới hạn quyền truy cập:
   - Application restrictions: HTTP referrers
   - API restrictions: Chọn "Generative Language API"

## Bước 4: Cấu hình trong App

1. Tạo file `.env` trong thư mục `trippio-mobi/`:
```
GOOGLE_AI_API_KEY=your_api_key_here
```

2. Thêm vào `.gitignore`:
```
.env
```

## Bước 5: Test API

Sử dụng curl để test API:
```bash
curl -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello, how are you?"}]}]}' \
     -X POST 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=YOUR_API_KEY'
```

## Lưu ý bảo mật

- KHÔNG commit API key vào git
- Sử dụng environment variables
- Giới hạn API key theo domain/IP nếu có thể
- Monitor usage trong Google Cloud Console
