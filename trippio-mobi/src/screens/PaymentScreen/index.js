import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, Linking, ScrollView, AppState } from 'react-native';
import { updateBookingStatus } from '../../api/booking';
import { updateOrderStatus } from '../../api/order';
import { createPayOSPayment } from '../../api/payment';
import { useUser } from '../../contexts/UserContext';
import { handleApiError } from '../../utils/apiErrorHandler';
import { styles } from './styles';
import Colors from '../../constants/colors';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed': return Colors.success;
    case 'pending': return Colors.warning;
    case 'cancelled': return Colors.error;
    default: return Colors.textSecondary;
  }
};

const getStatusText = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed': return '✅ Đã xác nhận';
    case 'pending': return '⏳ Chờ xử lý';
    case 'cancelled': return '❌ Đã hủy';
    default: return status;
  }
};

export default function PaymentScreen({ route, navigation }) {
  const { user, logout } = useUser();
  const { order } = route.params;
  const [loading, setLoading] = useState(false);

  // Listen for app state changes (when user returns from PayOS)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground - user might have returned from PayOS
        console.log('[PaymentScreen] App became active - user may have returned from PayOS');
        // Don't auto-navigate - let user navigate manually
      }
    });

    return () => {
      subscription?.remove();
    };
  }, []);

  const updateBookingStatusToConfirmed = async () => {
    try {
      console.log('Updating booking and order status to confirmed for order:', order.id);
      
      const bookingIds = order.orderItems?.map(item => item.bookingId) || [];
      
      console.log('Booking IDs to update:', bookingIds);
      
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

  const handlePayment = async () => {
    setLoading(true);
    try {
      console.log('[PaymentScreen] Starting payment for order:', order.id);
      console.log('[PaymentScreen] Order details:', {
        id: order.id,
        totalAmount: order.totalAmount,
        orderItems: order.orderItems,
        status: order.status
      });

      // Validate order amount
      const totalAmount = Math.round(order.totalAmount || 0);
      if (totalAmount < 2000) {
        Alert.alert('Lỗi', 'Số tiền thanh toán phải tối thiểu 2,000 VND');
        setLoading(false);
        return;
      }

      // Validate order status - don't allow payment for already confirmed orders
      if (order.status === 'Confirmed') {
        Alert.alert('Thông báo', 'Đơn hàng này đã được xác nhận rồi.');
        setLoading(false);
        return;
      }

      // Step 1: Create PayOS payment FIRST (before confirming)
      // Generate unique orderCode (1-999999 for PayOS)
      // Use combination of order ID hash and timestamp to ensure uniqueness
      let orderCode;
      
      if (order.id) {
        // Convert order.id to string first (it might be number or string)
        const orderIdStr = String(order.id).replace(/-/g, '');
        let hash = 0;
        for (let i = 0; i < orderIdStr.length; i++) {
          const char = orderIdStr.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32-bit integer
        }
        
        // Combine with timestamp (last 6 digits) to ensure uniqueness
        const timestamp = Date.now();
        const timeHash = timestamp % 1000000;
        
        // Combine both and ensure it's in range 1-999999
        orderCode = Math.abs(hash * 1000000 + timeHash) % 999999;
        
        // Ensure it's at least 1
        if (orderCode < 1) {
          orderCode = Math.abs(hash) % 999998 + 1;
        }
        
        // If still too small, use random fallback
        if (orderCode < 1000) {
          orderCode = Math.floor(Math.random() * 900000) + 100000; // 100000-999999
        }
      } else {
        // Fallback: use random number in range 100000-999999
        orderCode = Math.floor(Math.random() * 900000) + 100000;
      }
      
      console.log('[PaymentScreen] Generated orderCode:', orderCode, 'from order:', order.id);
      
      const paymentResponse = await createPayOSPayment({
        orderCode: orderCode,
        amount: totalAmount,
        description: `Thanh toán đơn hàng ${String(order.id)}`.substring(0, 255),
        buyerName: user?.firstName && user?.lastName ? `${user.firstName} ${user.lastName}`.substring(0, 100) : (user?.userName?.substring(0, 100) || null),
        buyerEmail: user?.email || null,
        buyerPhone: user?.phoneNumber || null,
        userId: user?.id || null
      });

      console.log('[PaymentScreen] Payment response:', paymentResponse);

      // Extract checkoutUrl from response (could be nested)
      const checkoutUrl = paymentResponse?.checkoutUrl || 
                         paymentResponse?.data?.checkoutUrl || 
                         null;

      if (!checkoutUrl) {
        console.error('[PaymentScreen] No checkoutUrl in response:', paymentResponse);
        throw new Error('Không nhận được link thanh toán từ PayOS. Vui lòng thử lại.');
      }

      console.log('[PaymentScreen] Checkout URL:', checkoutUrl);

      // Step 2: Update booking and order status to Confirmed AFTER payment is created
      // Only update status if payment link is successfully created
      await updateBookingStatusToConfirmed();
      console.log('[PaymentScreen] Order and bookings updated to Confirmed after payment creation');

      // Show success message and open PayOS
      Alert.alert(
        'Mở PayOS thanh toán 💳',
        'Bạn sẽ được chuyển đến trang thanh toán PayOS để hoàn tất thanh toán.',
        [
          {
            text: 'Hủy',
            style: 'cancel',
            onPress: () => {
              // Go back to previous screen instead of reset
              navigation.goBack();
            }
          },
          {
            text: 'Mở PayOS',
            onPress: async () => {
              try {
                console.log('[PaymentScreen] Opening PayOS URL:', checkoutUrl);
                const supported = await Linking.canOpenURL(checkoutUrl);
                if (supported) {
                  // Open PayOS and let user complete payment
                  // Don't navigate away immediately - let user come back naturally
                  await Linking.openURL(checkoutUrl);
                  
                  // Store payment info for when user returns
                  // The app will handle deep linking or user will manually return
                  console.log('[PaymentScreen] PayOS opened, waiting for user to return...');
                } else {
                  Alert.alert('Lỗi', 'Không thể mở link thanh toán. Vui lòng thử lại.');
                }
              } catch (error) {
                console.error('[PaymentScreen] Error opening PayOS URL:', error);
                Alert.alert('Lỗi', 'Không thể mở link thanh toán. Vui lòng thử lại.');
              }
            }
          }
        ]
      );
      
    } catch (error) {
      console.error('[PaymentScreen] Payment error:', error);
      
      // Check if error is due to duplicate orderCode
      const errorMessage = error.response?.data?.message || error.response?.data?.error || error.message;
      if (errorMessage && (errorMessage.includes('đã tồn tại') || errorMessage.includes('already exists') || errorMessage.includes('duplicate'))) {
        // Retry with a new orderCode
        Alert.alert(
          'Lỗi',
          'Mã đơn hàng đã được sử dụng. Đang thử lại với mã mới...',
          [
            {
              text: 'Thử lại',
              onPress: () => {
                // Retry payment with new orderCode
                setTimeout(() => handlePayment(), 500);
              }
            },
            {
              text: 'Hủy',
              style: 'cancel'
            }
          ]
        );
        return;
      }
      
      const errorResult = await handleApiError(error, navigation, logout);
      if (!errorResult.shouldNavigate) {
        Alert.alert(
          'Lỗi', 
          errorResult.message || errorMessage || 'Không thể thanh toán. Vui lòng thử lại.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang xử lý thanh toán...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
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
              {new Date(order.orderDate || order.dateCreated || Date.now()).toLocaleString('vi-VN')}
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
              { backgroundColor: getStatusColor(order.status) }
            ]}>
              <Text style={styles.statusText}>
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>💰 Tổng tiền:</Text>
            <Text style={styles.totalAmount}>
              {(order.totalAmount || 0).toLocaleString('vi-VN')} VND
            </Text>
          </View>
        </View>
      </View>

      {/* Payment Method */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💳 Phương thức thanh toán</Text>
        <View style={styles.paymentMethodCard}>
          <View style={styles.paymentMethodInfo}>
            <Text style={styles.paymentMethodIcon}>💳</Text>
            <View style={styles.paymentMethodDetails}>
              <Text style={styles.paymentMethodName}>PayOS</Text>
              <Text style={styles.paymentMethodDescription}>
                Thanh toán an toàn qua PayOS
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Payment Button */}
      <View style={styles.paymentSection}>
        <TouchableOpacity
          style={styles.payButton}
          onPress={handlePayment}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <>
              <Text style={styles.payButtonText}>💳 Thanh toán ngay</Text>
              <Text style={styles.payButtonSubtext}>
                {(order.totalAmount || 0).toLocaleString('vi-VN')} VND
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
