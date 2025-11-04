import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, FlatList, Modal, TextInput } from 'react-native';
import { getTransportWithTrips } from '../../api/transport';
import { createTransportBooking } from '../../api/booking';
import { addItemToBasket } from '../../api/basket';
import { useUser } from '../../contexts/UserContext';
import { handleApiError } from '../../utils/apiErrorHandler';
import { styles, width } from './styles';
import Colors from '../../constants/colors';

export default function TransportDetailScreen({ route, navigation }) {
  const { user, logout } = useUser();
  const { transportId } = route.params;
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [seatNumber, setSeatNumber] = useState('');
  const [seatClass, setSeatClass] = useState('Economy');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadTransportDetail();
  }, [transportId]);

  const loadTransportDetail = async () => {
    try {
      setLoading(true);
      const response = await getTransportWithTrips(transportId);
      setTransport(response.data || response.value || response);
    } catch (error) {
      console.error('Load transport detail error:', error);
      const errorResult = await handleApiError(error, navigation, logout);
      if (!errorResult.shouldNavigate) {
        Alert.alert('Lỗi', errorResult.message || 'Không thể tải chi tiết phương tiện');
      }
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = (trip) => {
    if (!trip) {
      Alert.alert('Lỗi', 'Vui lòng chọn một chuyến');
      return;
    }
    setSelectedTrip(trip);
    setSeatNumber('');
    setSeatClass('Economy');
    setShowBookingModal(true);
  };

  const addTransportToBasket = async () => {
    try {
      const userId = user?.id;
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập');
        setShowBookingModal(false);
        return;
      }

      if (!selectedTrip) {
        Alert.alert('Lỗi', 'Vui lòng chọn chuyến');
        return;
      }

      if (!seatNumber) {
        Alert.alert('Lỗi', 'Vui lòng nhập số ghế');
        return;
      }

      setBookingLoading(true);

      // Step 1: Create transport booking
      const bookingResponse = await createTransportBooking({
        userId,
        tripId: selectedTrip.id,
        seatNumber,
        seatClass: seatClass || null
      });

      // Response structure: { code: 200, message: "...", data: { id: "...", ... } }
      const responseData = bookingResponse?.data;
      const booking = responseData?.data || responseData;
      
      // Extract bookingId from response.data.data.id
      const bookingId = booking?.id || 
                       booking?.bookingId || 
                       responseData?.data?.id ||
                       responseData?.id ||
                       null;

      console.log('[TransportDetail] Booking response structure:', {
        code: responseData?.code,
        message: responseData?.message,
        bookingId: bookingId
      });

      if (!bookingId) {
        console.error('[TransportDetail] Cannot extract bookingId:', responseData);
        Alert.alert('Lỗi', 'Không nhận được booking ID từ server. Vui lòng thử lại.');
        return;
      }

      // Validate bookingId is UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(bookingId)) {
        Alert.alert('Lỗi', `Booking ID không hợp lệ: ${bookingId}`);
        return;
      }

      // Step 2: Add booking to basket
      // productId should be the actual product ID (tripId), not bookingId
      // bookingId should be stored in attributes
      console.log('[TransportDetail] Adding to basket with:', {
        userId,
        productId: selectedTrip.id, // Use tripId as productId
        bookingId: bookingId, // Store bookingId in attributes
        quantity: 1
      });

      await addItemToBasket(userId, {
        productId: selectedTrip.id, // Use tripId as productId (actual product)
        quantity: 1,
        attributes: {
          type: 'Transport',
          bookingId: bookingId, // Store bookingId in attributes
          transportId: transport.id,
          transportName: transport.name,
          transportType: transport.transportType,
          tripId: selectedTrip.id,
          departure: selectedTrip.departure,
          destination: selectedTrip.destination,
          seatNumber,
          seatClass
        }
      });

      setShowBookingModal(false);
      Alert.alert(
        'Thành công! 🎉',
        'Đã tạo booking và thêm phương tiện vào giỏ hàng',
        [
          {
            text: 'Xem giỏ hàng',
            onPress: () => navigation.navigate('Basket')
          },
          { text: 'Tiếp tục', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Add transport to basket error:', error);
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

  const getTransportIcon = (type) => {
    switch (type) {
      case 'Airline': return '✈️';
      case 'Train': return '🚄';
      case 'Bus': return '🚌';
      default: return '🚗';
    }
  };

  const renderTripItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.tripCard}
      onPress={() => openBookingModal(item)}
      activeOpacity={0.8}
    >
      <View style={styles.tripHeader}>
        <Text style={styles.tripRoute}>{item.departure} → {item.destination}</Text>
        <Text style={styles.tripPrice}>
          {item.price ? `${item.price.toLocaleString('vi-VN')} VND` : '2,000 VND'}
        </Text>
      </View>
      <View style={styles.tripDetails}>
        <Text style={styles.tripTime}>
          🕐 {new Date(item.departureTime).toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })} - {new Date(item.arrivalTime).toLocaleTimeString('vi-VN', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
        <Text style={styles.tripSeats}>
          💺 {item.availableSeats || 0} ghế trống
        </Text>
      </View>
      <View style={styles.tripFooter}>
        <Text style={styles.selectTripText}>👉 Chạm để chọn chuyến này</Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết phương tiện...</Text>
      </View>
    );
  }

  if (!transport) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy phương tiện.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ 
              uri: transport.imageUrl || (transport.transportType === 'Airline' ? 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=400&h=300&fit=crop' :
                                transport.transportType === 'Train' ? 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop' :
                                transport.transportType === 'Bus' ? 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop' :
                                'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=300&fit=crop')
            }}
            style={styles.transportImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.transportBadge}>
              <Text style={styles.transportBadgeText}>{getTransportIcon(transport.transportType)}</Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>
                {transport.transportTrips && transport.transportTrips.length > 0 
                  ? `Từ ${transport.transportTrips[0].price?.toLocaleString('vi-VN') || '2,000'} VND`
                  : '2,000 VND'
                }
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.titleSection}>
            <Text style={styles.title}>{transport.name}</Text>
            <Text style={styles.type}>{transport.transportType}</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🚌</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Loại phương tiện</Text>
                <Text style={styles.infoValue}>{transport.transportType}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📝</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Số tuyến</Text>
                <Text style={styles.infoValue}>
                  {transport.transportTrips?.length || 0} tuyến đường
                </Text>
              </View>
            </View>
          </View>

          {transport.transportTrips && transport.transportTrips.length > 0 && (
            <View style={styles.tripsSection}>
              <Text style={styles.sectionTitle}>Các chuyến có sẵn</Text>
              <FlatList
                data={transport.transportTrips}
                keyExtractor={(item) => item.id}
                renderItem={renderTripItem}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đặt vé phương tiện</Text>
            <Text style={styles.modalSubtitle}>
              {selectedTrip ? `${selectedTrip.departure} → ${selectedTrip.destination}` : ''}
            </Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Số ghế</Text>
              <TextInput
                style={styles.input}
                value={seatNumber}
                onChangeText={setSeatNumber}
                placeholder="VD: 12A, 15B"
                placeholderTextColor={Colors.inputPlaceholder}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Hạng ghế</Text>
              <TextInput
                style={styles.input}
                value={seatClass}
                onChangeText={setSeatClass}
                placeholder="Economy, Business, First"
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
                onPress={addTransportToBasket}
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
    </>
  );
}
