import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  StyleSheet 
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getBookingsByUser, getUpcomingBookings, cancelBooking } from '../api/booking';
import { useUser } from '../contexts/UserContext';

export default function BookingsScreen({ navigation }) {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'upcoming'

  const loadBookings = async () => {
    try {
      setLoading(true);
      const userId = user?.id;
      if (!userId) {
        Alert.alert('Lỗi', 'Chưa đăng nhập');
        return;
      }

      // Load all bookings
      const allResponse = await getBookingsByUser(userId);
      if (allResponse.success) {
        setBookings(allResponse.data || []);
      }

      // Load upcoming bookings
      const upcomingResponse = await getUpcomingBookings(userId);
      if (upcomingResponse.success) {
        setUpcomingBookings(upcomingResponse.data || []);
      }
    } catch (error) {
      console.error('Load bookings error:', error);
      Alert.alert('Lỗi', 'Không thể tải booking');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
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
                loadBookings(); // Reload bookings
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

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingItem}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
    >
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingId}>Booking #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.bookingDate}>
        Ngày đặt: {new Date(item.dateCreated).toLocaleDateString('vi-VN')}
      </Text>
      
      {item.checkInDate && (
        <Text style={styles.checkInDate}>
          Check-in: {new Date(item.checkInDate).toLocaleDateString('vi-VN')}
        </Text>
      )}
      
      {item.checkOutDate && (
        <Text style={styles.checkOutDate}>
          Check-out: {new Date(item.checkOutDate).toLocaleDateString('vi-VN')}
        </Text>
      )}
      
      <Text style={styles.bookingTotal}>
        Tổng tiền: {item.totalAmount?.toLocaleString('vi-VN')} VND
      </Text>

      {(item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'confirmed') && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => handleCancelBooking(item.id)}
        >
          <Text style={styles.cancelButtonText}>Hủy booking</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const currentData = activeTab === 'all' ? bookings : upcomingBookings;

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
        >
          <Text style={[styles.tabText, activeTab === 'upcoming' && styles.activeTabText]}>
            Sắp tới
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={currentData}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBookingItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadBookings();
          }} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {activeTab === 'all' ? 'Chưa có booking nào' : 'Không có booking sắp tới'}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 2,
  },
  tab: {
    flex: 1,
    paddingVertical: 15,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#2196F3',
  },
  tabText: {
    fontSize: 16,
    color: '#666',
  },
  activeTabText: {
    color: '#2196F3',
    fontWeight: 'bold',
  },
  bookingItem: {
    backgroundColor: 'white',
    margin: 10,
    padding: 15,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  bookingDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  checkInDate: {
    fontSize: 14,
    color: '#4CAF50',
    marginBottom: 5,
  },
  checkOutDate: {
    fontSize: 14,
    color: '#FF9800',
    marginBottom: 5,
  },
  bookingTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2196F3',
    marginBottom: 10,
  },
  cancelButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
});