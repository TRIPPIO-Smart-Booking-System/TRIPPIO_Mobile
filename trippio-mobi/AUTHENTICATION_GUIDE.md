# Authentication & Error Handling Guide

## 🔐 Authentication Flow

### 1. Login Process
- User enters credentials → `POST /api/admin/auth/login`
- Response: `OtpVerificationResult` with:
  - `requireEmailVerification`: boolean
  - `loginResponse`: { accessToken, refreshToken, user }
- Tokens stored in AsyncStorage:
  - `accessToken`
  - `refreshToken`
  - `userData` (full user object)

### 2. Token Management
**File**: `src/api/client.js`

#### Request Interceptor
- Automatically adds `Authorization: Bearer {token}` to all requests
- Gets token from `AsyncStorage.getItem('accessToken')`

#### Response Interceptor
- **401 Unauthorized Handling**:
  1. Detects 401 error
  2. Checks if refresh already in progress (prevents multiple refresh calls)
  3. Queues failed requests
  4. Calls `/api/admin/token/refresh` with:
     ```json
     {
       "accessToken": "current_token",
       "refreshToken": "refresh_token"
     }
     ```
  5. Updates tokens in AsyncStorage
  6. Retries original request with new token
  7. Processes queued requests

### 3. Token Refresh Endpoint
**Endpoint**: `POST /api/admin/token/refresh`

**Request**:
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

**Response**: `AuthenticatedResult`
```json
{
  "accessToken": "new_token",
  "refreshToken": "new_refresh_token",
  "expiresAt": "2024-01-01T00:00:00Z",
  "tokenType": "Bearer"
}
```

### 4. Session Expired Handling
When refresh token fails:
- Clears all tokens from AsyncStorage
- Sets `refreshFailed: true` flag in error
- Returns error with `code: 'SESSION_EXPIRED'`
- Screens handle this by:
  - Showing alert: "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
  - Redirecting to Login screen

## 🛠️ Error Handling

### Error Handler Utility
**File**: `src/utils/apiErrorHandler.js`

#### Usage
```javascript
import { handleApiError } from '../../utils/apiErrorHandler';

try {
  await someApiCall();
} catch (error) {
  const errorResult = await handleApiError(error, navigation, logout);
  if (!errorResult.shouldNavigate) {
    Alert.alert('Lỗi', errorResult.message);
  }
}
```

#### Error Types Handled
1. **Session Expired** (`refreshFailed: true`)
   - Clears tokens
   - Calls logout callback
   - Shows alert
   - Redirects to Login

2. **401 Unauthorized**
   - Shows error message
   - Returns `isUnauthorized: true`

3. **403 Forbidden**
   - Shows "Không có quyền" message
   - Returns `isForbidden: true`

4. **400 Bad Request**
   - Shows validation error message
   - Returns `isBadRequest: true`

5. **404 Not Found**
   - Returns `isNotFound: true`

6. **500+ Server Error**
   - Shows "Lỗi server" alert
   - Returns `isServerError: true`

7. **Network Error**
   - Shows "Không thể kết nối" alert
   - Returns `isNetworkError: true`

8. **Timeout**
   - Shows "Hết thời gian chờ" alert
   - Returns `isTimeout: true`

## 📋 Implementation Checklist

### ✅ Completed
- [x] `client.js` with request/response interceptors
- [x] Auto token refresh on 401
- [x] Error handler utility (`apiErrorHandler.js`)
- [x] UserContext logout clears all tokens
- [x] BasketScreen error handling
- [x] PaymentScreen error handling
- [x] OrdersScreen error handling
- [x] HotelDetailScreen error handling
- [x] ShowDetailScreen error handling
- [x] TransportDetailScreen error handling

### 🔄 Error Handling Flow

```
API Call
  ↓
401 Error
  ↓
Response Interceptor
  ↓
Try Refresh Token
  ↓
Success? → Retry Request
  ↓
Failed? → Clear Tokens → Return SESSION_EXPIRED
  ↓
Screen Error Handler
  ↓
Show Alert → Redirect to Login
```

## 🔑 Key Points

1. **All API calls use `client.js`**: Ensures consistent token handling
2. **Automatic token refresh**: User doesn't need to re-login if refresh token is valid
3. **Queue system**: Multiple simultaneous 401 errors are handled correctly
4. **Error handler**: Centralized error handling for consistent UX
5. **Logout clears all**: Ensures clean state when session expires

## 🐛 Debugging 401 Errors

If you see 401 errors:

1. **Check token in AsyncStorage**:
   ```javascript
   const token = await AsyncStorage.getItem('accessToken');
   console.log('Token:', token);
   ```

2. **Check if token is sent**:
   - Check Network tab in DevTools
   - Look for `Authorization: Bearer {token}` header

3. **Check token expiration**:
   - Token may be expired
   - Refresh token should handle this automatically

4. **Check user login state**:
   ```javascript
   const { user } = useUser();
   console.log('User:', user);
   ```

5. **Check API response**:
   ```javascript
   catch (error) {
     console.error('Full error:', error);
     console.error('Response:', error.response?.data);
     console.error('Status:', error.response?.status);
   }
   ```

## 📝 Notes

- **Token format**: `Bearer {token}` in Authorization header
- **Refresh endpoint**: `/api/admin/token/refresh` (from swagger.json)
- **Token storage**: AsyncStorage (persistent across app restarts)
- **Error handling**: Should be consistent across all screens
- **Logout**: Clears all user-related data from AsyncStorage

