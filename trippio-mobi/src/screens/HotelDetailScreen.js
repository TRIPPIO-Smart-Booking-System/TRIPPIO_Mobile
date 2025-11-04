import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Image,
  ScrollView,
  ActivityIndicator
} from 'react-native';
import { getHotelRooms } from '../api/hotel';
import { addItem } from '../api/basket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../contexts/UserContext';
import Colors from '../constants/colors';

export default function HotelDetailScreen({ route }) {
  const { user } = useUser();
  const { hotelId } = route.params;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHotelRooms();
  }, [hotelId]);

  const loadHotelRooms = async () => {
    try {
      setLoading(true);
      const res = await getHotelRooms(hotelId);
      // Backend trả về hotel object với rooms array
      setRooms(res.rooms || []);
    } catch (error) {
      console.error('Get hotel rooms error:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin phòng');
    } finally {
      setLoading(false);
    }
  };

  const addRoomToBasket = async (room) => {
    try {
      const userId = user?.id;
      if (!userId) return Alert.alert('Lỗi', 'Chưa đăng nhập');
      
      await addItem(userId, { 
        productId: room.id, 
        quantity: 1, 
        price: 2000 // Fixed price as requested
      });
      
      Alert.alert('Thành công', 'Đã thêm phòng vào giỏ hàng! 🛒');
    } catch (error) {
      console.error('Add to basket error:', error);
      Alert.alert('Lỗi', 'Không thể thêm vào giỏ hàng');
    }
  };

  const renderRoomCard = ({ item: room }) => (
    <View style={styles.roomCard}>
      <View style={styles.roomImageContainer}>
        <Image 
          source={{ 
            uri: room.imageUrl || 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&h=200&fit=crop'
          }}
          style={styles.roomImage}
          resizeMode="cover"
        />
        <View style={styles.roomBadge}>
          <Text style={styles.roomBadgeText}>🏨</Text>
        </View>
      </View>
      
      <View style={styles.roomInfo}>
        <Text style={styles.roomType}>{room.roomType}</Text>
        <Text style={styles.roomCapacity}>👥 {room.capacity} người</Text>
        <Text style={styles.roomDescription} numberOfLines={2}>
          {room.description || 'Phòng thoải mái với đầy đủ tiện nghi hiện đại'}
        </Text>
        
        <View style={styles.roomFeatures}>
          <Text style={styles.featureItem}>🛏️ Giường đôi</Text>
          <Text style={styles.featureItem}>🚿 Phòng tắm riêng</Text>
          <Text style={styles.featureItem}>📺 TV</Text>
          <Text style={styles.featureItem}>❄️ Điều hòa</Text>
        </View>
        
        <View style={styles.roomFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Giá/đêm</Text>
            <Text style={styles.priceValue}>2,000 VND</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.addToBasketButton}
            onPress={() => addRoomToBasket(room)}
          >
            <Text style={styles.addToBasketText}>🛒 Thêm vào giỏ</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải thông tin phòng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏨 Danh sách phòng</Text>
        <Text style={styles.headerSubtitle}>Chọn phòng phù hợp cho chuyến đi của bạn</Text>
      </View>

      {rooms.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🏨</Text>
          <Text style={styles.emptyTitle}>Không có phòng nào</Text>
          <Text style={styles.emptySubtitle}>Khách sạn này chưa có phòng khả dụng</Text>
        </View>
      ) : (
        <FlatList
          data={rooms}
          keyExtractor={(item) => item.id}
          renderItem={renderRoomCard}
          contentContainerStyle={styles.roomsList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
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
    marginTop: 10,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
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
  roomsList: {
    padding: 20,
  },
  roomCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 8,
    overflow: 'hidden',
  },
  roomImageContainer: {
    position: 'relative',
  },
  roomImage: {
    width: '100%',
    height: 200,
  },
  roomBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 20,
    padding: 8,
  },
  roomBadgeText: {
    fontSize: 16,
  },
  roomInfo: {
    padding: 20,
  },
  roomType: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  roomCapacity: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  roomDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 16,
  },
  roomFeatures: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  featureItem: {
    fontSize: 12,
    color: Colors.primary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  roomFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.success,
  },
  addToBasketButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  addToBasketText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});