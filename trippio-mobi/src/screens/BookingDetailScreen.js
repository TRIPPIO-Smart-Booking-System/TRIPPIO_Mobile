import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  Alert, 
  StyleSheet,
  TouchableOpacity 
} from 'react-native';
import { getBookingById, cancelBooking } from '../api/booking';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../contexts/UserContext';

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
        <Text>Đang tải...</Text>
      </View>
    );
  }

  if (!booking) {
    return (
      <View style={styles.errorContainer}>
        <Text>Không tìm thấy booking</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Booking #{booking.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(booking.status) }]}>
          <Text style={styles.statusText}>{booking.status}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin booking</Text>
        <Text style={styles.info}>Ngày đặt: {new Date(booking.dateCreated).toLocaleString('vi-VN')}</Text>
        {booking.checkInDate && (
          <Text style={styles.info}>Check-in: {new Date(booking.checkInDate).toLocaleString('vi-VN')}</Text>
        )}
        {booking.checkOutDate && (
          <Text style={styles.info}>Check-out: {new Date(booking.checkOutDate).toLocaleString('vi-VN')}</Text>
        )}
        <Text style={styles.info}>Tổng tiền: {booking.totalAmount?.toLocaleString('vi-VN')} VND</Text>
        {booking.notes && <Text style={styles.info}>Ghi chú: {booking.notes}</Text>}
      </View>

      {booking.accommodationBookingDetails && booking.accommodationBookingDetails.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết phòng</Text>
          {booking.accommodationBookingDetails.map((detail, index) => (
            <View key={index} style={styles.bookingItem}>
              <Text style={styles.itemName}>Phòng {detail.roomId}</Text>
              <Text style={styles.itemDetails}>
                Số đêm: {detail.numberOfNights}
              </Text>
              <Text style={styles.itemDetails}>
                Số khách: {detail.numberOfGuests}
              </Text>
              <Text style={styles.itemTotal}>
                Giá: {detail.totalPrice?.toLocaleString('vi-VN')} VND
              </Text>
            </View>
          ))}
        </View>
      )}

      {(booking.status?.toLowerCase() === 'pending' || booking.status?.toLowerCase() === 'confirmed') && (
        <TouchableOpacity style={styles.cancelButton} onPress={handleCancelBooking}>
          <Text style={styles.cancelButtonText}>Hủy booking</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return '#FFA500';
    case 'confirmed': return '#4CAF50';
    case 'cancelled': return '#F44336';
    case 'completed': return '#2196F3';
    case 'checked-in': return '#9C27B0';
    default: return '#757575';
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    backgroundColor: 'white',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  statusText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  section: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  bookingItem: {
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  itemDetails: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2196F3',
  },
  cancelButton: {
    backgroundColor: '#F44336',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});