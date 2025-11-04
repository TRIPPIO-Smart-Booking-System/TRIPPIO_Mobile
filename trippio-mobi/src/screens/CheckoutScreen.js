import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, Alert, ActivityIndicator, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { startCheckout, getCheckoutStatus } from '../api/checkout';
import { useUser } from '../contexts/UserContext';

export default function CheckoutScreen({ route, navigation }) {
  const { user } = useUser();
  const { basket } = route.params || {};
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

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
      
      // Get userId from UserContext
      const userId = user?.id;
      console.log('UserID from context:', userId);
      
      const checkoutRequest = { 
        userId: userId, // Pass userId explicitly
        buyerName: buyerName.trim(), 
        buyerEmail: buyerEmail.trim(), 
        buyerPhone: buyerPhone.trim() 
      };
      
      console.log('Checkout request:', checkoutRequest);
      
      const res = await startCheckout(checkoutRequest);
      
      console.log('Checkout response:', res);
      
      if (res.data?.checkoutUrl) {
        setCheckoutData(res.data);
        
        // Show payment options
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
        // Start polling for payment status
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
    }, 3000); // Poll every 3 seconds
    
    // Stop polling after 5 minutes
    setTimeout(() => {
      clearInterval(pollInterval);
    }, 300000);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 16 }}>Đang xử lý thanh toán...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>
        Thông tin thanh toán
      </Text>
      
      {/* Basket Summary */}
      {basket && (
        <View style={{ backgroundColor: '#f5f5f5', padding: 12, marginBottom: 16, borderRadius: 8 }}>
          <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>Tóm tắt đơn hàng:</Text>
          {basket.items.map((item, index) => (
            <Text key={index} style={{ marginLeft: 8 }}>
              • {item.productName || item.productId} x {item.quantity} = {item.price.toLocaleString('vi-VN')} VND
            </Text>
          ))}
          <Text style={{ fontWeight: 'bold', marginTop: 8, color: 'green' }}>
            Tổng: {basket.total.toLocaleString('vi-VN')} VND
          </Text>
        </View>
      )}

      <TextInput 
        placeholder="Họ và tên *" 
        value={buyerName} 
        onChangeText={setBuyerName}
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 12, borderRadius: 8 }}
      />
      <TextInput 
        placeholder="Email *" 
        value={buyerEmail} 
        onChangeText={setBuyerEmail}
        keyboardType="email-address"
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 12, borderRadius: 8 }}
      />
      <TextInput 
        placeholder="Số điện thoại *" 
        value={buyerPhone} 
        onChangeText={setBuyerPhone}
        keyboardType="phone-pad"
        style={{ borderWidth: 1, borderColor: '#ddd', padding: 12, marginBottom: 16, borderRadius: 8 }}
      />
      
      <Button 
        title="Tiến hành thanh toán" 
        onPress={onCheckout}
        disabled={!buyerName.trim() || !buyerEmail.trim() || !buyerPhone.trim()}
      />
    </View>
  );
}