import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Alert, 
  RefreshControl,
  StyleSheet,
  Image,
  Dimensions
} from 'react-native';
import { getAllShows, getShowsByCity } from '../api/show';
import { createBooking } from '../api/booking';
import { addItem } from '../api/basket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');

export default function ShowScreen({ navigation }) {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCity, setSelectedCity] = useState('All');

  const cities = ['All', 'Ho Chi Minh', 'Ha Noi', 'Da Nang', 'Nha Trang'];

  useEffect(() => {
    loadShows();
  }, [selectedCity]);

  const loadShows = async () => {
    try {
      setLoading(true);
      let response;
      if (selectedCity === 'All') {
        response = await getAllShows();
      } else {
        response = await getShowsByCity(selectedCity);
      }
      // Handle different response structures
      const showsData = response.data || response.value || response || [];
      setShows(Array.isArray(showsData) ? showsData : []);
    } catch (error) {
      console.error('Load shows error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách show');
    } finally {
      setLoading(false);
    }
  };

  const addShowToBasket = async (show) => {
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

  const renderShowCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.showCard}
      onPress={() => navigation.navigate('ShowDetail', { showId: item.id })}
    >
      <View style={styles.showImageContainer}>
        <Image 
          source={{ uri: item.imageUrl || 'https://via.placeholder.com/300x200?text=Show' }}
          style={styles.showImage}
          resizeMode="cover"
        />
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>2,000 VND</Text>
        </View>
      </View>
      
      <View style={styles.showInfo}>
        <Text style={styles.showTitle} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.showVenue} numberOfLines={1}>
          📍 {item.location}
        </Text>
        <Text style={styles.showDate} numberOfLines={1}>
          📅 {new Date(item.startDate).toLocaleDateString('vi-VN')}
        </Text>
        <Text style={styles.showTime} numberOfLines={1}>
          ⏰ {new Date(item.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(item.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <Text style={styles.showTickets} numberOfLines={1}>
          🎫 {item.availableTickets} vé còn lại
        </Text>
        
        <View style={styles.showActions}>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => addShowToBasket(item)}
          >
            <Text style={styles.bookButtonText}>Đặt vé</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCityFilter = () => (
    <View style={styles.cityFilter}>
      <FlatList
        data={cities}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.cityButton,
              selectedCity === item && styles.cityButtonActive
            ]}
            onPress={() => setSelectedCity(item)}
          >
            <Text style={[
              styles.cityButtonText,
              selectedCity === item && styles.cityButtonTextActive
            ]}>
              {item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎭 Shows & Events</Text>
        <Text style={styles.headerSubtitle}>Khám phá các show và sự kiện thú vị</Text>
      </View>

      {renderCityFilter()}

      <FlatList
        data={shows}
        keyExtractor={(item) => item.id}
        renderItem={renderShowCard}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadShows} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.showsList}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.primary,
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  cityFilter: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  cityButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  cityButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  cityButtonText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  cityButtonTextActive: {
    color: Colors.textWhite,
  },
  showsList: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  showCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    marginBottom: 15,
    width: (width - 30) / 2,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  showImageContainer: {
    position: 'relative',
  },
  showImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  priceTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#00b894',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  showInfo: {
    padding: 12,
  },
  showTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  showVenue: {
    fontSize: 12,
    color: '#636e72',
    marginBottom: 2,
  },
  showDate: {
    fontSize: 12,
    color: '#636e72',
    marginBottom: 2,
  },
  showTime: {
    fontSize: 12,
    color: '#636e72',
    marginBottom: 2,
  },
  showTickets: {
    fontSize: 12,
    color: '#00b894',
    fontWeight: '600',
    marginBottom: 8,
  },
  showActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  bookButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
