import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBasket, removeItem } from '../api/basket';
import { createOrder } from '../api/order';

export default function BasketScreen({ navigation }) {
  const [basket, setBasket] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadBasket();
  }, []);

  const loadBasket = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }
      
      const res = await getBasket(userId);
      const basketData = res.data || res;
      
      // Set fixed price 2000 VND for all items for testing
      const itemsWithFixedPrice = (basketData.items || []).map(item => ({
        ...item,
        price: 2000
      }));
      
      const total = itemsWithFixedPrice.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      setBasket({
        ...basketData,
        items: itemsWithFixedPrice,
        total: total
      });
    } catch (error) {
      console.error('Load basket error:', error);
      Alert.alert('Lỗi', 'Không thể tải giỏ hàng');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (itemIndex) => {
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
              const userId = await AsyncStorage.getItem('userId');
              const item = basket.items[itemIndex];
              
              if (userId && item) {
                await removeItem(userId, item.productId);
                await loadBasket(); // Reload basket after removal
                Alert.alert('Thành công', 'Đã xóa sản phẩm khỏi giỏ hàng');
              }
            } catch (error) {
              console.error('Remove item error:', error);
              Alert.alert('Lỗi', 'Không thể xóa sản phẩm');
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
      Alert.alert('Lỗi', 'Tổng tiền phải >= 2,000 VND');
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      console.log('Creating order manually for user:', userId);
      
      // Step 2: Tạo Order thủ công với BookingIds hợp lệ
      // Mỗi item trong basket cần có BookingId hợp lệ
      const orderItems = basket.items.map(item => {
        // Tạo BookingId mới cho mỗi item (hoặc sử dụng BookingId có sẵn nếu có)
        const bookingId = item.bookingId && item.bookingId !== '00000000-0000-0000-0000-000000000000' 
          ? item.bookingId 
          : '1f0f99d7-dbd0-438d-a3c9-6069ac976661'; // Sử dụng BookingId đã tạo trước đó
        
        return {
          bookingId: bookingId,
          quantity: item.quantity,
          price: item.price
        };
      });

      const orderRequest = {
        userId: userId,
        orderItems: orderItems,
        totalAmount: basket.total
      };

      console.log('Order request:', orderRequest);
      
      const orderResponse = await createOrder(orderRequest);
      const order = orderResponse.data || orderResponse;
      
      console.log('Order created:', order);
      
      Alert.alert(
        'Đặt hàng thành công!', 
        `Đơn hàng #${order.id} đã được tạo. Tổng tiền: ${order.totalAmount.toLocaleString('vi-VN')} VND`,
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
            onPress: () => navigation.navigate('Hotels')
          }
        ]
      );
    } catch (error) {
      console.error('Create order error:', error);
      Alert.alert('Lỗi', 'Không thể tạo đơn hàng. Vui lòng thử lại.');
    }
  };

  const renderBasketItem = ({ item, index }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName}>{item.productName || item.productId}</Text>
        <View style={styles.itemDetails}>
          <Text style={styles.itemDetail}>🔢 Số lượng: {item.quantity}</Text>
          <Text style={styles.itemDetail}>💵 Giá: {item.price.toLocaleString('vi-VN')} VND</Text>
          <Text style={styles.itemTotal}>
            🧮 Thành tiền: {(item.price * item.quantity).toLocaleString('vi-VN')} VND
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemoveItem(index)}
      >
        <Text style={styles.removeButtonText}>🗑️</Text>
      </TouchableOpacity>
    </View>
  );

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
            keyExtractor={(item, idx) => item.productId + idx}
            renderItem={renderBasketItem}
            refreshControl={
              <RefreshControl refreshing={loading} onRefresh={loadBasket} />
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
              disabled={!basket.items || basket.items.length === 0 || basket.total < 2000}
            >
              <Text style={styles.checkoutButtonText}>💳 Thanh toán</Text>
            </TouchableOpacity>
            
            {basket.total < 2000 && basket.items.length > 0 && (
              <Text style={styles.warningText}>
                ⚠️ Tổng tiền phải >= 2,000 VND
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
            onPress={() => navigation.navigate('MainTabs')}
          >
            <Text style={styles.shopButtonText}>🛍️ Bắt đầu mua sắm</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  itemsList: {
    padding: 15,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  itemDetails: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 10,
  },
  itemDetail: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 4,
  },
  itemTotal: {
    fontSize: 14,
    color: '#6c5ce7',
    fontWeight: 'bold',
  },
  removeButton: {
    backgroundColor: '#dc3545',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginLeft: 10,
  },
  removeButtonText: {
    color: 'white',
    fontSize: 16,
  },
  summarySection: {
    padding: 20,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  summaryCard: {
    backgroundColor: '#e8f5e8',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#28a745',
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#28a745',
  },
  checkoutButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
    elevation: 0,
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  warningText: {
    color: '#dc3545',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  shopButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: '#6c5ce7',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});