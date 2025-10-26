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
  Dimensions
} from 'react-native';
import { getShowById } from '../api/show';
import { createBooking } from '../api/booking';
import { addItem } from '../api/basket';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

export default function ShowDetailScreen({ route, navigation }) {
  const { showId } = route.params;
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadShowDetail();
  }, [showId]);

  const loadShowDetail = async () => {
    try {
      setLoading(true);
      const response = await getShowById(showId);
      setShow(response.data || response.value || response);
    } catch (error) {
      console.error('Load show detail error:', error);
      Alert.alert('Lỗi', 'Không thể tải chi tiết show');
    } finally {
      setLoading(false);
    }
  };

  const addShowToBasket = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập lại');
        return;
      }

      // Step 1: Tạo Booking (pending) trước
      const bookingData = {
        userId: userId,
        bookingType: 'Show',
        bookingDate: new Date().toISOString(),
        totalAmount: 2000, // Fixed price for testing
        status: 'Pending'
      };

      console.log('Creating show booking:', bookingData);
      const bookingResponse = await createBooking(bookingData);
      const booking = bookingResponse.data || bookingResponse;
      
      console.log('Show booking created:', booking);

      // Step 2: Thêm vào Basket với BookingId
      const item = {
        productId: show.id,
        productName: `${show.name} - ${show.location}`,
        price: 2000, // Fixed price for testing
        quantity: 1,
        productType: 'Show',
        bookingId: booking.id // Use the created booking ID
      };

      console.log('Adding show to basket:', item);
      await addItem(userId, item);
      Alert.alert('Thành công', `Đã tạo booking và thêm show "${show.name}" vào giỏ hàng`);
    } catch (error) {
      console.error('Add show to basket error:', error);
      Alert.alert('Lỗi', 'Không thể tạo booking và thêm show vào giỏ hàng');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Đang tải chi tiết show...</Text>
      </View>
    );
  }

  if (!show) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy show.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: show.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop' }}
          style={styles.showImage}
          resizeMode="cover"
        />
        <View style={styles.imageOverlay}>
          <View style={styles.showBadge}>
            <Text style={styles.showBadgeText}>🎭</Text>
          </View>
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>2,000 VND</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>{show.name}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📍</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Địa điểm</Text>
              <Text style={styles.infoValue}>{show.location}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🏙️</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thành phố</Text>
              <Text style={styles.infoValue}>{show.city}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>📅</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Ngày diễn</Text>
              <Text style={styles.infoValue}>
                {new Date(show.startDate).toLocaleDateString('vi-VN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏰</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Thời gian</Text>
              <Text style={styles.infoValue}>
                {new Date(show.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(show.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>🎫</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Vé còn lại</Text>
              <Text style={styles.infoValue}>{show.availableTickets} vé</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>💰</Text>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Giá gốc</Text>
              <Text style={styles.infoValue}>{show.price} USD</Text>
            </View>
          </View>
        </View>

        {show.description && (
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Mô tả</Text>
            <Text style={styles.description}>{show.description}</Text>
          </View>
        )}

        <View style={styles.bookingSection}>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={addShowToBasket}
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
  showImage: {
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
  showBadge: {
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 25,
    padding: 12,
  },
  showBadgeText: {
    fontSize: 24,
  },
  priceBadge: {
    backgroundColor: '#fd79a8',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#fd79a8',
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
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2d3436',
    textAlign: 'center',
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
  descriptionSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#636e72',
    lineHeight: 20,
  },
  bookingSection: {
    marginTop: 20,
  },
  bookButton: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#6c5ce7',
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
