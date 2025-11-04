import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { getHotels } from '../../api/hotel';
import { getRoomsByHotel } from '../../api/room';
import { createBooking } from '../../api/booking';
import { addItem } from '../../api/basket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from './styles';

export default function HotelsScreen({ navigation }) {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadHotels();
  }, []);

  const loadHotels = async () => {
    try {
      setLoading(true);
      const res = await getHotels();
      setHotels(res.data || res || []);
    } catch (error) {
      console.error('Load hotels error:', error);
      Alert.alert('Lỗi', 'Không thể lấy danh sách khách sạn');
    } finally {
      setLoading(false);
    }
  };

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
        totalAmount: 2000,
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
        price: 2000,
        quantity: 1,
        productType: 'Room',
        bookingId: booking.id
      };

      console.log('Adding to basket:', item);
      await addItem(userId, item);
      Alert.alert('Thành công', `Đã tạo booking và thêm phòng ${firstRoom.roomType} vào giỏ hàng`);
    } catch (error) {
      console.error('Add to basket error:', error);
      Alert.alert('Lỗi', 'Không thể tạo booking và thêm vào giỏ hàng');
    }
  };

  const renderHotelItem = ({ item }) => (
    <View style={styles.hotelCard}>
      <TouchableOpacity
        style={styles.hotelInfo}
        onPress={() => navigation.navigate('HotelDetail', { hotelId: item.id })}
        activeOpacity={0.9}
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
          activeOpacity={0.8}
        >
          <Text style={styles.addButtonText}>🏨 Đặt phòng</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading && hotels.length === 0) {
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
        <Text style={styles.headerTitle}>🏨 Khách sạn</Text>
        <Text style={styles.headerSubtitle}>Tìm kiếm khách sạn phù hợp</Text>
      </View>

      <FlatList
        data={hotels}
        keyExtractor={(item) => item.id}
        renderItem={renderHotelItem}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadHotels} tintColor="#6366F1" />
        }
        contentContainerStyle={styles.hotelsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
