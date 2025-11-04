import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getHotels } from '../../api/hotel';
import { getAllShows } from '../../api/show';
import { getAllTransports } from '../../api/transport';
import { useUser } from '../../contexts/UserContext';
import { styles } from './styles';

export default function HomeScreen({ navigation }) {
  const { isAdmin, isStaff, checkAdminAccess } = useUser();
  const [hotels, setHotels] = useState([]);
  const [shows, setShows] = useState([]);
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      const [hotelsRes, showsRes, transportsRes] = await Promise.all([
        getHotels().catch(() => ({ data: [] })),
        getAllShows().catch(() => ({ data: [] })),
        getAllTransports().catch(() => ({ data: [] }))
      ]);
      
      setHotels((hotelsRes.data || hotelsRes || []).slice(0, 3));
      setShows((showsRes.data || showsRes.value || showsRes || []).slice(0, 3));
      setTransports((transportsRes.data || transportsRes || []).slice(0, 3));
    } catch (error) {
      console.error('Load home data error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const renderCategoryCard = ({ title, icon, color, onPress, count }) => (
    <TouchableOpacity 
      style={[styles.categoryCard, { backgroundColor: color }]} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.categoryIcon}>{icon}</Text>
      <Text style={styles.categoryTitle}>{title}</Text>
      <Text style={styles.categoryCount}>{count} dịch vụ</Text>
    </TouchableOpacity>
  );

  const renderItemCard = ({ item, type }) => {
    const defaultImages = {
      hotel: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop',
      show: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop',
      transport: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop'
    };

    const getTitle = () => {
      if (type === 'hotel') return item.name || 'Khách sạn';
      if (type === 'show') return item.name || 'Show';
      return item.name || 'Phương tiện';
    };

    const getSubtitle = () => {
      if (type === 'hotel') return `${item.city || ''}, ${item.country || ''}`.trim();
      if (type === 'show') return item.location || '';
      if (type === 'transport') return `${item.transportType || ''} - ${item.transportTrips?.length || 0} tuyến`.trim();
      return '';
    };

    return (
      <TouchableOpacity 
        style={styles.itemCard}
        onPress={() => {
          if (type === 'hotel') {
            navigation.navigate('HotelDetail', { hotelId: item.id });
          } else if (type === 'show') {
            navigation.navigate('ShowDetail', { showId: item.id });
          } else if (type === 'transport') {
            navigation.navigate('TransportDetail', { transportId: item.id });
          }
        }}
        activeOpacity={0.9}
      >
        <Image 
          source={{ 
            uri: item.imageUrl || defaultImages[type]
          }}
          style={styles.itemImage}
          resizeMode="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemTitle} numberOfLines={2}>
            {getTitle()}
          </Text>
          <Text style={styles.itemSubtitle} numberOfLines={1}>
            {getSubtitle()}
          </Text>
          <Text style={styles.itemPrice}>Xem chi tiết →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  const categories = [
    { 
      title: 'Khách sạn', 
      icon: '🏨', 
      color: '#6366F1', 
      onPress: () => navigation.navigate('Hotels'), 
      count: hotels.length 
    },
    { 
      title: 'Shows & Events', 
      icon: '🎭', 
      color: '#EC4899', 
      onPress: () => navigation.navigate('Shows'), 
      count: shows.length 
    },
    { 
      title: 'Phương tiện', 
      icon: '🚌', 
      color: '#10B981', 
      onPress: () => navigation.navigate('Transports'), 
      count: transports.length 
    },
  ];

  const specialFeatures = [
    { 
      title: 'AI Assistant', 
      icon: 'chatbubble-ellipses', 
      color: '#6366F1', 
      onPress: () => navigation.navigate('AIChat'),
      description: 'Trò chuyện với AI'
    },
    ...(checkAdminAccess() ? [{
      title: 'Admin Dashboard', 
      icon: 'settings', 
      color: '#F59E0B', 
      onPress: () => navigation.navigate('AdminDashboard'),
      description: 'Quản lý hệ thống'
    }] : [])
  ];

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Đang tải...</Text>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={() => loadData(true)}
          tintColor="#6366F1"
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.decorativeCircle} />
        <View style={[styles.decorativeCircle, styles.decorativeCircle2]} />
        <View style={[styles.decorativeCircle, styles.decorativeCircle3]} />
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>Xin chào! 👋</Text>
          <Text style={styles.welcomeText}>Chào mừng đến với Trippio</Text>
          <Text style={styles.subtitle}>Khám phá và đặt chỗ cho chuyến đi của bạn</Text>
        </View>
      </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dịch vụ</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <View key={index}>
              {renderCategoryCard(category)}
            </View>
          ))}
        </View>
      </View>

      {/* Special Features */}
      {specialFeatures.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Tính năng đặc biệt</Text>
          <View style={styles.featuresGrid}>
            {specialFeatures.map((feature, index) => (
              <TouchableOpacity 
                key={index} 
                style={[styles.featureCard, { backgroundColor: feature.color }]} 
                onPress={feature.onPress}
                activeOpacity={0.8}
              >
                <Ionicons name={feature.icon} size={32} color="white" />
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Featured Shows */}
      {shows.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎭 Shows & Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shows')}>
              <Text style={styles.seeAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.horizontalScroll}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {shows.map((show) => (
              <View key={show.id} style={styles.horizontalItem}>
                {renderItemCard({ item: show, type: 'show' })}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured Hotels */}
      {hotels.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🏨 Khách sạn nổi bật</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Hotels')}>
              <Text style={styles.seeAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.horizontalScroll}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {hotels.map((hotel) => (
              <View key={hotel.id} style={styles.horizontalItem}>
                {renderItemCard({ item: hotel, type: 'hotel' })}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Featured Transports */}
      {transports.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🚌 Phương tiện di chuyển</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Transports')}>
              <Text style={styles.seeAllText}>Xem tất cả →</Text>
            </TouchableOpacity>
          </View>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.horizontalScroll}
            contentContainerStyle={{ paddingRight: 20 }}
          >
            {transports.map((transport) => (
              <View key={transport.id} style={styles.horizontalItem}>
                {renderItemCard({ item: transport, type: 'transport' })}
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thao tác nhanh</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Basket')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionIcon}>🛒</Text>
            <Text style={styles.quickActionText}>Giỏ hàng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Orders')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>Đơn hàng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Bookings')}
            activeOpacity={0.7}
          >
            <Text style={styles.quickActionIcon}>📅</Text>
            <Text style={styles.quickActionText}>Bookings</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

