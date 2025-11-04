import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUser } from '../../contexts/UserContext';
import { styles } from './styles';

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
    <TouchableOpacity style={styles.profileItem} onPress={onPress} activeOpacity={0.8}>
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
        <RefreshControl refreshing={loading} onRefresh={loadUserInfo} tintColor="#6366F1" />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Image 
              source={{ uri: user?.avatar || userInfo?.avatar || 'https://via.placeholder.com/100x100?text=User' }}
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
        
        <TouchableOpacity 
          style={styles.viewDetailButton}
          onPress={() => navigation.navigate('UserProfileDetail')}
          activeOpacity={0.8}
        >
          <Text style={styles.viewDetailButtonText}>👁️ Xem chi tiết</Text>
        </TouchableOpacity>
      </View>

      {/* Quick Action Button */}
      <View style={styles.quickActionContainer}>
        <TouchableOpacity 
          style={styles.quickActionButton}
          onPress={() => navigation.navigate('UserProfileDetail')}
          activeOpacity={0.8}
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
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} activeOpacity={0.8}>
          <Text style={styles.logoutIcon}>🚪</Text>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}
