import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions,
  Image,
  RefreshControl
} from 'react-native';
import { getHotels } from '../api/hotel';
import { getAllShows } from '../api/show';
import { getAllTransports } from '../api/transport';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const [hotels, setHotels] = useState([]);
  const [shows, setShows] = useState([]);
  const [transports, setTransports] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [hotelsRes, showsRes, transportsRes] = await Promise.all([
        getHotels(),
        getAllShows(),
        getAllTransports()
      ]);
      
      setHotels((hotelsRes.data || hotelsRes || []).slice(0, 3));
      setShows((showsRes.data || showsRes.value || showsRes || []).slice(0, 3));
      setTransports((transportsRes.data || transportsRes || []).slice(0, 3));
    } catch (error) {
      console.error('Load home data error:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderCategoryCard = ({ title, icon, color, onPress, count }) => (
    <TouchableOpacity style={[styles.categoryCard, { backgroundColor: color }]} onPress={onPress}>
      <Text style={styles.categoryIcon}>{icon}</Text>
      <Text style={styles.categoryTitle}>{title}</Text>
      <Text style={styles.categoryCount}>{count} dịch vụ</Text>
    </TouchableOpacity>
  );

  const renderItemCard = ({ item, type }) => (
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
    >
      <Image 
        source={{ 
          uri: item.imageUrl || (type === 'hotel' ? 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&h=200&fit=crop' : 
                                type === 'show' ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=200&fit=crop' : 
                                'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=400&h=200&fit=crop')
        }}
        style={styles.itemImage}
        resizeMode="cover"
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>
          {type === 'hotel' ? item.name : 
           type === 'show' ? item.name : 
           item.name}
        </Text>
        <Text style={styles.itemSubtitle} numberOfLines={1}>
          {type === 'hotel' ? `${item.city}, ${item.country}` : 
           type === 'show' ? item.location : 
           type === 'transport' ? `${item.transportType} - ${item.transportTrips?.length || 0} tuyến` :
           item.transportType}
        </Text>
        <Text style={styles.itemPrice}>2,000 VND</Text>
      </View>
    </TouchableOpacity>
  );

  const categories = [
    { title: 'Khách sạn', icon: '🏨', color: '#6c5ce7', onPress: () => navigation.navigate('Hotels'), count: hotels.length },
    { title: 'Shows & Events', icon: '🎭', color: '#fd79a8', onPress: () => navigation.navigate('Shows'), count: shows.length },
    { title: 'Phương tiện', icon: '🚌', color: '#00b894', onPress: () => navigation.navigate('Transports'), count: transports.length },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadData} />
      }
    >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.greeting}>Xin chào! 👋</Text>
            <Text style={styles.welcomeText}>Chào mừng đến với Trippio</Text>
            <Text style={styles.subtitle}>Khám phá và đặt chỗ cho chuyến đi của bạn</Text>
          </View>
          <View style={styles.headerDecoration}>
            <View style={styles.decorativeCircle} />
            <View style={[styles.decorativeCircle, styles.decorativeCircle2]} />
          </View>
        </View>

      {/* Categories */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dịch vụ</Text>
        <View style={styles.categoriesGrid}>
          {categories.map((category, index) => (
            <View key={index} style={styles.categoryWrapper}>
              {renderCategoryCard(category)}
            </View>
          ))}
        </View>
      </View>


      {/* Featured Shows */}
      {shows.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>🎭 Shows & Events</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Shows')}>
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {shows.map((show) => (
              <View key={show.id} style={styles.horizontalItem}>
                {renderItemCard({ item: show, type: 'show' })}
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
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
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
          >
            <Text style={styles.quickActionIcon}>🛒</Text>
            <Text style={styles.quickActionText}>Giỏ hàng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Orders')}
          >
            <Text style={styles.quickActionIcon}>📋</Text>
            <Text style={styles.quickActionText}>Đơn hàng</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.quickActionButton}
            onPress={() => navigation.navigate('Bookings')}
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6c5ce7',
    padding: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: 'center',
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  seeAllText: {
    fontSize: 14,
    color: '#6c5ce7',
    fontWeight: '600',
  },
  categoriesGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  categoryWrapper: {
    flex: 1,
    marginHorizontal: 5,
  },
  categoryCard: {
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  categoryIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
  },
  horizontalScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  horizontalItem: {
    width: width * 0.7,
    marginRight: 15,
  },
  itemCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  itemImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  itemInfo: {
    padding: 12,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  itemSubtitle: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00b894',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  quickActionButton: {
    alignItems: 'center',
    flex: 1,
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: '#636e72',
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 20,
  },
  headerDecoration: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 100,
    height: 100,
  },
  decorativeCircle: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    top: 20,
    right: 20,
  },
  decorativeCircle2: {
    width: 40,
    height: 40,
    borderRadius: 20,
    top: 40,
    right: 40,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
});
