import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getOrderById } from '../../api/order';
import { styles } from './styles';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'confirmed': return '#10B981';
    case 'pending': return '#F59E0B';
    case 'cancelled': return '#EF4444';
    default: return '#6B7280';
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

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrderDetail();
  }, [orderId]);

  const loadOrderDetail = async () => {
    try {
      setLoading(true);
      console.log('Loading order detail for ID:', orderId);
      
      const response = await getOrderById(orderId);
      const orderData = response.data || response;
      
      console.log('Order detail loaded:', orderData);
      setOrder(orderData);
    } catch (error) {
      console.error('Load order detail error:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết đơn hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = (itemIndex) => {
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc chắn muốn xóa sản phẩm này khỏi đơn hàng?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Thông báo', 'Tính năng xóa sản phẩm đang được phát triển');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy đơn hàng.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Chi tiết đơn hàng</Text>
        <Text style={styles.headerSubtitle}>Đơn hàng #{order.id}</Text>
      </View>

      {/* Order Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Thông tin đơn hàng</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🆔</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Mã đơn hàng</Text>
              <Text style={styles.infoValue}>{order.id}</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày đặt</Text>
              <Text style={styles.infoValue}>
                {new Date(order.orderDate).toLocaleString('vi-VN')}
              </Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📦</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Số sản phẩm</Text>
              <Text style={styles.infoValue}>{order.orderItems?.length || 0} sản phẩm</Text>
            </View>
          </View>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💰</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tổng tiền</Text>
              <Text style={[styles.infoValue, styles.totalAmount]}>
                {order.totalAmount.toLocaleString('vi-VN')} VND
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.statusContainer}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(order.status) }
          ]}>
            <Text style={styles.statusText}>
              {getStatusText(order.status)}
            </Text>
          </View>
        </View>
      </View>

      {/* Order Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🛍️ Sản phẩm ({order.orderItems?.length || 0})</Text>
        
        {order.orderItems?.map((item, index) => (
          <View key={index} style={styles.itemCard}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>
                {item.bookingName || `Sản phẩm ${index + 1}`}
              </Text>
              {order.status === 'Pending' && (
                <TouchableOpacity
                  style={styles.removeButton}
                  onPress={() => handleRemoveItem(index)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.removeButtonText}>🗑️</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.itemDetails}>
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemDetailLabel}>📋 Booking ID:</Text>
                <Text style={styles.itemDetailValue}>{item.bookingId}</Text>
              </View>
              
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemDetailLabel}>🔢 Số lượng:</Text>
                <Text style={styles.itemDetailValue}>{item.quantity}</Text>
              </View>
              
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemDetailLabel}>💵 Giá:</Text>
                <Text style={[styles.itemDetailValue, styles.itemPrice]}>
                  {item.price.toLocaleString('vi-VN')} VND
                </Text>
              </View>
              
              <View style={styles.itemDetailRow}>
                <Text style={styles.itemDetailLabel}>🧮 Thành tiền:</Text>
                <Text style={[styles.itemDetailValue, styles.itemTotal]}>
                  {(item.price * item.quantity).toLocaleString('vi-VN')} VND
                </Text>
              </View>
            </View>
          </View>
        )) || (
          <View style={styles.emptyItems}>
            <Text style={styles.emptyItemsText}>📦 Không có sản phẩm nào</Text>
          </View>
        )}
      </View>

      {/* Summary */}
      <View style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>💰 Tổng cộng</Text>
          <Text style={styles.summaryAmount}>
            {order.totalAmount.toLocaleString('vi-VN')} VND
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
