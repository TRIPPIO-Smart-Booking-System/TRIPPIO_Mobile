import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator } from 'react-native';
import { resetPassword } from '../../api/auth';
import { styles } from './styles';

export default function ResetPasswordScreen({ route, navigation }) {
  const email = route?.params?.email || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  const onReset = async () => {
    if (!otp.trim() || !newPassword.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ mã OTP và mật khẩu mới');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    try {
      setLoading(true);
      await resetPassword(email, otp, newPassword);
      Alert.alert('Thành công', 'Đặt lại mật khẩu thành công, vui lòng đăng nhập');
      navigation.navigate('Login');
    } catch {
      Alert.alert('Lỗi', 'OTP không hợp lệ hoặc yêu cầu không hợp lệ');
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
      <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🔐 Đặt lại mật khẩu</Text>
          <Text style={styles.headerSubtitle}>
            Nhập mã OTP và mật khẩu mới để hoàn tất
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
              placeholder="Nhập mã OTP"
              placeholderTextColor="#9CA3AF"
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
              onFocus={() => setFocusedInput('otp')}
              onBlur={() => setFocusedInput(null)}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 Mật khẩu mới</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'password' && styles.inputFocused
              ]}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor="#9CA3AF"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              editable={!loading}
              onSubmitEditing={onReset}
            />
          </View>

          <TouchableOpacity 
            style={[styles.resetButton, loading && styles.resetButtonDisabled]} 
            onPress={onReset}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.resetButtonText}>🔄 Đặt lại mật khẩu</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.backButtonText}>← Quay lại</Text>
          </TouchableOpacity>
        </View>

        {/* Help Text */}
        <View style={styles.helpContainer}>
          <Text style={styles.helpText}>
            💡 Mật khẩu mới phải có ít nhất 6 ký tự
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
