import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { verifyEmail } from '../api/auth';
import Colors from '../constants/colors';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function VerifyEmailScreen({ route, navigation }) {
  const [otp, setOtp] = useState('');
  const email = route?.params?.email || '';

  const onVerify = async () => {
    try {
      const res = await verifyEmail(email, otp);
      // Backend có thể trả loginResponse sau verify; nếu có, lưu token
      const lr = res.loginResponse;
      if (lr?.accessToken) {
        await AsyncStorage.setItem('accessToken', lr.accessToken);
        await AsyncStorage.setItem('refreshToken', lr.refreshToken);
        await AsyncStorage.setItem('userId', lr.user.id);
        navigation.reset({ index: 0, routes: [{ name: 'Hotels' }] });
      } else {
        Alert.alert('Thành công', 'Email đã xác thực, vui lòng đăng nhập lại.');
        navigation.navigate('Login');
      }
    } catch {
      Alert.alert('Lỗi', 'OTP không hợp lệ hoặc đã hết hạn');
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
          <Text style={styles.icon}>📧</Text>
          <Text style={styles.title}>Xác thực Email</Text>
          <Text style={styles.subtitle}>
            Chúng tôi đã gửi mã OTP đến email của bạn
          </Text>
        </View>

        {/* Email Display */}
        <View style={styles.emailContainer}>
          <Text style={styles.emailLabel}>📮 Email:</Text>
          <Text style={styles.emailText}>{email}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔢 Mã OTP</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã OTP 6 số"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
            />
          </View>

          <TouchableOpacity style={styles.verifyButton} onPress={onVerify}>
            <Text style={styles.verifyButtonText}>✅ Xác thực</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>⬅️ Quay lại</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            💡 Không nhận được email? Kiểm tra thư mục spam hoặc thử lại
          </Text>
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
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  emailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636e72',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c5ce7',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
    textAlign: 'center',
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 24,
    fontWeight: 'bold',
    borderWidth: 2,
    borderColor: '#6c5ce7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  verifyButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#6c5ce7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: '#6c5ce7',
    fontSize: 16,
    fontWeight: '500',
  },
  helpContainer: {
    paddingBottom: 30,
  },
  helpText: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
    lineHeight: 20,
  },
});