import React, { useEffect } from 'react';
import { View, Text, Button, Alert } from 'react-native';
import { getCheckoutStatus } from '../api/checkout';

export default function PaymentSuccessScreen({ route, navigation }) {
  const { orderCode } = route.params || {};

  useEffect(() => {
    if (orderCode) {
      checkPaymentStatus();
    }
  }, [orderCode]);

  const checkPaymentStatus = async () => {
    try {
      const res = await getCheckoutStatus(orderCode);
      console.log('Payment status check:', res);
      
      if (res.data?.status === 'PAID') {
        // Payment confirmed
        console.log('Payment confirmed for order:', orderCode);
      } else {
        Alert.alert(
          'Thanh toán chưa hoàn tất',
          'Vui lòng kiểm tra lại trạng thái thanh toán.',
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('Error checking payment status:', error);
    }
  };

  const goToOrders = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Orders' }]
    });
  };

  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Hotels' }]
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'green', marginBottom: 16 }}>
        ✅ Thanh toán thành công!
      </Text>
      
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 8 }}>
        Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.
      </Text>
      
      {orderCode && (
        <Text style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
          Mã đơn hàng: {orderCode}
        </Text>
      )}
      
      <View style={{ width: '100%', gap: 12 }}>
        <Button 
          title="Xem đơn hàng" 
          onPress={goToOrders}
        />
        <Button 
          title="Về trang chủ" 
          onPress={goToHome}
        />
      </View>
    </View>
  );
}
