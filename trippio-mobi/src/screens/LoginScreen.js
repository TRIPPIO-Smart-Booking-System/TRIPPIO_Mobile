import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../api/auth';

export default function LoginScreen({ navigation }) {
  const [usernameOrPhone, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onLogin = async () => {
    try {

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
        
        // Lưu thông tin user chi tiết
        await AsyncStorage.multiSet([
          ['userId', user.id],
          ['userName', user.userName || ''],
          ['email', user.email || ''],
          ['firstName', user.firstName || ''],
          ['lastName', user.lastName || ''],
          ['phoneNumber', user.phoneNumber || ''],
          ['fullName', user.fullName || ''],
          ['balance', user.balance?.toString() || '0'],
          ['isEmailVerified', user.isEmailVerified?.toString() || 'false'],
          ['isPhoneVerified', user.isPhoneVerified?.toString() || 'false'],
          ['dateCreated', user.dateCreated || ''],
          ['dob', user.dob || ''],
          ['avatar', user.avatar || '']
        ]);
        
        console.log('User info saved:', user);
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
      } else if (e.response?.status === 0) {
        errorMessage = 'Không thể kết nối đến server. Kiểm tra kết nối mạng';
      } else if (e.message) {
        errorMessage = e.message;
      }
      
      Alert.alert('Lỗi', errorMessage);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
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
              style={styles.input}
              placeholder="Nhập username hoặc số điện thoại"
              value={usernameOrPhone}
              onChangeText={setUsername}
              autoCapitalize="none"
              keyboardType="default"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 Mật khẩu</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
            <Text style={styles.loginButtonText}>🚀 Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.forgotButton}
            onPress={() => navigation.navigate('ForgotPassword')}
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
          >
            <Text style={styles.registerButtonText}>📝 Tạo tài khoản mới</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    paddingTop: 80,
    paddingBottom: 40,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#6c5ce7',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  loginButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#6c5ce7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 16,
  },
  forgotButtonText: {
    color: '#6c5ce7',
    fontSize: 14,
    fontWeight: '500',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e9ecef',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#636e72',
    fontSize: 14,
  },
  registerButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6c5ce7',
  },
  registerButtonText: {
    color: '#6c5ce7',
    fontSize: 16,
    fontWeight: 'bold',
  },
});