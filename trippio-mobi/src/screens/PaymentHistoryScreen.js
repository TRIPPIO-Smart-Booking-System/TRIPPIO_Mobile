import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPaymentsByUser } from '../api/payment';
import { useUser } from '../contexts/UserContext';

export default function PaymentHistoryScreen() {
  const { user } = useUser();
  const [payments, setPayments] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const userId = user?.id;
        if (!userId) {
          Alert.alert('Lỗi', 'Chưa đăng nhập');
          return;
        }
        const res = await getPaymentsByUser(userId);
        setPayments(res.data || []);
      } catch {
        Alert.alert('Lỗi', 'Không thể tải lịch sử thanh toán');
      }
    })();
  }, [user]);

  return (
    <View style={{ flex: 1, padding: 16 }}>
      <FlatList
        data={payments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1 }}>
            <Text>Order: {item.orderId} - {item.status}</Text>
            <Text>Số tiền: {item.amount}</Text>
            <Text>Phương thức: {item.paymentMethod}</Text>
          </View>
        )}
      />
    </View>
  );
}