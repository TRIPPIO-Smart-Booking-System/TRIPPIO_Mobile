# 🚀 Quick Start - Build APK

## Cách nhanh nhất để build APK

### Bước 1: Cài đặt EAS CLI

```bash
npm install -g eas-cli
```

### Bước 2: Đăng nhập Expo

```bash
eas login
```

### Bước 3: Cấu hình build

File `eas.json` đã được tạo sẵn. Bạn có thể chỉnh sửa nếu cần.

### Bước 4: Build APK

```bash
# Development build (nhanh, không cần signing)
eas build --platform android --profile development

# Production build (cần signing, để distribute)
eas build --platform android --profile production
```

### Bước 5: Tải APK

Sau khi build xong, bạn sẽ nhận được link download. APK sẽ có sẵn tại Expo dashboard.

---

## 📱 Host APK trên Website

### Bước 1: Upload APK lên server

Upload file APK lên thư mục `apk/` trên server của bạn.

### Bước 2: Cấu hình server

Đảm bảo server trả về đúng MIME type cho file `.apk`:

**Nginx:**
```nginx
location ~* \.apk$ {
    add_header Content-Type application/vnd.android.package-archive;
    add_header Content-Disposition "attachment; filename=trippio.apk";
}
```

**Apache (.htaccess):**
```apache
AddType application/vnd.android.package-archive .apk
```

### Bước 3: Sử dụng trang download

1. Mở file `download-apk.html`
2. Thay đổi `APK_URL` trong file thành link APK thực tế
3. Upload file HTML lên server
4. Truy cập trang web và quét QR code!

---

## 🔄 Cập nhật Version

Mỗi lần build mới, cần cập nhật:

1. **Version trong `app.json`:**
```json
{
  "expo": {
    "version": "1.0.1",
    "android": {
      "versionCode": 2
    }
  }
}
```

2. **Build lại APK**

3. **Upload APK mới lên server**

---

## 🆘 Troubleshooting

### Lỗi: "Not authenticated"
```bash
eas login
```

### Lỗi: "Project not found"
```bash
eas init
```

### Lỗi: "Build failed"
- Kiểm tra log tại Expo dashboard
- Đảm bảo `app.json` hợp lệ
- Kiểm tra tất cả dependencies

---

## 📚 Tài liệu

Xem file `BUILD_APK_GUIDE.md` để biết hướng dẫn chi tiết hơn.

---

## 💡 Tips

1. **Development build**: Dùng để test nhanh
2. **Production build**: Dùng để distribute
3. **Version Code**: Phải tăng mỗi lần build (Android requirement)
4. **Package Name**: Không thể thay đổi sau khi publish

---

Chúc bạn build thành công! 🎉

