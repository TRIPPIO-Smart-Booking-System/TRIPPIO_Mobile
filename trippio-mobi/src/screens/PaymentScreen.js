import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Linking, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateBookingStatus } from '../api/booking';
import { updateOrderStatus } from '../api/order';
import Colors from '../constants/colors';

export default function PaymentScreen({ route, navigation }) {
  const { order } = route.params;
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState(null);

  const createPaymentRecord = async () => {
    try {
      console.log('Creating payment record for order:', order.id);
      
      // Vì PaymentController bị comment out, chúng ta sẽ skip bước này
      // và rely vào webhook để update status
      console.log('Payment record creation skipped - will rely on webhook');
    } catch (error) {
      console.error('Error creating payment record:', error);
      // Không throw error vì đây không phải critical step
    }
  };

  const handlePayment = async () => {
    setLoading(true);
    try {
      console.log('Starting payment for order:', order.id);
      
      // Ngay lập tức xác nhận đơn hàng khi bấm thanh toán
      await updateBookingStatusToConfirmed();
      
      // Step 1: Tạo Payment record trước
      await createPaymentRecord();
      
      // Step 2: Tạo PayOS payment link
      // Tạo OrderCode đơn giản (tối đa 6 chữ số cho PayOS)
      const orderCode = parseInt(`${order.id}`.slice(-6)); // Chỉ lấy 6 chữ số cuối của order ID
      const payosRequest = {
        orderCode: orderCode,
        amount: order.totalAmount,
        description: `Payment for order ${order.id}`, // Sử dụng tiếng Anh để tránh lỗi encoding
        returnUrl: 'https://payos.vn/return',
        cancelUrl: 'https://payos.vn/cancel'
      };

      console.log('PayOS request:', payosRequest);
      
      const response = await fetch('http://10.0.2.2:7142/api/payment/realmoney', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${await AsyncStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payosRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment API Error:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
      }

      const checkoutData = await response.json();
      console.log('PayOS response:', checkoutData);
      
      // Hiển thị thông báo thành công trước khi mở PayOS
      Alert.alert(
        'Thanh toán thành công! 🎉',
        'Đơn hàng của bạn đã được xác nhận và các booking đã được confirmed.',
        [
          {
            text: 'Xem đơn hàng',
            onPress: () => navigation.reset({
              index: 0,
              routes: [{ name: 'Orders' }]
            })
          },
          {
            text: 'Mở PayOS',
            onPress: () => {
              if (checkoutData.checkoutUrl) {
                // Delay việc mở URL để tránh crash
                setTimeout(async () => {
                  try {
                    const supported = await Linking.canOpenURL(checkoutData.checkoutUrl);
                    if (supported) {
                      await Linking.openURL(checkoutData.checkoutUrl);
                    } else {
                      Alert.alert('Lỗi', 'Không thể mở link thanh toán');
                    }
                  } catch (error) {
                    console.error('Error opening PayOS URL:', error);
                    Alert.alert('Lỗi', 'Không thể mở link thanh toán');
                  }
                }, 500); // Delay 500ms
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert('Lỗi', 'Không thể thanh toán. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };


  const updateBookingStatusToConfirmed = async () => {
    try {
      console.log('Updating booking and order status to confirmed for order:', order.id);
      
      // Lấy danh sách booking IDs từ order items
      const bookingIds = order.orderItems?.map(item => item.bookingId) || [];
      
      console.log('Booking IDs to update:', bookingIds);
      
      // Update từng booking status thành 'Confirmed'
      for (const bookingId of bookingIds) {
        if (bookingId && bookingId !== '00000000-0000-0000-0000-000000000000') {
          try {
            await updateBookingStatus(bookingId, 'Confirmed');
            console.log(`Booking ${bookingId} updated to Confirmed`);
          } catch (error) {
            console.error(`Error updating booking ${bookingId}:`, error);
          }
        }
      }
      
      // Cũng update Order status thành 'Confirmed'
      try {
        await updateOrderStatus(order.id, 'Confirmed');
        console.log(`Order ${order.id} updated to Confirmed`);
      } catch (error) {
        console.error(`Error updating order ${order.id}:`, error);
      }
    } catch (error) {
      console.error('Error updating booking status:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Đang xử lý thanh toán...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💳 Thanh toán</Text>
        <Text style={styles.headerSubtitle}>Đơn hàng #{order.id}</Text>
      </View>

      {/* Order Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Tóm tắt đơn hàng</Text>
        <View style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>🆔 Mã đơn hàng:</Text>
            <Text style={styles.summaryValue}>{order.id}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>📅 Ngày đặt:</Text>
            <Text style={styles.summaryValue}>
              {new Date(order.orderDate).toLocaleString('vi-VN')}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>📦 Số sản phẩm:</Text>
            <Text style={styles.summaryValue}>{order.orderItems?.length || 0} items</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>📊 Trạng thái:</Text>
            <View style={[
              styles.statusBadge,
              { backgroundColor: order.status === 'Confirmed' ? '#28a745' : 
                                order.status === 'Pending' ? '#ffc107' : '#dc3545' }
            ]}>
              <Text style={styles.statusText}>
                {order.status === 'Confirmed' ? '✅ Đã xác nhận' :
                 order.status === 'Pending' ? '⏳ Chờ xử lý' : '❌ Đã hủy'}
              </Text>
            </View>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>💰 Tổng tiền:</Text>
            <Text style={styles.totalAmount}>
              {order.totalAmount.toLocaleString('vi-VN')} VND
            </Text>
          </View>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Phương thức thanh toán</Text>
        <View style={styles.paymentMethodCard}>
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodIcon}>🏦</Text>
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethodName}>PayOS</Text>
              <Text style={styles.paymentMethodDesc}>
                Thanh toán an toàn và nhanh chóng
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Payment Button */}
      <View style={styles.paymentSection}>
        <TouchableOpacity
          style={styles.paymentButton}
          onPress={handlePayment}
        >
          <Text style={styles.paymentButtonText}>💳 Thanh toán với PayOS</Text>
        </TouchableOpacity>
        
        <Text style={styles.paymentNote}>
          🔒 Nhấn để mở PayOS và thanh toán đơn hàng một cách an toàn
        </Text>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6c757d',
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  summaryCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    flex: 1,
  },
  summaryValue: {
    fontSize: 14,
    color: Colors.textPrimary,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: 'bold',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
  },
  paymentMethodCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentMethodIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  paymentMethodDesc: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  paymentSection: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  paymentButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  paymentButtonText: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: 'bold',
  },
  paymentNote: {
    marginTop: 12,
    textAlign: 'center',
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 30,
  },
});
