import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, ActivityIndicator } from 'react-native';
import { getAllTransports, getTransportsByType } from '../../api/transport';
import { createBooking } from '../../api/booking';
import { addItem } from '../../api/basket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles, width } from './styles';

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

      const bookingData = {
        userId: userId,
        bookingType: 'Transport',
        bookingDate: new Date().toISOString(),
        totalAmount: 2000,
        status: 'Pending'
      };

      console.log('Creating transport booking:', bookingData);
      const bookingResponse = await createBooking(bookingData);
      const booking = bookingResponse.data || bookingResponse;
      
      console.log('Transport booking created:', booking);

      const item = {
        productId: transport.id,
        productName: `${transport.name} - ${transport.transportType}`,
        price: 2000,
        quantity: 1,
        productType: 'Transport',
        bookingId: booking.id
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
      activeOpacity={0.9}
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
            activeOpacity={0.8}
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
            activeOpacity={0.7}
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

  if (loading && transports.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>Đang tải...</Text>
      </View>
    );
  }

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
          <RefreshControl refreshing={loading} onRefresh={loadTransports} tintColor="#10B981" />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.transportsList}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}
