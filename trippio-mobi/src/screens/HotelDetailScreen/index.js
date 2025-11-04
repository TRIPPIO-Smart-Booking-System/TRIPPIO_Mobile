import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Image, ActivityIndicator, Modal, TextInput } from 'react-native';
import { getHotelRooms } from '../../api/hotel';
import { createRoomBooking } from '../../api/booking';
import { addItemToBasket } from '../../api/basket';
import { useUser } from '../../contexts/UserContext';
import { handleApiError } from '../../utils/apiErrorHandler';
import { styles } from './styles';
import Colors from '../../constants/colors';

export default function HotelDetailScreen({ route, navigation }) {
  const { user, logout } = useUser();
  const { hotelId } = route.params;
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [guestCount, setGuestCount] = useState('1');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadHotelRooms();
  }, [hotelId]);

  const loadHotelRooms = async () => {
    try {
      setLoading(true);
      const res = await getHotelRooms(hotelId);
      setRooms(res.rooms || res || []);
    } catch (error) {
      console.error('Get hotel rooms error:', error);
      const errorResult = await handleApiError(error, navigation, logout);
      if (!errorResult.shouldNavigate) {
        Alert.alert('Lỗi', errorResult.message || 'Không thể lấy thông tin phòng');
      }
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = (room) => {
    setSelectedRoom(room);
    // Set default dates (tomorrow to day after tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfter = new Date(tomorrow);
    dayAfter.setDate(dayAfter.getDate() + 1);
    
    setCheckInDate(tomorrow.toISOString().split('T')[0]);
    setCheckOutDate(dayAfter.toISOString().split('T')[0]);
    setGuestCount('1');
    setShowBookingModal(true);
  };

  const addRoomToBasket = async () => {
    try {
      const userId = user?.id;
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập');
        setShowBookingModal(false);
        return;
      }

      if (!checkInDate || !checkOutDate) {
        Alert.alert('Lỗi', 'Vui lòng chọn ngày check-in và check-out');
        return;
      }

      setBookingLoading(true);

      // Step 1: Create room booking
      const checkIn = new Date(checkInDate);
      checkIn.setHours(14, 0, 0, 0); // 2 PM check-in
      const checkOut = new Date(checkOutDate);
      checkOut.setHours(11, 0, 0, 0); // 11 AM check-out

      console.log('Creating room booking with data:', {
        userId,
        roomId: selectedRoom.id,
        checkInDate: checkIn.toISOString(),
        checkOutDate: checkOut.toISOString(),
        guestCount: parseInt(guestCount) || 1
      });

      const bookingResponse = await createRoomBooking({
        userId,
        roomId: selectedRoom.id,
        checkInDate: checkIn.toISOString(),
        checkOutDate: checkOut.toISOString(),
        guestCount: parseInt(guestCount) || 1
      });

      console.log('[HotelDetail] Booking response:', bookingResponse);
      console.log('[HotelDetail] Booking response.data:', bookingResponse?.data);
      
      // Response structure: { code: 200, message: "...", data: { id: "...", ... } }
      // bookingResponse is axios response, so actual data is in bookingResponse.data
      const responseData = bookingResponse?.data;
      
      // Extract booking from response.data.data (nested structure)
      const booking = responseData?.data || responseData;
      
      // Extract bookingId - try multiple possible paths
      const bookingId = booking?.id || 
                       booking?.bookingId || 
                       booking?.Id || 
                       booking?.BookingId ||
                       responseData?.data?.id ||
                       responseData?.id ||
                       null;

      console.log('[HotelDetail] Response structure:', {
        code: responseData?.code,
        message: responseData?.message,
        hasData: !!responseData?.data,
        booking: booking,
        bookingId: bookingId
      });

      if (!bookingId) {
        console.error('[HotelDetail] Cannot extract bookingId. Response structure:', {
          fullResponse: bookingResponse,
          responseData: responseData,
          booking: booking,
          bookingKeys: booking ? Object.keys(booking) : null,
          responseDataKeys: responseData ? Object.keys(responseData) : null
        });
        Alert.alert(
          'Lỗi',
          'Không nhận được booking ID từ server. Vui lòng thử lại.\n\n' +
          'Response: ' + JSON.stringify(responseData, null, 2)
        );
        return;
      }

      // Validate bookingId is a valid UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(bookingId)) {
        console.error('[HotelDetail] Invalid bookingId format:', bookingId);
        Alert.alert('Lỗi', `Booking ID không hợp lệ: ${bookingId}`);
        return;
      }

      console.log('[HotelDetail] ✅ Valid bookingId extracted:', bookingId);

      // Step 2: Add booking to basket
      // productId should be the actual product ID (roomId), not bookingId
      // bookingId should be stored in attributes
      console.log('[HotelDetail] Adding to basket with:', {
        userId,
        productId: selectedRoom.id, // Use roomId as productId
        bookingId: bookingId, // Store bookingId in attributes
        quantity: 1,
        attributes: {
          type: 'Room',
          bookingId: bookingId, // Store bookingId in attributes
          roomId: selectedRoom.id,
          roomType: selectedRoom.roomType,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          guestCount: parseInt(guestCount) || 1
        }
      });

      await addItemToBasket(userId, {
        productId: selectedRoom.id, // Use roomId as productId (actual product)
        quantity: 1,
        attributes: {
          type: 'Room',
          bookingId: bookingId, // Store bookingId in attributes
          roomId: selectedRoom.id,
          roomType: selectedRoom.roomType,
          checkInDate: checkInDate,
          checkOutDate: checkOutDate,
          guestCount: parseInt(guestCount) || 1
        }
      });

      setShowBookingModal(false);
      Alert.alert(
        'Thành công! 🎉',
        'Đã tạo booking và thêm phòng vào giỏ hàng',
        [
          {
            text: 'Xem giỏ hàng',
            onPress: () => navigation.navigate('Basket')
          },
          { text: 'Tiếp tục', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Add room to basket error:', error);
      const errorResult = await handleApiError(error, navigation, logout);
      if (!errorResult.shouldNavigate) {
        Alert.alert(
          'Lỗi',
          errorResult.message || error.response?.data?.message || error.message || 'Không thể tạo booking và thêm vào giỏ hàng'
        );
      }
    } finally {
      setBookingLoading(false);
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
            <Text style={styles.priceValue}>
              {room.pricePerNight ? `${room.pricePerNight.toLocaleString('vi-VN')} VND` : '2,000 VND'}
            </Text>
          </View>
          
          <TouchableOpacity 
            style={styles.addToBasketButton}
            onPress={() => openBookingModal(room)}
            activeOpacity={0.8}
          >
            <Text style={styles.addToBasketText}>🛒 Đặt phòng</Text>
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

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đặt phòng</Text>
            <Text style={styles.modalSubtitle}>{selectedRoom?.roomType}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ngày check-in</Text>
              <TextInput
                style={styles.input}
                value={checkInDate}
                onChangeText={setCheckInDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.inputPlaceholder}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ngày check-out</Text>
              <TextInput
                style={styles.input}
                value={checkOutDate}
                onChangeText={setCheckOutDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.inputPlaceholder}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Số khách</Text>
              <TextInput
                style={styles.input}
                value={guestCount}
                onChangeText={setGuestCount}
                keyboardType="numeric"
                placeholder="1"
                placeholderTextColor={Colors.inputPlaceholder}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBookingModal(false)}
                disabled={bookingLoading}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addRoomToBasket}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.confirmButtonText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
