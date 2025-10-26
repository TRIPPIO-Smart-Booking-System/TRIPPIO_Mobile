import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import { forgotPassword } from '../api/auth';

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');

  const onSubmit = async () => {
    try {
      await forgotPassword(email);
      Alert.alert('Đã gửi OTP', 'Kiểm tra email để lấy OTP');
      navigation.navigate('ResetPassword', { email });
    } catch {
      Alert.alert('Lỗi', 'Không thể gửi OTP');
    }
  };

  return (
    <View style={{ padding: 16 }}>
      <Text>Quên mật khẩu</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
      <Button title="Gửi OTP" onPress={onSubmit} />
    </View>
  );
}