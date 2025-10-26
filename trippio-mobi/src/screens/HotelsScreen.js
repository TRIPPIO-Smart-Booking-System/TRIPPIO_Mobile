import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { getHotels } from '../api/hotel';
import { getRoomsByHotel } from '../api/room';
import { createBooking } from '../api/booking';
import { addItem } from '../api/basket';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HotelsScreen({ navigation }) {
  const [hotels, setHotels] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await getHotels();
        // Tùy theo API trả về có bao hàm "data" hay không
        setHotels(res.data || res);
      } catch {
        Alert.alert('Lỗi', 'Không thể lấy danh sách khách sạn');
      }
    })();
  }, []);

  const addRoomToBasket = async (hotel) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      // Lấy danh sách phòng của khách sạn
      const rooms = await getRoomsByHotel(hotel.id);
      const roomsData = rooms.data || rooms;
      
      if (!roomsData || roomsData.length === 0) {
        Alert.alert('Thông báo', 'Khách sạn này chưa có phòng');
        return;
      }

      // Lấy phòng đầu tiên (hoặc có thể cho user chọn)
      const firstRoom = roomsData[0];
      
      // Step 1: Tạo Booking (pending) trước
      const bookingData = {
        userId: userId,
        bookingType: 'Accommodation',
        bookingDate: new Date().toISOString(),
        totalAmount: 2000, // Fixed price for testing
        status: 'Pending'
      };

      console.log('Creating booking:', bookingData);
      const bookingResponse = await createBooking(bookingData);
      const booking = bookingResponse.data || bookingResponse;
      
      console.log('Booking created:', booking);

      // Step 2: Thêm vào Basket với BookingId
      const item = {
        productId: firstRoom.id,
        productName: `${hotel.name} - ${firstRoom.roomType}`,
        price: 2000, // Fixed price for testing
        quantity: 1,
        productType: 'Room',
        bookingId: booking.id // Use the created booking ID
      };

      console.log('Adding to basket:', item);
      await addItem(userId, item);
      Alert.alert('Thành công', `Đã tạo booking và thêm phòng ${firstRoom.roomType} vào giỏ hàng`);
    } catch (error) {
      console.error('Add to basket error:', error);
      Alert.alert('Lỗi', 'Không thể tạo booking và thêm vào giỏ hàng');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🏨 Khách sạn</Text>
        <Text style={styles.headerSubtitle}>Tìm kiếm khách sạn phù hợp</Text>
      </View>

      <FlatList
        data={hotels}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.hotelCard}>
            <TouchableOpacity
              style={styles.hotelInfo}
              onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id })}
            >
              <View style={styles.hotelHeader}>
                <Text style={styles.hotelName}>{item.name}</Text>
                <View style={styles.starsContainer}>
                  <Text style={styles.stars}>⭐ {item.stars}</Text>
                </View>
              </View>
              <Text style={styles.hotelLocation}>📍 {item.city}, {item.country}</Text>
              <Text style={styles.hotelDescription}>
                {item.description || 'Khách sạn tiện nghi và thoải mái'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.hotelActions}>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => addRoomToBasket(item)}
              >
                <Text style={styles.addButtonText}>Đặt phòng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.hotelsList}
        showsVerticalScrollIndicator={false}
      />
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
  hotelsList: {
    padding: 15,
  },
  hotelCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
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
  hotelInfo: {
    flex: 1,
  },
  hotelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  hotelName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    flex: 1,
  },
  starsContainer: {
    backgroundColor: '#fdcb6e',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  stars: {
    fontSize: 12,
    fontWeight: 'bold',
    color: 'white',
  },
  hotelLocation: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
  },
  hotelDescription: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
    marginBottom: 12,
  },
  hotelActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  addButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
