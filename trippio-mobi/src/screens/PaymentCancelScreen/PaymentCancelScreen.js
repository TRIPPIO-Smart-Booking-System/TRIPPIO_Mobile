import React from 'react';
import { View, Text, Button } from 'react-native';

export default function PaymentCancelScreen({ navigation }) {
  const goToBasket = () => {
    navigation.navigate('Basket');
  };

  const goToHome = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Hotels' }]
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: 'orange', marginBottom: 16 }}>
        ⚠️ Thanh toán đã bị hủy
      </Text>
      
      <Text style={{ fontSize: 16, textAlign: 'center', marginBottom: 24 }}>
        Bạn đã hủy giao dịch thanh toán. Bạn có thể thử lại bất cứ lúc nào.
      </Text>
      
      <View style={{ width: '100%', gap: 12 }}>
        <Button 
          title="Thử lại thanh toán" 
          onPress={goToBasket}
        />
        <Button 
          title="Về trang chủ" 
          onPress={goToHome}
        />
      </View>
    </View>
  );
}
