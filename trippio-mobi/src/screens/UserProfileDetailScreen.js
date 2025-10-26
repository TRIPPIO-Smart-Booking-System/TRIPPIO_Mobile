import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  StyleSheet, 
  Image,
  ActivityIndicator,
  TextInput,
  Modal
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateUserProfile } from '../api/auth';

export default function UserProfileDetailScreen({ navigation }) {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      
      // Load all user info from AsyncStorage (đã được lưu khi login)
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
      
      // Update local state
      setUserInfo(prev => ({
        ...prev,
        ...updatedUser,
        fullName: updatedUser.firstName && updatedUser.lastName 
          ? `${updatedUser.firstName} ${updatedUser.lastName}` 
          : prev.fullName
      }));
      
      // Update AsyncStorage
      await AsyncStorage.multiSet([
        ['firstName', updatedUser.firstName || ''],
        ['lastName', updatedUser.lastName || ''],
        ['email', updatedUser.email || ''],
        ['phoneNumber', updatedUser.phoneNumber || ''],
        ['fullName', updatedUser.firstName && updatedUser.lastName 
          ? `${updatedUser.firstName} ${updatedUser.lastName}` 
          : prev.fullName || '']
      ]);
      
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
      <View style={styles.modalContainer}>
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

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tên</Text>
            <TextInput
              style={styles.input}
              value={editData.firstName}
              onChangeText={(value) => setEditData(prev => ({ ...prev, firstName: value }))}
              placeholder="Nhập tên"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Họ</Text>
            <TextInput
              style={styles.input}
              value={editData.lastName}
              onChangeText={(value) => setEditData(prev => ({ ...prev, lastName: value }))}
              placeholder="Nhập họ"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              value={editData.email}
              onChangeText={(value) => setEditData(prev => ({ ...prev, email: value }))}
              placeholder="Nhập email"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Số điện thoại</Text>
            <TextInput
              style={styles.input}
              value={editData.phoneNumber}
              onChangeText={(value) => setEditData(prev => ({ ...prev, phoneNumber: value }))}
              placeholder="Nhập số điện thoại"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Ngày sinh</Text>
            <TextInput
              style={styles.input}
              value={editData.dateOfBirth}
              onChangeText={(value) => setEditData(prev => ({ ...prev, dateOfBirth: value }))}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
            />
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  if (loading && !userInfo) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
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
    <ScrollView style={styles.container}>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: '#6c5ce7',
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
  avatarSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: 'white',
    marginTop: -20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: '#6c5ce7',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 4,
  },
  userBalance: {
    fontSize: 16,
    color: '#28a745',
    fontWeight: 'bold',
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  editButton: {
    backgroundColor: '#6c5ce7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 15,
    width: 30,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  modalCancelButton: {
    fontSize: 16,
    color: '#6c757d',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  modalSaveButton: {
    fontSize: 16,
    color: '#6c5ce7',
    fontWeight: 'bold',
  },
  modalSaveButtonDisabled: {
    color: '#ccc',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  bottomSpacing: {
    height: 30,
  },
});
