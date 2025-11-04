import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, Image, ActivityIndicator, TextInput, Modal, KeyboardAvoidingView, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserProfile } from '../../api/auth';
import { useUser } from '../../contexts/UserContext';
import { styles } from './styles';

export default function UserProfileDetailScreen({ navigation }) {
  const { user, updateUser } = useUser();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({});
  const [focusedInput, setFocusedInput] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      if (user) {
        setUserInfo({
          id: user.id,
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
            id: userInfoMap.userId,
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
      console.error('Load user profile error:', error);
      Alert.alert('Lỗi', 'Không thể tải thông tin người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditData({
      firstName: userInfo?.firstName || '',
      lastName: userInfo?.lastName || '',
      email: userInfo?.email || '',
      phoneNumber: userInfo?.phoneNumber || '',
      dateOfBirth: userInfo?.dob ? new Date(userInfo.dob).toISOString().split('T')[0] : ''
    });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const userId = await AsyncStorage.getItem('userId');
      
      const updateData = {
        ...editData,
        dateOfBirth: new Date(editData.dateOfBirth).toISOString()
      };

      console.log('Updating user profile:', updateData);
      const response = await updateUserProfile(userId, updateData);
      const updatedUser = response.data || response;
      
      console.log('User profile updated:', updatedUser);
      
      const updatedUserData = {
        ...user,
        ...updatedUser,
        fullName: updatedUser.firstName && updatedUser.lastName 
          ? `${updatedUser.firstName} ${updatedUser.lastName}` 
          : user.fullName
      };
      
      await updateUser(updatedUserData);
      
      setUserInfo(prev => ({
        ...prev,
        ...updatedUser,
        fullName: updatedUser.firstName && updatedUser.lastName 
          ? `${updatedUser.firstName} ${updatedUser.lastName}` 
          : prev.fullName
      }));
      
      setEditModalVisible(false);
      Alert.alert('Thành công', 'Thông tin đã được cập nhật');
    } catch (error) {
      console.error('Update user profile error:', error);
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin');
    } finally {
      setLoading(false);
    }
  };

  const renderInfoRow = ({ icon, label, value, editable = false }) => (
    <View style={styles.infoRow}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <View style={styles.infoContent}>
        <Text style={styles.infoLabel}>{label}</Text>
        <Text style={styles.infoValue}>{value || 'Chưa cập nhật'}</Text>
      </View>
    </View>
  );

  const renderEditModal = () => (
    <Modal
      visible={editModalVisible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <KeyboardAvoidingView 
        style={styles.modalContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setEditModalVisible(false)}>
            <Text style={styles.modalCancelButton}>Hủy</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
          <TouchableOpacity onPress={handleSave} disabled={loading}>
            <Text style={[styles.modalSaveButton, loading && styles.modalSaveButtonDisabled]}>
              {loading ? 'Đang lưu...' : 'Lưu'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tên</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'firstName' && styles.inputFocused
              ]}
              value={editData.firstName}
              onChangeText={(value) => setEditData(prev => ({ ...prev, firstName: value }))}
              placeholder="Nhập tên"
              placeholderTextColor="#9CA3AF"
              onFocus={() => setFocusedInput('firstName')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Họ</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'lastName' && styles.inputFocused
              ]}
              value={editData.lastName}
              onChangeText={(value) => setEditData(prev => ({ ...prev, lastName: value }))}
              placeholder="Nhập họ"
              placeholderTextColor="#9CA3AF"
              onFocus={() => setFocusedInput('lastName')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'email' && styles.inputFocused
              ]}
              value={editData.email}
              onChangeText={(value) => setEditData(prev => ({ ...prev, email: value }))}
              placeholder="Nhập email"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              onFocus={() => setFocusedInput('email')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'phone' && styles.inputFocused
              ]}
              value={editData.phoneNumber}
              onChangeText={(value) => setEditData(prev => ({ ...prev, phoneNumber: value }))}
              placeholder="Nhập số điện thoại"
              placeholderTextColor="#9CA3AF"
              keyboardType="phone-pad"
              onFocus={() => setFocusedInput('phone')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ngày sinh</Text>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'dob' && styles.inputFocused
              ]}
              value={editData.dateOfBirth}
              onChangeText={(value) => setEditData(prev => ({ ...prev, dateOfBirth: value }))}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              onFocus={() => setFocusedInput('dob')}
              onBlur={() => setFocusedInput(null)}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );

  if (loading && !userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (!userInfo) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy thông tin người dùng</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadUserProfile}>
          <Text style={styles.retryButtonText}>Thử lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>👤 Thông tin cá nhân</Text>
        <Text style={styles.headerSubtitle}>Xem và chỉnh sửa thông tin của bạn</Text>
      </View>

      {/* Avatar Section */}
      <View style={styles.avatarSection}>
        <View style={styles.avatarContainer}>
          <Image 
            source={{ uri: userInfo.avatar || 'https://via.placeholder.com/120x120?text=User' }}
            style={styles.avatar}
          />
        </View>
        <Text style={styles.userName}>{userInfo.fullName}</Text>
        <Text style={styles.userEmail}>{userInfo.email}</Text>
        {userInfo.balance !== undefined && (
          <Text style={styles.userBalance}>
            💰 Số dư: {userInfo.balance.toLocaleString('vi-VN')} VND
          </Text>
        )}
      </View>

      {/* User Info */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📋 Thông tin cơ bản</Text>
          <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
            <Text style={styles.editButtonText}>✏️ Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.infoCard}>
          {renderInfoRow({
            icon: '👤',
            label: 'Username',
            value: userInfo.userName
          })}
          
          {renderInfoRow({
            icon: '📧',
            label: 'Email',
            value: userInfo.email
          })}
          
          {renderInfoRow({
            icon: '📱',
            label: 'Số điện thoại',
            value: userInfo.phoneNumber
          })}
          
          {renderInfoRow({
            icon: '👨‍👩‍👧‍👦',
            label: 'Họ tên',
            value: userInfo.firstName && userInfo.lastName 
              ? `${userInfo.firstName} ${userInfo.lastName}` 
              : null
          })}
          
          {renderInfoRow({
            icon: '🎂',
            label: 'Ngày sinh',
            value: userInfo.dob 
              ? new Date(userInfo.dob).toLocaleDateString('vi-VN')
              : null
          })}
          
          {renderInfoRow({
            icon: '🆔',
            label: 'User ID',
            value: userInfo.id
          })}
        </View>
      </View>

      {/* Account Status */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔐 Trạng thái tài khoản</Text>
        <View style={styles.infoCard}>
          {renderInfoRow({
            icon: '✅',
            label: 'Email đã xác thực',
            value: userInfo.isEmailVerified ? 'Đã xác thực' : 'Chưa xác thực'
          })}
          
          {renderInfoRow({
            icon: '📱',
            label: 'Số điện thoại đã xác thực',
            value: userInfo.isPhoneVerified ? 'Đã xác thực' : 'Chưa xác thực'
          })}
          
          {renderInfoRow({
            icon: '📅',
            label: 'Ngày tạo tài khoản',
            value: userInfo.dateCreated 
              ? new Date(userInfo.dateCreated).toLocaleDateString('vi-VN')
              : null
          })}
        </View>
      </View>

      {renderEditModal()}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}
