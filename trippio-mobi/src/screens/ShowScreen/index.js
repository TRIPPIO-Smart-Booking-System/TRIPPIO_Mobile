import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, RefreshControl, Image, ActivityIndicator } from 'react-native';
import { getAllShows, getShowsByCity } from '../../api/show';
import { createBooking } from '../../api/booking';
import { addItem } from '../../api/basket';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles, width } from './styles';

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

      const bookingData = {
        userId: userId,
        bookingType: 'Show',
        bookingDate: new Date().toISOString(),
        totalAmount: 2000,
        status: 'Pending'
      };

      console.log('Creating show booking:', bookingData);
      const bookingResponse = await createBooking(bookingData);
      const booking = bookingResponse.data || bookingResponse;
      
      console.log('Show booking created:', booking);

      const item = {
        productId: show.id,
        productName: `${show.name} - ${show.location}`,
        price: 2000,
        quantity: 1,
        productType: 'Show',
        bookingId: booking.id
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
      activeOpacity={0.9}
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
            activeOpacity={0.8}
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
            activeOpacity={0.7}
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

  if (loading && shows.length === 0) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#EC4899" />
        <Text style={{ marginTop: 16, fontSize: 16, color: '#6B7280' }}>Đang tải...</Text>
      </View>
    );
  }

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
          <RefreshControl refreshing={loading} onRefresh={loadShows} tintColor="#EC4899" />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.showsList}
        numColumns={2}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}
