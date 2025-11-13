# Hướng dẫn Build APK cho Trippio Mobile

## 📱 Tổng quan

Dự án này sử dụng Expo SDK ~54. Có 2 cách để build APK:

1. **EAS Build (Khuyến nghị)** - Build trên cloud, dễ dàng
2. **Local Build** - Build trên máy local (cần Android Studio)

---

## 🚀 Cách 1: EAS Build (Khuyến nghị)

### Bước 1: Cài đặt EAS CLI

```bash
npm install -g eas-cli
```

### Bước 2: Đăng nhập Expo

```bash
eas login
```

Nếu chưa có tài khoản, đăng ký tại: https://expo.dev/signup

### Bước 3: Cấu hình EAS Build

```bash
cd trippio-mobi
eas build:configure
```

Lệnh này sẽ tạo file `eas.json` với cấu hình build.

### Bước 4: Build APK

```bash
# Build APK development (nhanh hơn, không cần signing)
eas build --platform android --profile development

# Hoặc build APK production (cần signing, để publish)
eas build --platform android --profile production
```

### Bước 5: Tải APK

Sau khi build xong, bạn sẽ nhận được link để tải APK. Hoặc kiểm tra tại:
https://expo.dev/accounts/[your-account]/projects/trippio/builds

---

## 🛠️ Cách 2: Local Build (Advanced)

### Yêu cầu:
- Android Studio đã cài đặt
- Java JDK 11 hoặc cao hơn
- Android SDK đã cấu hình

### Bước 1: Cài đặt dependencies

```bash
cd trippio-mobi
npm install
```

### Bước 2: Prebuild (tạo native code)

```bash
npx expo prebuild --platform android
```

### Bước 3: Build APK

```bash
cd android
./gradlew assembleRelease
```

APK sẽ được tạo tại: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📦 Cấu hình Signing (Cho Production)

### Tạo keystore:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore trippio-release.keystore -alias trippio-key -keyalg RSA -keysize 2048 -validity 10000
```

### Cấu hình trong `eas.json`:

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    }
  }
}
```

---

## 🌐 Host APK trên Website

Sau khi có file APK, bạn cần:

1. **Upload APK lên server/web hosting**
2. **Tạo trang HTML với QR code** (xem file `download-apk.html`)
3. **Cấu hình MIME type** trên server:
   - `.apk` → `application/vnd.android.package-archive`

### Ví dụ với Nginx:

```nginx
location ~* \.apk$ {
    add_header Content-Type application/vnd.android.package-archive;
    add_header Content-Disposition "attachment; filename=trippio.apk";
}
```

### Ví dụ với Apache (.htaccess):

```apache
AddType application/vnd.android.package-archive .apk
```

---

## 📱 Tạo QR Code

Sử dụng file `generate-qr.html` hoặc các công cụ online:
- https://www.qr-code-generator.com/
- https://qrcode.tec-it.com/

Hoặc sử dụng API:
```javascript
const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(downloadUrl)}`;
```

---

## 🔄 Cập nhật Version

Khi cần cập nhật app:

1. **Tăng version trong `app.json`**:
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
4. **QR code sẽ tự động trỏ đến APK mới**

---

## ✅ Checklist trước khi build

- [ ] Kiểm tra `app.json` có đầy đủ thông tin
- [ ] Kiểm tra icon và splash screen
- [ ] Kiểm tra package name (`com.trippio.mobile`)
- [ ] Kiểm tra API URL trong code
- [ ] Test app trên thiết bị thật
- [ ] Kiểm tra permissions cần thiết

---

## 🐛 Troubleshooting

### Lỗi: "Could not find or load main class"
- Đảm bảo Java JDK đã cài đặt đúng
- Kiểm tra `JAVA_HOME` environment variable

### Lỗi: "SDK location not found"
- Cài đặt Android Studio
- Cấu hình `ANDROID_HOME` environment variable

### Lỗi: "Build failed"
- Kiểm tra log chi tiết trong Expo dashboard
- Đảm bảo tất cả dependencies đã cài đặt
- Kiểm tra `eas.json` configuration

---

## 📚 Tài liệu tham khảo

- [Expo EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Android APK Signing](https://developer.android.com/studio/publish/app-signing)
- [Expo App Configuration](https://docs.expo.dev/workflow/configuration/)

---

## 💡 Tips

1. **Development Build**: Dùng để test nhanh, không cần signing
2. **Production Build**: Dùng để distribute, cần signing
3. **Version Code**: Phải tăng mỗi lần build mới (Android requirement)
4. **Package Name**: Phải unique, không thể thay đổi sau khi publish

---

Chúc bạn build thành công! 🎉

