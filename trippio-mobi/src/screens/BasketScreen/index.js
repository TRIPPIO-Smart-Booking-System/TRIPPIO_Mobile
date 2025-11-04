import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { getBasket, removeItemFromBasket } from '../../api/basket';
import { createOrderFromBasket } from '../../api/order';
import { useUser } from '../../contexts/UserContext';
import { handleApiError } from '../../utils/apiErrorHandler';
import { styles } from './styles';
import Colors from '../../constants/colors';

export default function BasketScreen({ navigation }) {
  const { user, logout } = useUser();
  const [basket, setBasket] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadBasket();
    }
  }, [user]);

  const loadBasket = async () => {
    try {
      setLoading(true);
      const userId = user?.id;
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }
      
      const res = await getBasket(userId);
      const basketData = res.data || res;
      
      // Calculate total from items
      const items = basketData.items || [];
      const total = items.reduce((sum, item) => {
        // Try to get price from item, fallback to 2000
        const price = item.price || item.unitPrice || 2000;
        const quantity = item.quantity || 1;
        return sum + (price * quantity);
      }, 0);
      
      setBasket({
        ...basketData,
        items: items,
        total: total
      });
    } catch (error) {
      console.error('Load basket error:', error);
      const errorResult = await handleApiError(error, navigation, logout);
      if (!errorResult.shouldNavigate) {
        Alert.alert('Lỗi', errorResult.message || 'Không thể tải giỏ hàng');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (item) => {
    Alert.alert(
      'Xóa sản phẩm',
      'Bạn có chắc chắn muốn xóa sản phẩm này khỏi giỏ hàng?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            try {
              const userId = user?.id;
              if (userId && item) {
                await removeItemFromBasket(userId, item.productId);
                await loadBasket();
                Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng');
              }
            } catch (error) {
              console.error('Remove item error:', error);
              const errorResult = await handleApiError(error, navigation, logout);
              if (!errorResult.shouldNavigate) {
                Alert.alert('Lỗi', errorResult.message || 'Không thể xóa sản phẩm');
              }
            }
          },
        },
      ]
    );
  };

  const handleCheckout = async () => {
    if (!basket.items || basket.items.length === 0) {
      Alert.alert('Giỏ hàng trống', 'Vui lòng thêm sản phẩm vào giỏ hàng');
      return;
    }
    
    if (basket.total < 2000) {
      Alert.alert('Lỗi', 'Tổng tiền phải >= 2,000 VND để thanh toán');
      return;
    }

    try {
      setCheckoutLoading(true);
      const userId = user?.id;
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      // Use API to create order from basket (simpler!)
      const orderResponse = await createOrderFromBasket(userId);
      const order = orderResponse.data || orderResponse;
      
      console.log('Order created from basket:', order);
      
      Alert.alert(
        'Đặt hàng thành công! 🎉', 
        `Đơn hàng #${order.id || order.orderId} đã được tạo. Tổng tiền: ${(order.totalAmount || basket.total).toLocaleString('vi-VN')} VND`,
        [
          {
            text: 'Thanh toán ngay',
            onPress: () => navigation.navigate('Payment', { order: order })
          },
          {
            text: 'Xem đơn hàng',
            onPress: () => navigation.navigate('Orders')
          },
          {
            text: 'Tiếp tục mua sắm',
            style: 'cancel',
            onPress: () => navigation.navigate('Hotels')
          }
        ]
      );
    } catch (error) {
      console.error('Create order error:', error);
      const errorResult = await handleApiError(error, navigation, logout);
      if (!errorResult.shouldNavigate) {
        Alert.alert(
          'Lỗi', 
          errorResult.message || error.response?.data?.message || error.message || 'Không thể tạo đơn hàng. Vui lòng thử lại.'
        );
      }
    } finally {
      setCheckoutLoading(false);
    }
  };

  const getItemDisplayName = (item) => {
    // Try to get name from attributes
    if (item.attributes) {
      if (item.attributes.type === 'Room') {
        return `🏨 Phòng ${item.attributes.roomType || 'Khách sạn'}`;
      } else if (item.attributes.type === 'Show') {
        return `🎭 Show: ${item.attributes.showName || 'Show'}`;
      } else if (item.attributes.type === 'Transport') {
        return `✈️ ${item.attributes.transportName || 'Phương tiện'} - ${item.attributes.departure || ''} → ${item.attributes.destination || ''}`;
      }
    }
    return item.productName || `Sản phẩm ${item.productId?.substring(0, 8) || ''}`;
  };

  const getItemDetails = (item) => {
    const details = [];
    if (item.attributes) {
      if (item.attributes.type === 'Room') {
        if (item.attributes.checkInDate) details.push(`Check-in: ${item.attributes.checkInDate}`);
        if (item.attributes.checkOutDate) details.push(`Check-out: ${item.attributes.checkOutDate}`);
        if (item.attributes.guestCount) details.push(`${item.attributes.guestCount} khách`);
      } else if (item.attributes.type === 'Show') {
        if (item.attributes.seatNumber) details.push(`Ghế: ${item.attributes.seatNumber}`);
        if (item.attributes.seatClass) details.push(`Hạng: ${item.attributes.seatClass}`);
        if (item.attributes.showDate) details.push(`Ngày: ${item.attributes.showDate}`);
      } else if (item.attributes.type === 'Transport') {
        if (item.attributes.seatNumber) details.push(`Ghế: ${item.attributes.seatNumber}`);
        if (item.attributes.seatClass) details.push(`Hạng: ${item.attributes.seatClass}`);
      }
    }
    return details;
  };

  const renderBasketItem = ({ item, index }) => {
    const itemPrice = item.price || item.unitPrice || 2000;
    const itemQuantity = item.quantity || 1;
    const itemTotal = itemPrice * itemQuantity;
    const details = getItemDetails(item);

    return (
      <View style={styles.itemCard}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{getItemDisplayName(item)}</Text>
          {details.length > 0 && (
            <View style={styles.itemDetailsContainer}>
              {details.map((detail, idx) => (
                <Text key={idx} style={styles.itemDetail}>• {detail}</Text>
              ))}
            </View>
          )}
          <View style={styles.itemDetails}>
            <Text style={styles.itemDetail}>🔢 Số lượng: {itemQuantity}</Text>
            <Text style={styles.itemDetail}>💵 Đơn giá: {itemPrice.toLocaleString('vi-VN')} VND</Text>
            <Text style={styles.itemTotal}>
              🧮 Thành tiền: {itemTotal.toLocaleString('vi-VN')} VND
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => handleRemoveItem(item)}
          activeOpacity={0.8}
        >
          <Text style={styles.removeButtonText}>🗑️</Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading && !basket.items?.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🛒 Giỏ hàng</Text>
        <Text style={styles.headerSubtitle}>
          {basket.items?.length || 0} sản phẩm trong giỏ hàng
        </Text>
      </View>

      {basket.items && basket.items.length > 0 ? (
        <>
          <FlatList
            data={basket.items}
            keyExtractor={(item, idx) => (item.productId || idx.toString()) + idx}
            renderItem={renderBasketItem}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadBasket} tintColor={Colors.primary} />
            }
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.itemsList}
          />
          
          <View style={styles.summarySection}>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>💰 Tổng cộng</Text>
              <Text style={styles.summaryAmount}>
                {basket.total.toLocaleString('vi-VN')} VND
              </Text>
            </View>
            
            <TouchableOpacity 
              style={[
                styles.checkoutButton,
                (!basket.items || basket.items.length === 0 || basket.total < 2000) && styles.checkoutButtonDisabled
              ]}
              onPress={handleCheckout}
              disabled={!basket.items || basket.items.length === 0 || basket.total < 2000 || checkoutLoading}
              activeOpacity={0.8}
            >
              {checkoutLoading ? (
                <ActivityIndicator color={Colors.textWhite} />
              ) : (
                <Text style={styles.checkoutButtonText}>💳 Thanh toán</Text>
              )}
            </TouchableOpacity>
            
            {basket.total < 2000 && basket.items.length > 0 && (
              <Text style={styles.warningText}>
                ⚠️ Tổng tiền phải >= 2,000 VND để thanh toán
              </Text>
            )}
          </View>
        </>
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🛒</Text>
          <Text style={styles.emptyTitle}>Giỏ hàng trống</Text>
          <Text style={styles.emptySubtitle}>
            Hãy thêm sản phẩm vào giỏ hàng để bắt đầu mua sắm
          </Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Hotels')}
            activeOpacity={0.8}
          >
            <Text style={styles.shopButtonText}>🛍️ Bắt đầu mua sắm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
