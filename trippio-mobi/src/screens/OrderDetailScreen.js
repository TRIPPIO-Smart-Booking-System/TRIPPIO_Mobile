import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { getOrderById } from '../api/order';

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
            // TODO: Implement remove item API call
            Alert.alert('Thông báo', 'Tính năng xóa sản phẩm đang được phát triển');
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
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
    <ScrollView style={styles.container}>
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
            { backgroundColor: order.status === 'Confirmed' ? '#28a745' : 
                              order.status === 'Pending' ? '#ffc107' : '#dc3545' }
          ]}>
            <Text style={styles.statusText}>
              {order.status === 'Confirmed' ? '✅ Đã xác nhận' :
               order.status === 'Pending' ? '⏳ Chờ xử lý' : '❌ Đã hủy'}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
  header: {
    backgroundColor: '#6c5ce7',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
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
    color: '#2d3436',
    marginBottom: 15,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '500',
  },
  totalAmount: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  statusContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    flex: 1,
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 14,
  },
  itemDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
  },
  itemDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  itemDetailLabel: {
    fontSize: 14,
    color: '#636e72',
    flex: 1,
  },
  itemDetailValue: {
    fontSize: 14,
    color: '#2d3436',
    fontWeight: '500',
  },
  itemPrice: {
    color: '#28a745',
    fontWeight: 'bold',
  },
  itemTotal: {
    color: '#6c5ce7',
    fontWeight: 'bold',
  },
  emptyItems: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 40,
    alignItems: 'center',
  },
  emptyItemsText: {
    fontSize: 16,
    color: '#636e72',
    fontStyle: 'italic',
  },
  summarySection: {
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  summaryCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 20,
    borderWidth: 2,
    borderColor: '#28a745',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 8,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#28a745',
  },
});