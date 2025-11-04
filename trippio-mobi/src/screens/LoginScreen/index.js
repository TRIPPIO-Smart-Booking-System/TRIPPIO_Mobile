import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../../api/auth';
import { useUser } from '../../contexts/UserContext';
import { styles } from './styles';

export default function LoginScreen({ navigation }) {
  const { login: loginUser } = useUser();
  const [usernameOrPhone, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const onLogin = async () => {
    if (!usernameOrPhone.trim() || !password.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin');
      return;
    }

    try {
      setLoading(true);
      const res = await login(usernameOrPhone, password);
      
      if (res.requireEmailVerification) {
        Alert.alert('Xác thực email', 'OTP đã gửi tới email. Vui lòng verify.');
        navigation.navigate('VerifyEmail', { email: res.email });
        return;
      }
      
      if (res.isSuccess && res.loginResponse) {
        const { accessToken, refreshToken, user } = res.loginResponse;
        
        // Lưu tokens
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);
        
        // Chuẩn bị user data với roles
        const userData = {
          id: user.id,
          userName: user.userName || '',
          email: user.email || '',
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phoneNumber: user.phoneNumber || '',
          fullName: user.fullName || '',
          balance: user.balance || 0,
          isEmailVerified: user.isEmailVerified || false,
          isPhoneVerified: user.isPhoneVerified || false,
          dateCreated: user.dateCreated || '',
          dob: user.dob || '',
          avatar: user.avatar || '',
          roles: user.roles || ['customer'],
          accessToken,
          refreshToken
        };
        
        // Sử dụng UserContext để lưu user data
        await loginUser(userData);
        
        console.log('User logged in:', userData);
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        Alert.alert('Đăng nhập thất bại', res.message || 'Kiểm tra lại thông tin');
      }
    } catch (e) {
      console.error('Login error:', e);
      console.error('Error details:', {
        message: e.message,
        response: e.response?.data,
        status: e.response?.status,
        statusText: e.response?.statusText
      });
      
      let errorMessage = 'Không thể đăng nhập';
      if (e.response?.status === 401) {
        errorMessage = 'Sai tên đăng nhập hoặc mật khẩu';
      } else if (e.response?.status === 0 || e.code === 'NETWORK_ERROR') {
        errorMessage = 'Không thể kết nối đến server. Kiểm tra kết nối mạng';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      Alert.alert('Lỗi', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🏨 Trippio</Text>
          <Text style={styles.welcomeText}>Chào mừng trở lại!</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>👤 Username hoặc SĐT</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'username' && styles.inputFocused
              ]}
              placeholder="Nhập username hoặc số điện thoại"
              placeholderTextColor="#9CA3AF"
              value={usernameOrPhone}
              onChangeText={setUsername}
              onFocus={() => setFocusedInput('username')}
              onBlur={() => setFocusedInput(null)}
              autoCapitalize="none"
              keyboardType="default"
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 Mật khẩu</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'password' && styles.inputFocused
              ]}
              placeholder="Nhập mật khẩu"
              placeholderTextColor="#9CA3AF"
              value={password}
              onChangeText={setPassword}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              secureTextEntry
              autoCapitalize="none"
              editable={!loading}
              onSubmitEditing={onLogin}
            />
          </View>

          <TouchableOpacity 
            style={[styles.loginButton, loading && styles.loginButtonPressed]} 
            onPress={onLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>🚀 Đăng nhập</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotButton}
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={loading}
          >
            <Text style={styles.forgotButtonText}>🔑 Quên mật khẩu?</Text>
          </TouchableOpacity>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>hoặc</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity 
            style={styles.registerButton}
            onPress={() => navigation.navigate('Register')}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Text style={styles.registerButtonText}>📝 Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

