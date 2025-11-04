import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { getBookingsByUser, getUpcomingBookings, cancelBooking } from '../../api/booking';
import { useUser } from '../../contexts/UserContext';
import { styles, getStatusColor } from './styles';

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

  const renderBookingItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bookingItem}
      onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}
      activeOpacity={0.8}
    >
      <View style={styles.bookingHeader}>
        <Text style={styles.bookingId}>Booking #{item.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      
      <Text style={styles.bookingDate}>
        📅 Ngày đặt: {new Date(item.dateCreated).toLocaleDateString('vi-VN')}
      </Text>
      
      {item.checkInDate && (
        <Text style={styles.checkInDate}>
          🚪 Check-in: {new Date(item.checkInDate).toLocaleDateString('vi-VN')}
        </Text>
      )}
      
      {item.checkOutDate && (
        <Text style={styles.checkOutDate}>
          🚪 Check-out: {new Date(item.checkOutDate).toLocaleDateString('vi-VN')}
        </Text>
      )}
      
      <Text style={styles.bookingTotal}>
        💰 Tổng tiền: {item.totalAmount?.toLocaleString('vi-VN')} VND
      </Text>

      {(item.status?.toLowerCase() === 'pending' || item.status?.toLowerCase() === 'confirmed') && (
        <TouchableOpacity 
          style={styles.cancelButton}
          onPress={() => handleCancelBooking(item.id)}
          activeOpacity={0.8}
        >
          <Text style={styles.cancelButtonText}>❌ Hủy booking</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const currentData = activeTab === 'all' ? bookings : upcomingBookings;

  if (loading && !refreshing) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabContainer}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'all' && styles.activeTab]}
          onPress={() => setActiveTab('all')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>
            Tất cả
          </Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'upcoming' && styles.activeTab]}
          onPress={() => setActiveTab('upcoming')}
          activeOpacity={0.7}
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
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              setRefreshing(true);
              loadBookings();
            }}
            tintColor="#6366F1"
          />
        }
        showsVerticalScrollIndicator={false}
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
