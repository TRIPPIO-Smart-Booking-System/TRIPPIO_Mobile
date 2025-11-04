import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { verifyEmail } from '../../api/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';

export default function VerifyEmailScreen({ route, navigation }) {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);
  const email = route?.params?.email || '';

  const onVerify = async () => {
    if (!otp.trim() || otp.length !== 6) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP 6 số');
      return;
    }

    try {
      setLoading(true);
      const res = await verifyEmail(email, otp);
      // Backend có thể trả loginResponse sau verify; nếu có, lưu token
      const lr = res.loginResponse;
      if (lr?.accessToken) {
        await AsyncStorage.setItem('accessToken', lr.accessToken);
        await AsyncStorage.setItem('refreshToken', lr.refreshToken);
        await AsyncStorage.setItem('userId', lr.user.id);
        navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
      } else {
        Alert.alert('Thành công', 'Email đã xác thực, vui lòng đăng nhập lại.');
        navigation.navigate('Login');
      }
    } catch {
      Alert.alert('Lỗi', 'OTP không hợp lệ hoặc đã hết hạn');
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
              style={[
                styles.input,
                focusedInput === 'otp' && styles.inputFocused
              ]}
              placeholder="000000"
              placeholderTextColor="#9CA3AF"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              textAlign="center"
              onFocus={() => setFocusedInput('otp')}
              onBlur={() => setFocusedInput(null)}
              editable={!loading}
              onSubmitEditing={onVerify}
            />
          </View>

          <TouchableOpacity 
            style={[styles.verifyButton, loading && { opacity: 0.7 }]} 
            onPress={onVerify}
            disabled={loading || otp.length !== 6}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.verifyButtonText}>✅ Xác thực</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
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
