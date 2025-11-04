import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { register } from '../../api/auth';
import { styles } from './styles';

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
  const [focusedInput, setFocusedInput] = useState(null);

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
    if (!formData.email.includes('@')) {
      Alert.alert('Lỗi', 'Email không hợp lệ');
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
      Alert.alert('Lỗi', 'Vui lòng nhập ngày sinh (YYYY-MM-DD)');
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
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
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
                    style={[
                      styles.input,
                      focusedInput === 'firstName' && styles.inputFocused
                    ]}
                    placeholder="Nhập tên"
                    placeholderTextColor="#9CA3AF"
                    value={formData.firstName}
                    onChangeText={(value) => handleInputChange('firstName', value)}
                    onFocus={() => setFocusedInput('firstName')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
                
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Họ</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focusedInput === 'lastName' && styles.inputFocused
                    ]}
                    placeholder="Nhập họ"
                    placeholderTextColor="#9CA3AF"
                    value={formData.lastName}
                    onChangeText={(value) => handleInputChange('lastName', value)}
                    onFocus={() => setFocusedInput('lastName')}
                    onBlur={() => setFocusedInput(null)}
                    autoCapitalize="words"
                    editable={!loading}
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📅 Ngày sinh</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'dateOfBirth' && styles.inputFocused
                  ]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#9CA3AF"
                  value={formData.dateOfBirth}
                  onChangeText={(value) => handleInputChange('dateOfBirth', value)}
                  onFocus={() => setFocusedInput('dateOfBirth')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="numeric"
                  editable={!loading}
                />
              </View>
            </View>

            {/* Account Info */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔐 Thông tin tài khoản</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>👤 Username</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'username' && styles.inputFocused
                  ]}
                  placeholder="Nhập username"
                  placeholderTextColor="#9CA3AF"
                  value={formData.username}
                  onChangeText={(value) => handleInputChange('username', value)}
                  onFocus={() => setFocusedInput('username')}
                  onBlur={() => setFocusedInput(null)}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📧 Email</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'email' && styles.inputFocused
                  ]}
                  placeholder="Nhập email"
                  placeholderTextColor="#9CA3AF"
                  value={formData.email}
                  onChangeText={(value) => handleInputChange('email', value)}
                  onFocus={() => setFocusedInput('email')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>📱 Số điện thoại</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'phoneNumber' && styles.inputFocused
                  ]}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#9CA3AF"
                  value={formData.phoneNumber}
                  onChangeText={(value) => handleInputChange('phoneNumber', value)}
                  onFocus={() => setFocusedInput('phoneNumber')}
                  onBlur={() => setFocusedInput(null)}
                  keyboardType="phone-pad"
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
                  placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
                  placeholderTextColor="#9CA3AF"
                  value={formData.password}
                  onChangeText={(value) => handleInputChange('password', value)}
                  onFocus={() => setFocusedInput('password')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>🔒 Xác nhận mật khẩu</Text>
                <TextInput
                  style={[
                    styles.input,
                    focusedInput === 'confirmPassword' && styles.inputFocused
                  ]}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor="#9CA3AF"
                  value={formData.confirmPassword}
                  onChangeText={(value) => handleInputChange('confirmPassword', value)}
                  onFocus={() => setFocusedInput('confirmPassword')}
                  onBlur={() => setFocusedInput(null)}
                  secureTextEntry
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, loading && styles.registerButtonDisabled]} 
              onPress={onRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.registerButtonText}>🚀 Tạo tài khoản</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.loginButton}
              onPress={() => navigation.navigate('Login')}
              disabled={loading}
            >
              <Text style={styles.loginButtonText}>⬅️ Đã có tài khoản? Đăng nhập</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
