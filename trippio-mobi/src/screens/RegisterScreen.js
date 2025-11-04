import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { register } from '../api/auth';
import Colors from '../constants/colors';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    dateOfBirth: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập username');
      return false;
    }
    if (!formData.email.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập email');
      return false;
    }
    if (!formData.phoneNumber.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập số điện thoại');
      return false;
    }
    if (!formData.password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return false;
    }
    if (formData.password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp');
      return false;
    }
    if (!formData.firstName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên');
      return false;
    }
    if (!formData.lastName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ');
      return false;
    }
    if (!formData.dateOfBirth.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập ngày sinh');
      return false;
    }
    return true;
  };

  const onRegister = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const registerData = {
        ...formData,
        dateOfBirth: new Date(formData.dateOfBirth).toISOString()
      };

      console.log('Registering with data:', registerData);
      const res = await register(registerData);
      
      if (res.isSuccess) {
        Alert.alert(
          'Đăng ký thành công! 🎉',
          'Tài khoản đã được tạo. Vui lòng xác thực email để hoàn tất.',
          [
            {
              text: 'Xác thực email',
              onPress: () => navigation.navigate('VerifyEmail', { email: formData.email })
            }
          ]
        );
      } else {
        Alert.alert('Đăng ký thất bại', res.message || 'Có lỗi xảy ra, vui lòng thử lại');
      }
    } catch (error) {
      console.error('Register error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      let errorMessage = 'Không thể đăng ký';
      if (error.response?.status === 400) {
        errorMessage = 'Thông tin không hợp lệ';
      } else if (error.response?.status === 409) {
        errorMessage = 'Email hoặc username đã tồn tại';
      } else if (error.message) {
        errorMessage = error.message;
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
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.logo}>🏨 Trippio</Text>
            <Text style={styles.welcomeText}>Tạo tài khoản mới</Text>
            <Text style={styles.subtitle}>Đăng ký để bắt đầu hành trình của bạn</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            {/* Personal Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Thông tin cá nhân</Text>
              
              <View style={styles.row}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Tên</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập tên"
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    autoCapitalize="words"
                  />
                </View>
                
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Họ</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Nhập họ"
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📅 Ngày sinh</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={formData.dateOfBirth}
                  onChangeText={(value) => handleInputChange('dateOfBirth', value)}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* Account Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔐 Thông tin tài khoản</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>👤 Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập username"
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📧 Email</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập email"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📱 Số điện thoại</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại"
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🔒 Mật khẩu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🔒 Xác nhận mật khẩu</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  secureTextEntry
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
              onPress={onRegister}
              disabled={loading}
            >
              <Text style={styles.registerButtonText}>
                {loading ? '⏳ Đang xử lý...' : '🚀 Tạo tài khoản'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={styles.loginButtonText}>⬅️ Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
          </View>
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
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.textPrimary,
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 16,
  },
  halfWidth: {
    width: '48%',
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
  registerButton: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 20,
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
  registerButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  loginButtonText: {
    color: '#6c5ce7',
    fontSize: 16,
    fontWeight: '500',
  },
});
