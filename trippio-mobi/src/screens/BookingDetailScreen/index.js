import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity, ActivityIndicator } from 'react-native';
import { getBookingById, cancelBooking } from '../../api/booking';
import { useUser } from '../../contexts/UserContext';
import { styles, getStatusColor } from './styles';

export default function BookingDetailScreen({ route, navigation }) {
  const { user } = useUser();
  const { bookingId } = route.params;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookingDetail();
  }, [bookingId]);

  const loadBookingDetail = async () => {
    try {
      const response = await getBookingById(bookingId);
      if (response.success) {
        setBooking(response.data);
      } else {
        Alert.alert('Lỗi', response.message || 'Không thể tải chi tiết booking');
      }
    } catch (error) {
      console.error('Load booking detail error:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết booking');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async () => {
    Alert.alert(
      'Xác nhận',
      'Bạn có chắc muốn hủy booking này?',
      [
        { text: 'Không', style: 'cancel' },
        {
          text: 'Có',
          onPress: async () => {
            try {
              const userId = user?.id;
              const response = await cancelBooking(bookingId, userId);
              if (response.success) {
                Alert.alert('Thành công', 'Đã hủy booking');
                navigation.goBack();
              } else {
                Alert.alert('Lỗi', response.message || 'Không thể hủy booking');
              }
            } catch (error) {
              Alert.alert('Lỗi', 'Không thể hủy booking');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy booking</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking #{booking.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📋 Thông tin booking</Text>
        <Text style={styles.info}>📅 Ngày đặt: {new Date(booking.dateCreated).toLocaleString('vi-VN')}</Text>
        {booking.checkInDate && (
          <Text style={styles.info}>🚪 Check-in: {new Date(booking.checkInDate).toLocaleString('vi-VN')}</Text>
        )}
        {booking.checkOutDate && (
          <Text style={styles.info}>🚪 Check-out: {new Date(booking.checkOutDate).toLocaleString('vi-VN')}</Text>
        )}
        <Text style={styles.info}>💰 Tổng tiền: {booking.totalAmount?.toLocaleString('vi-VN')} VND</Text>
        {booking.notes && <Text style={styles.info}>📝 Ghi chú: {booking.notes}</Text>}
      </View>

      {booking.accommodationBookingDetails && booking.accommodationBookingDetails.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🏨 Chi tiết phòng</Text>
          {booking.accommodationBookingDetails.map((detail, index) => (
            <View key={index} style={styles.bookingItem}>
              <Text style={styles.itemName}>Phòng {detail.roomId}</Text>
              <Text style={styles.itemDetails}>
                🌙 Số đêm: {detail.numberOfNights}
              </Text>
              <Text style={styles.itemDetails}>
                👥 Số khách: {detail.numberOfGuests}
              </Text>
              <Text style={styles.itemTotal}>
                💵 Giá: {detail.totalPrice?.toLocaleString('vi-VN')} VND
              </Text>
            </View>
          ))}
        </View>
      )}

      {(booking.status?.toLowerCase() === 'pending' || booking.status?.toLowerCase() === 'confirmed') && (
        <TouchableOpacity 
          style={styles.cancelButton} 
          onPress={handleCancelBooking}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>❌ Hủy booking</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}
