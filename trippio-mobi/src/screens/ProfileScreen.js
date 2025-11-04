import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Image,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserProfile } from '../api/auth';
import { useUser } from '../contexts/UserContext';
import Colors from '../constants/colors';

export default function ProfileScreen({ navigation }) {
  const { user, checkAdminAccess, logout: logoutUser } = useUser();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('ProfileScreen - User from context:', user);
    loadUserInfo();
  }, [user]);

  const loadUserInfo = async () => {
    try {
      setLoading(true);
      
      // Sử dụng user data từ UserContext thay vì AsyncStorage
      if (user) {
        setUserInfo({
          userId: user.id,
          userName: user.userName,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phoneNumber: user.phoneNumber,
          fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.userName || 'User',
          balance: user.balance || 0,
          isEmailVerified: user.isEmailVerified || false,
          isPhoneVerified: user.isPhoneVerified || false,
          dateCreated: user.dateCreated,
          dob: user.dob,
          avatar: user.avatar || ''
        });
      } else {
        // Fallback: load từ AsyncStorage nếu UserContext chưa có data
        const userData = await AsyncStorage.multiGet([
          'userId', 'userName', 'email', 'firstName', 'lastName', 
          'phoneNumber', 'fullName', 'balance', 'isEmailVerified', 
          'isPhoneVerified', 'dateCreated', 'dob', 'avatar'
        ]);
        
        const userInfoMap = {};
        userData.forEach(([key, value]) => {
          userInfoMap[key] = value;
        });
        
        if (userInfoMap.userId) {
          setUserInfo({
            userId: userInfoMap.userId,
            userName: userInfoMap.userName,
            email: userInfoMap.email,
            firstName: userInfoMap.firstName,
            lastName: userInfoMap.lastName,
            phoneNumber: userInfoMap.phoneNumber,
            fullName: userInfoMap.fullName || `${userInfoMap.firstName || ''} ${userInfoMap.lastName || ''}`.trim() || userInfoMap.userName || 'User',
            balance: userInfoMap.balance ? parseFloat(userInfoMap.balance) : 0,
            isEmailVerified: userInfoMap.isEmailVerified === 'true',
            isPhoneVerified: userInfoMap.isPhoneVerified === 'true',
            dateCreated: userInfoMap.dateCreated,
            dob: userInfoMap.dob,
            avatar: userInfoMap.avatar
          });
        }
      }
    } catch (error) {
      console.error('Load user info error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đăng xuất',
          style: 'destructive',
          onPress: async () => {
            try {
              // Sử dụng UserContext để logout
              await logoutUser();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Lỗi', 'Không thể đăng xuất');
            }
          },
        },
      ]
    );
  };

  const renderProfileItem = ({ icon, title, subtitle, onPress, showArrow = true }) => (
    <TouchableOpacity style={styles.profileItem} onPress={onPress}>
      <View style={styles.profileItemLeft}>
        <Text style={styles.profileItemIcon}>{icon}</Text>
        <View style={styles.profileItemText}>
          <Text style={styles.profileItemTitle}>{title}</Text>
          {subtitle && <Text style={styles.profileItemSubtitle}>{subtitle}</Text>}
        </View>
      </View>
      {showArrow && <Text style={styles.profileItemArrow}>›</Text>}
    </TouchableOpacity>
  );

  const profileItems = [
    {
      icon: '👤',
      title: 'Thông tin cá nhân',
      subtitle: 'Xem và chỉnh sửa thông tin',
      onPress: () => navigation.navigate('UserProfileDetail'),
    },
    {
      icon: '📋',
      title: 'Đơn hàng của tôi',
      subtitle: 'Xem lịch sử đơn hàng',
      onPress: () => navigation.navigate('Orders'),
    },
    {
      icon: '📅',
      title: 'Bookings',
      subtitle: 'Xem lịch sử đặt chỗ',
      onPress: () => navigation.navigate('Bookings'),
    },
    {
      icon: '🛒',
      title: 'Giỏ hàng',
      subtitle: 'Xem giỏ hàng hiện tại',
      onPress: () => navigation.navigate('Basket'),
    },
    {
      icon: '💳',
      title: 'Lịch sử thanh toán',
      subtitle: 'Xem lịch sử giao dịch',
      onPress: () => navigation.navigate('Payments'),
    },
  ];

  const settingsItems = [
    // Chỉ hiển thị Admin Dashboard cho admin
    ...(checkAdminAccess() ? [{
      icon: '🛠️',
      title: 'Admin Dashboard',
      subtitle: 'Quản lý hệ thống',
      onPress: () => navigation.navigate('AdminDashboard'),
    }] : []),
    {
      icon: '⚙️',
      title: 'Cài đặt',
      subtitle: 'Cài đặt ứng dụng',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
    },
    {
      icon: '❓',
      title: 'Trợ giúp',
      subtitle: 'Hỗ trợ khách hàng',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
    },
    {
      icon: '📞',
      title: 'Liên hệ',
      subtitle: 'Thông tin liên hệ',
      onPress: () => Alert.alert('Thông báo', 'Tính năng đang phát triển'),
    },
  ];

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={loading} onRefresh={loadUserInfo} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: 'https://via.placeholder.com/100x100?text=User' }}
              style={styles.avatar}
            />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {user?.fullName || userInfo?.fullName || 'User'}
            </Text>
            <Text style={styles.userEmail}>
              {user?.email || userInfo?.email || 'user@example.com'}
            </Text>
            <Text style={styles.userId}>
              @{user?.userName || userInfo?.userName || 'username'}
            </Text>
            {(user?.balance !== undefined || userInfo?.balance !== undefined) && (
              <Text style={styles.userBalance}>
                💰 Số dư: {(user?.balance || userInfo?.balance || 0).toLocaleString('vi-VN')} VND
              </Text>
            )}
          </View>
        </View>
        
        {/* View Detail Button */}
        <TouchableOpacity 
          style={styles.viewDetailButton}
          onPress={() => navigation.navigate('UserProfileDetail')}
        >
          <Text style={styles.viewDetailButtonText}>👁️ Xem chi tiết</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Button */}
      <View style={styles.quickActionContainer}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('UserProfileDetail')}
        >
          <Text style={styles.quickActionIcon}>👁️</Text>
          <Text style={styles.quickActionText}>Xem thông tin chi tiết</Text>
          <Text style={styles.quickActionArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Profile Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tài khoản</Text>
        {profileItems.map((item, index) => (
          <View key={index}>
            {renderProfileItem(item)}
            {index < profileItems.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>

      {/* Settings Items */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cài đặt & Hỗ trợ</Text>
        {settingsItems.map((item, index) => (
          <View key={index}>
            {renderProfileItem(item)}
            {index < settingsItems.length - 1 && <View style={styles.separator} />}
          </View>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
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
    paddingBottom: 30,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    marginRight: 15,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: 'white',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.textWhite,
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  userId: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
  },
  userBalance: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  viewDetailButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'center',
    marginTop: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  viewDetailButtonText: {
    color: Colors.textWhite,
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickActionContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  quickActionButton: {
    backgroundColor: Colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  quickActionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  quickActionText: {
    flex: 1,
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  quickActionArrow: {
    fontSize: 20,
    color: Colors.textWhite,
    marginLeft: 10,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textPrimary,
    marginBottom: 15,
  },
  profileItem: {
    backgroundColor: Colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderRadius: 12,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  profileItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  profileItemIcon: {
    fontSize: 24,
    marginRight: 15,
    width: 30,
  },
  profileItemText: {
    flex: 1,
  },
  profileItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  profileItemSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  profileItemArrow: {
    fontSize: 20,
    color: Colors.textHint,
    marginLeft: 10,
  },
  separator: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 45,
  },
  logoutButton: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 12,
    shadowColor: Colors.error,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  logoutText: {
    color: Colors.textWhite,
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
});
