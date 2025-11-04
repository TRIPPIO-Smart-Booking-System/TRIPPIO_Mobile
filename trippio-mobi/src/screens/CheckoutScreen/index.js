import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Linking, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { startCheckout, getCheckoutStatus } from '../../api/checkout';
import { useUser } from '../../contexts/UserContext';
import { styles } from './styles';

export default function CheckoutScreen({ route, navigation }) {
  const { user } = useUser();
  const { basket } = route.params || {};
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);
  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    if (!basket || !basket.items || basket.items.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng trống', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
      return;
    }
  }, [basket, navigation]);

  const onCheckout = async () => {
    if (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) {
      Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting checkout with basket:', basket);
      
      const userId = user?.id;
      console.log('UserID from context:', userId);
      
      const checkoutRequest = { 
        userId: userId,
        buyerName: buyerName.trim(), 
        buyerEmail: buyerEmail.trim(), 
        buyerPhone: buyerPhone.trim() 
      };
      
      console.log('Checkout request:', checkoutRequest);
      
      const res = await startCheckout(checkoutRequest);
      
      console.log('Checkout response:', res);
      
      if (res.data?.checkoutUrl) {
        setCheckoutData(res.data);
        
        Alert.alert(
          'Chọn phương thức thanh toán',
          'Bạn muốn thanh toán bằng cách nào?',
          [
            {
              text: 'Mở PayOS',
              onPress: () => openPaymentUrl(res.data.checkoutUrl)
            },
            {
              text: 'Hủy',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('Lỗi', res.message || 'Không thể tạo link thanh toán');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      Alert.alert('Lỗi', 'Không thể thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const openPaymentUrl = async (url) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        startPaymentStatusPolling();
      } else {
        Alert.alert('Lỗi', 'Không thể mở link thanh toán');
      }
    } catch (error) {
      console.error('Error opening payment URL:', error);
      Alert.alert('Lỗi', 'Không thể mở link thanh toán');
    }
  };

  const startPaymentStatusPolling = () => {
    if (!checkoutData?.orderCode) return;
    
    const pollInterval = setInterval(async () => {
      try {
        const statusRes = await getCheckoutStatus(checkoutData.orderCode);
        console.log('Payment status:', statusRes);
        
        if (statusRes.data?.status === 'PAID') {
          clearInterval(pollInterval);
          Alert.alert(
            'Thanh toán thành công!',
            'Đơn hàng của bạn đã được xác nhận.',
            [
              { 
                text: 'OK', 
                onPress: () => navigation.reset({
                  index: 0,
                  routes: [{ name: 'Orders' }]
                })
              }
            ]
          );
        } else if (statusRes.data?.status === 'CANCELLED' || statusRes.data?.status === 'FAILED') {
          clearInterval(pollInterval);
          Alert.alert(
            'Thanh toán thất bại',
            'Giao dịch đã bị hủy hoặc thất bại.',
            [{ text: 'OK' }]
          );
        }
      } catch (error) {
        console.error('Status polling error:', error);
      }
    }, 3000);
    
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Đang xử lý thanh toán...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>💳 Thông tin thanh toán</Text>
        </View>
        
        {/* Basket Summary */}
        {basket && (
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>📋 Tóm tắt đơn hàng</Text>
            {basket.items.map((item, index) => (
              <View key={index} style={styles.summaryItem}>
                <Text style={styles.summaryItemText}>
                  {item.productName || item.productId} x {item.quantity}
                </Text>
                <Text style={styles.summaryItemText}>
                  {item.price.toLocaleString('vi-VN')} VND
                </Text>
              </View>
            ))}
            <View style={styles.summaryTotal}>
              <Text style={styles.summaryTotalLabel}>Tổng cộng:</Text>
              <Text style={styles.summaryTotalAmount}>
                {basket.total.toLocaleString('vi-VN')} VND
              </Text>
            </View>
          </View>
        )}

        {/* Form */}
        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>👤 Thông tin người mua</Text>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Họ và tên *</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'name' && styles.inputFocused
              ]}
              placeholder="Nhập họ và tên"
              placeholderTextColor="#9CA3AF"
              value={buyerName}
              onChangeText={setBuyerName}
              onFocus={() => setFocusedInput('name')}
              onBlur={() => setFocusedInput(null)}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email *</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'email' && styles.inputFocused
              ]}
              placeholder="Nhập email"
              placeholderTextColor="#9CA3AF"
              value={buyerEmail}
              onChangeText={setBuyerEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
              editable={!loading}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số điện thoại *</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'phone' && styles.inputFocused
              ]}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#9CA3AF"
              value={buyerPhone}
              onChangeText={setBuyerPhone}
              keyboardType="phone-pad"
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput(null)}
              editable={!loading}
            />
          </View>
          
          <TouchableOpacity 
            style={[
              styles.checkoutButton,
              (!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()) && styles.checkoutButtonDisabled
            ]}
            onPress={onCheckout}
            disabled={!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim() || loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.checkoutButtonText}>🚀 Tiến hành thanh toán</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
