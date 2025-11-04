import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { getOrdersByUser } from '../../api/order';
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

export default function OrdersScreen({ navigation }) {
  const { user, logout } = useUser();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      const userId = user?.id;
      if (!userId) {
        setLoading(false);
        return;
      }

      console.log('[OrdersScreen] Loading orders for user:', userId);
      const response = await getOrdersByUser(userId);
      const ordersData = response?.data || response || [];
      
      // Ensure ordersData is an array
      const ordersArray = Array.isArray(ordersData) ? ordersData : [];
      
      console.log('[OrdersScreen] Orders loaded:', ordersArray.length);
      setOrders(ordersArray);
    } catch (error) {
      console.error('[OrdersScreen] Load orders error:', error);
      const errorResult = await handleApiError(error, navigation, logout);
      if (!errorResult.shouldNavigate) {
        // Don't show alert if navigating away
        console.log('[OrdersScreen] Error message:', errorResult.message);
      }
      setOrders([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  }, [user?.id, navigation, logout]);

  // Use focus listener to reload orders when screen comes into focus
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      // Reload orders when screen is focused
      if (user?.id) {
        loadOrders();
      }
    });

    // Initial load
    if (user?.id) {
      loadOrders();
    }

    return unsubscribe;
  }, [navigation, user?.id, loadOrders]);

  const onRefresh = useCallback(() => {
    loadOrders();
  }, [loadOrders]);

  const getStatusText = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return '✅ Đã xác nhận';
      case 'pending': return '⏳ Chờ xử lý';
      case 'cancelled': return '❌ Đã hủy';
      default: return status || 'Unknown';
    }
  }, []);

  const handleOrderPress = useCallback((orderId) => {
    navigation.navigate('OrderDetail', { orderId });
  }, [navigation]);

  const handlePaymentPress = useCallback((order) => {
    navigation.navigate('Payment', { order });
  }, [navigation]);

  const renderOrderItem = useCallback(({ item }) => (
    <View style={styles.orderCard}>
      <TouchableOpacity
        style={styles.orderContent}
        onPress={() => handleOrderPress(item.id)}
        activeOpacity={0.9}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
            <Text style={styles.orderDate}>
              📅 {item.orderDate ? new Date(item.orderDate).toLocaleDateString('vi-VN') : 'N/A'}
            </Text>
            <Text style={styles.orderItems}>
              📦 {item.orderItems?.length || 0} sản phẩm
            </Text>
          </View>
          <View style={styles.orderStatus}>
            <View style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) }
            ]}>
              <Text style={styles.statusText}>
                {getStatusText(item.status)}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.orderFooter}>
          <Text style={styles.orderTotal}>
            💰 {(item.totalAmount || 0).toLocaleString('vi-VN')} VND
          </Text>
        </View>
      </TouchableOpacity>
      
      {/* Action Buttons */}
      <View style={styles.orderActions}>
        {item.status === 'Pending' && (
          <TouchableOpacity
            style={styles.payButton}
            onPress={() => handlePaymentPress(item)}
            activeOpacity={0.8}
          >
            <Text style={styles.payButtonText}>💳 Thanh toán</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={styles.detailButton}
          onPress={() => handleOrderPress(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.detailButtonText}>👁️ Chi tiết</Text>
        </TouchableOpacity>
      </View>
    </View>
  ), [handleOrderPress, handlePaymentPress, getStatusText]);

  if (loading && orders.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>📋 Đơn hàng của tôi</Text>
            <Text style={styles.headerSubtitle}>Quản lý và theo dõi đơn hàng</Text>
          </View>
        </View>
      </View>
      
      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
          <Text style={styles.emptySubtitle}>
            Bắt đầu mua sắm để tạo đơn hàng đầu tiên của bạn
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('MainTabs')}
            activeOpacity={0.8}
          >
            <Text style={styles.shopButtonText}>🛍️ Bắt đầu mua sắm</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => String(item.id || Math.random())}
          renderItem={renderOrderItem}
          refreshControl={
            <RefreshControl refreshing={loading} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.ordersList}
          // Performance optimizations
          initialNumToRender={5}
          maxToRenderPerBatch={5}
          windowSize={10}
          removeClippedSubviews={true}
          updateCellsBatchingPeriod={50}
          getItemLayout={(data, index) => ({
            length: 200, // Approximate item height
            offset: 200 * index,
            index,
          })}
        />
      )}
    </View>
  );
}
