import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { resetPassword } from '../api/auth';
import Colors from '../constants/colors';

export default function ResetPasswordScreen({ route, navigation }) {
  const email = route?.params?.email || '';
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
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
              style={styles.input}
              placeholder="Nhập mã OTP"
              placeholderTextColor={Colors.textSecondary}
              value={otp}
              onChangeText={setOtp}
              keyboardType="number-pad"
              maxLength={6}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>🔒 Mật khẩu mới</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mật khẩu mới"
              placeholderTextColor={Colors.textSecondary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
              autoCapitalize="none"
            />
          </View>

          <TouchableOpacity 
            style={[styles.resetButton, loading && styles.resetButtonDisabled]} 
            onPress={onReset}
            disabled={loading}
          >
            <Text style={styles.resetButtonText}>
              {loading ? 'Đang xử lý...' : '🔄 Đặt lại mật khẩu'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 30,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailContainer: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    margin: 20,
    marginBottom: 30,
    shadowColor: Colors.shadow,
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
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.primary,
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resetButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 16,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  resetButtonDisabled: {
    backgroundColor: Colors.textSecondary,
    shadowOpacity: 0.1,
  },
  resetButtonText: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  backButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  helpContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  helpText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});