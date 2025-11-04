import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  ActivityIndicator,
  StyleSheet,
  Image,
  Dimensions,
  FlatList
} from 'react-native';
import { getTransportWithTrips } from '../api/transport';
import { createBooking } from '../api/booking';
import { addItem } from '../api/basket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../contexts/UserContext';

const { width } = Dimensions.get('window');

export default function TransportDetailScreen({ route, navigation }) {
  const { user } = useUser();
  const { transportId } = route.params;
  const [transport, setTransport] = useState(null);
  const [loading, setLoading] = useState(true);

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
      Alert.alert('Lỗi', 'Không thể tải chi tiết phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const addTransportToBasket = async () => {
    try {
      const userId = user?.id;
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      // Step 1: Tạo Booking (pending) trước
      const bookingData = {
        userId: userId,
        bookingType: 'Transport',
        bookingDate: new Date().toISOString(),
        totalAmount: 2000, // Fixed price for testing
        status: 'Pending'
      };

      console.log('Creating transport booking:', bookingData);
      const bookingResponse = await createBooking(bookingData);
      const booking = bookingResponse.data || bookingResponse;
      
      console.log('Transport booking created:', booking);

      // Step 2: Thêm vào Basket với BookingId
      const item = {
        productId: transport.id,
        productName: `${transport.name} - ${transport.transportType}`,
        price: 2000, // Fixed price for testing
        quantity: 1,
        productType: 'Transport',
        bookingId: booking.id // Use the created booking ID
      };

      console.log('Adding transport to basket:', item);
      await addItem(userId, item);
      Alert.alert('Thành công', `Đã tạo booking và thêm ${transport.name} vào giỏ hàng`);
    } catch (error) {
      console.error('Add transport to basket error:', error);
      Alert.alert('Lỗi', 'Không thể tạo booking và thêm phương tiện vào giỏ hàng');
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
    <View style={styles.tripCard}>
      <View style={styles.tripHeader}>
        <Text style={styles.tripRoute}>{item.departure} → {item.destination}</Text>
        <Text style={styles.tripPrice}>{item.price} USD</Text>
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
          💺 {item.availableSeats} ghế trống
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#00b894" />
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
    <ScrollView style={styles.container}>
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
                ? `Từ ${transport.transportTrips[0].price} USD`
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

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🛣️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Tuyến đường</Text>
              <Text style={styles.infoValue}>
                {transport.transportTrips && transport.transportTrips.length > 0 
                  ? `${transport.transportTrips[0].departure} → ${transport.transportTrips[0].destination}`
                  : 'Nhiều tuyến đường'
                }
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💰</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Giá từ</Text>
              <Text style={styles.infoValue}>
                {transport.transportTrips && transport.transportTrips.length > 0 
                  ? `${transport.transportTrips[0].price} USD`
                  : '2,000 VND'
                }
              </Text>
            </View>
          </View>
        </View>

        {transport.transportTrips && transport.transportTrips.length > 0 && (
          <View style={styles.tripsSection}>
            <Text style={styles.sectionTitle}>Các chuyến có sẵn</Text>
            <FlatList
              data={transport.transportTrips} // Show all trips
              keyExtractor={(item) => item.id}
              renderItem={renderTripItem}
              scrollEnabled={false}
            />
          </View>
        )}

        <View style={styles.bookingSection}>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={addTransportToBasket}
          >
            <Text style={styles.bookButtonText}>Đặt vé ngay</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
  },
  imageContainer: {
    position: 'relative',
  },
  transportImage: {
    width: width,
    height: 280,
  },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 20,
    paddingTop: 50,
  },
  transportBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    padding: 12,
  },
  transportBadgeText: {
    fontSize: 24,
  },
  priceBadge: {
    backgroundColor: '#00b894',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#00b894',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  priceBadgeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  content: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20,
    padding: 20,
    minHeight: 400,
  },
  titleSection: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  type: {
    fontSize: 16,
    color: '#00b894',
    fontWeight: '600',
  },
  infoSection: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '500',
  },
  tripsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 15,
  },
  tripCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tripRoute: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3436',
    flex: 1,
  },
  tripPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#00b894',
  },
  tripDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tripTime: {
    fontSize: 12,
    color: '#636e72',
  },
  tripSeats: {
    fontSize: 12,
    color: '#636e72',
  },
  bookingSection: {
    marginTop: 20,
  },
  bookButton: {
    backgroundColor: '#00b894',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#00b894',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
