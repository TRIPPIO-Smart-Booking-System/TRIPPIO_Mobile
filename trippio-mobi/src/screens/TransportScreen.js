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
import { getAllTransports, getTransportsByType } from '../api/transport';
import { createBooking } from '../api/booking';
import { addItem } from '../api/basket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/colors';

const { width } = Dimensions.get('window');

export default function TransportScreen({ navigation }) {
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('All');

  const transportTypes = ['All', 'Airline', 'Train', 'Bus'];

  useEffect(() => {
    loadTransports();
  }, [selectedType]);

  const loadTransports = async () => {
    try {
      setLoading(true);
      let response;
      if (selectedType === 'All') {
        response = await getAllTransports();
      } else {
        response = await getTransportsByType(selectedType);
      }
      // Handle different response structures
      const transportsData = response.data || response.value || response || [];
      setTransports(Array.isArray(transportsData) ? transportsData : []);
    } catch (error) {
      console.error('Load transports error:', error);
      Alert.alert('Lỗi', 'Không thể tải danh sách phương tiện');
    } finally {
      setLoading(false);
    }
  };

  const addTransportToBasket = async (transport) => {
    try {
      const userId = await AsyncStorage.getItem('userId');
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

  const renderTransportCard = ({ item }) => (
    <TouchableOpacity 
      style={styles.transportCard}
      onPress={() => navigation.navigate('TransportDetail', { transportId: item.id })}
    >
      <View style={styles.transportHeader}>
        <View style={styles.transportIcon}>
          <Text style={styles.iconText}>{getTransportIcon(item.transportType)}</Text>
        </View>
        <View style={styles.priceTag}>
          <Text style={styles.priceText}>2,000 VND</Text>
        </View>
      </View>
      
      <View style={styles.transportInfo}>
        <Text style={styles.transportName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.transportType} numberOfLines={1}>
          {item.transportType}
        </Text>
        <Text style={styles.transportDescription} numberOfLines={2}>
          {item.transportTrips && item.transportTrips.length > 0 
            ? `${item.transportTrips.length} tuyến đường có sẵn`
            : 'Phương tiện di chuyển tiện lợi và an toàn'
          }
        </Text>
        {item.transportTrips && item.transportTrips.length > 0 && (
          <Text style={styles.transportRoutes} numberOfLines={1}>
            🛣️ {item.transportTrips[0].departure} → {item.transportTrips[0].destination}
            {item.transportTrips.length > 1 && ` +${item.transportTrips.length - 1} tuyến khác`}
          </Text>
        )}
        
        <View style={styles.transportActions}>
          <TouchableOpacity 
            style={styles.bookButton}
            onPress={() => addTransportToBasket(item)}
          >
            <Text style={styles.bookButtonText}>Đặt vé</Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderTypeFilter = () => (
    <View style={styles.typeFilter}>
      <FlatList
        data={transportTypes}
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.typeButton,
              selectedType === item && styles.typeButtonActive
            ]}
            onPress={() => setSelectedType(item)}
          >
            <Text style={[
              styles.typeButtonText,
              selectedType === item && styles.typeButtonTextActive
            ]}>
              {item === 'All' ? 'Tất cả' : item}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚌 Phương tiện di chuyển</Text>
        <Text style={styles.headerSubtitle}>Chọn phương tiện phù hợp cho chuyến đi</Text>
      </View>

      {renderTypeFilter()}

      <FlatList
        data={transports}
        keyExtractor={(item) => item.id}
        renderItem={renderTransportCard}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadTransports} />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.transportsList}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#00b894',
    padding: 20,
    paddingTop: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  typeFilter: {
    backgroundColor: 'white',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 4,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  typeButtonActive: {
    backgroundColor: '#00b894',
    borderColor: '#00b894',
  },
  typeButtonText: {
    fontSize: 14,
    color: '#6c757d',
    fontWeight: '500',
  },
  typeButtonTextActive: {
    color: 'white',
  },
  transportsList: {
    padding: 10,
  },
  row: {
    justifyContent: 'space-between',
  },
  transportCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 15,
    width: (width - 30) / 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  transportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    paddingBottom: 8,
  },
  transportIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconText: {
    fontSize: 20,
  },
  priceTag: {
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
  transportInfo: {
    padding: 12,
    paddingTop: 0,
  },
  transportName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  transportType: {
    fontSize: 12,
    color: '#00b894',
    fontWeight: '600',
    marginBottom: 4,
  },
  transportDescription: {
    fontSize: 12,
    color: '#636e72',
    marginBottom: 4,
    lineHeight: 16,
  },
  transportRoutes: {
    fontSize: 11,
    color: '#00b894',
    fontWeight: '600',
    marginBottom: 8,
  },
  transportActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookButton: {
    backgroundColor: '#00b894',
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
