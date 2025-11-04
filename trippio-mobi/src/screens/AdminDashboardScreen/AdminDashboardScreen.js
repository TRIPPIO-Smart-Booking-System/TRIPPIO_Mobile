import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Alert,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useUser } from '../../contexts/UserContext';
import { Colors } from '../../constants/colors';
import { ADMIN_CONFIG } from '../../constants/adminConfig';
import { dashboardSimpleApi as dashboardApi } from '../../api/dashboard-simple';

const { width } = Dimensions.get('window');

const AdminDashboardScreen = ({ navigation }) => {
  const { checkAdminAccess, user } = useUser();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSection, setSelectedSection] = useState(ADMIN_CONFIG.SECTIONS.OVERVIEW);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalOrders: 0,
    totalBookings: 0,
    totalRevenue: 0,
    totalHotels: 0,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    // Kiểm tra quyền truy cập
    if (!checkAdminAccess()) {
      Alert.alert(
        'Không có quyền truy cập',
        'Bạn không có quyền truy cập Admin Dashboard. Vui lòng đăng nhập với tài khoản admin.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
      return;
    }
    
    loadDashboardData();
  }, [checkAdminAccess]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Lấy dữ liệu thống kê từ API
      const dashboardStats = await dashboardApi.getBasicStats();
      
      setStats({
        totalUsers: dashboardStats.totalUsers || 0,
        totalOrders: dashboardStats.totalOrders || 0,
        totalBookings: dashboardStats.totalBookings || 0,
        totalRevenue: dashboardStats.totalRevenue || 0,
        totalHotels: dashboardStats.totalHotels || 0,
      });
      
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Sử dụng mock data khi có lỗi
      console.log('Using mock data due to error');
      const mockStats = dashboardApi.getMockStats();
      setStats(mockStats);
      setError(null); // Không hiển thị lỗi, chỉ dùng mock data
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back" size={24} color={Colors.textWhite} />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>Admin Dashboard</Text>
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => setSelectedSection(ADMIN_CONFIG.SECTIONS.SETTINGS)}
      >
        <Ionicons name="settings" size={24} color={Colors.textWhite} />
      </TouchableOpacity>
    </View>
  );

  const renderStatsCards = () => (
    <View style={styles.statsContainer}>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: Colors.primary }]}>
          <Ionicons name="people" size={32} color={Colors.textWhite} />
          <Text style={styles.statNumber}>{stats.totalUsers.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Tổng người dùng</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.success }]}>
          <Ionicons name="receipt" size={32} color={Colors.textWhite} />
          <Text style={styles.statNumber}>{stats.totalOrders.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Đơn hàng</Text>
        </View>
      </View>
      <View style={styles.statsRow}>
        <View style={[styles.statCard, { backgroundColor: Colors.warning }]}>
          <Ionicons name="cash" size={32} color={Colors.textWhite} />
          <Text style={styles.statNumber}>{formatCurrency(stats.totalRevenue)}</Text>
          <Text style={styles.statLabel}>Doanh thu</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: Colors.info }]}>
          <Ionicons name="business" size={32} color={Colors.textWhite} />
          <Text style={styles.statNumber}>{stats.totalHotels}</Text>
          <Text style={styles.statLabel}>Khách sạn</Text>
        </View>
      </View>
    </View>
  );

  const renderNavigationMenu = () => (
    <View style={styles.navigationContainer}>
      <Text style={styles.sectionTitle}>Quản lý</Text>
      <View style={styles.menuGrid}>
        {[
          { key: ADMIN_CONFIG.SECTIONS.USERS, icon: 'people', label: 'Người dùng', color: Colors.primary },
          { key: ADMIN_CONFIG.SECTIONS.BOOKINGS, icon: 'calendar', label: 'Đặt phòng', color: Colors.success },
          { key: ADMIN_CONFIG.SECTIONS.HOTELS, icon: 'business', label: 'Khách sạn', color: Colors.info },
          { key: ADMIN_CONFIG.SECTIONS.TRANSPORT, icon: 'car', label: 'Phương tiện', color: Colors.warning },
          { key: ADMIN_CONFIG.SECTIONS.SHOWS, icon: 'musical-notes', label: 'Giải trí', color: Colors.secondary },
          { key: ADMIN_CONFIG.SECTIONS.PAYMENTS, icon: 'card', label: 'Thanh toán', color: Colors.error },
          { key: ADMIN_CONFIG.SECTIONS.ANALYTICS, icon: 'analytics', label: 'Thống kê', color: Colors.primaryDark },
          { key: ADMIN_CONFIG.SECTIONS.SETTINGS, icon: 'settings', label: 'Cài đặt', color: Colors.textSecondary },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.menuItem,
              selectedSection === item.key && styles.menuItemActive
            ]}
            onPress={() => setSelectedSection(item.key)}
          >
            <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
              <Ionicons name={item.icon} size={24} color={Colors.textWhite} />
            </View>
            <Text style={[
              styles.menuLabel,
              selectedSection === item.key && styles.menuLabelActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderContent = () => {
    switch (selectedSection) {
      case ADMIN_CONFIG.SECTIONS.OVERVIEW:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Tổng quan hệ thống</Text>
            <Text style={styles.contentText}>
              Chào mừng đến với Admin Dashboard của Trippio. 
              Tại đây bạn có thể quản lý toàn bộ hệ thống du lịch.
            </Text>
            {renderStatsCards()}
          </View>
        );

      case ADMIN_CONFIG.SECTIONS.USERS:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Quản lý người dùng</Text>
            <Text style={styles.contentText}>
              Tổng số người dùng: {stats.totalUsers.toLocaleString()}
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Xem danh sách người dùng</Text>
            </TouchableOpacity>
          </View>
        );

      case ADMIN_CONFIG.SECTIONS.BOOKINGS:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Quản lý đặt phòng</Text>
            <Text style={styles.contentText}>
              Tổng số đặt phòng: {stats.totalBookings.toLocaleString()}
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Xem danh sách đặt phòng</Text>
            </TouchableOpacity>
          </View>
        );

      case ADMIN_CONFIG.SECTIONS.HOTELS:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Quản lý khách sạn</Text>
            <Text style={styles.contentText}>
              Số khách sạn hoạt động: {stats.totalHotels}
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Xem danh sách khách sạn</Text>
            </TouchableOpacity>
          </View>
        );

      case ADMIN_CONFIG.SECTIONS.ANALYTICS:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Thống kê và báo cáo</Text>
            <Text style={styles.contentText}>
              Doanh thu tháng này: {formatCurrency(stats.totalRevenue)}
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Xem báo cáo chi tiết</Text>
            </TouchableOpacity>
          </View>
        );

      case ADMIN_CONFIG.SECTIONS.SETTINGS:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Cài đặt hệ thống</Text>
            <Text style={styles.contentText}>
              Cấu hình các thông số hệ thống và quyền truy cập.
            </Text>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Cài đặt chung</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionButtonText}>Quản lý quyền</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return (
          <View style={styles.contentContainer}>
            <Text style={styles.contentTitle}>Chức năng đang phát triển</Text>
            <Text style={styles.contentText}>
              Chức năng này đang được phát triển và sẽ có sớm.
            </Text>
          </View>
        );
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
        {renderHeader()}
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={64} color={Colors.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadDashboardData}>
            <Text style={styles.retryButtonText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary} />
      {renderHeader()}
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderNavigationMenu()}
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textWhite,
  },
  settingsButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  navigationContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItem: {
    width: (width - 48) / 2,
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  menuItemActive: {
    backgroundColor: Colors.primaryLight,
  },
  menuIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  menuLabelActive: {
    color: Colors.primary,
    fontWeight: 'bold',
  },
  contentContainer: {
    backgroundColor: Colors.surface,
    padding: 16,
    margin: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  contentTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 12,
  },
  contentText: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 24,
  },
  statsContainer: {
    marginTop: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 12,
    elevation: 2,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textWhite,
    textAlign: 'center',
    opacity: 0.9,
  },
  actionButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  actionButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  retryButtonText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: '500',
  },
});

export default AdminDashboardScreen;
