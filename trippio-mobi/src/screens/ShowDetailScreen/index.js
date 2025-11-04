import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, Image, Modal, TextInput } from 'react-native';
import { getShowById } from '../../api/show';
import { createShowBooking } from '../../api/booking';
import { addItemToBasket } from '../../api/basket';
import { useUser } from '../../contexts/UserContext';
import { handleApiError } from '../../utils/apiErrorHandler';
import { styles, width } from './styles';
import Colors from '../../constants/colors';

export default function ShowDetailScreen({ route, navigation }) {
  const { user, logout } = useUser();
  const { showId } = route.params;
  const [show, setShow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [seatNumber, setSeatNumber] = useState('');
  const [seatClass, setSeatClass] = useState('Standard');
  const [showDate, setShowDate] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    loadShowDetail();
  }, [showId]);

  const loadShowDetail = async () => {
    try {
      setLoading(true);
      const response = await getShowById(showId);
      setShow(response.data || response.value || response);
      // Set default show date to startDate
      if (response.data?.startDate || response.value?.startDate || response?.startDate) {
        const date = new Date(response.data?.startDate || response.value?.startDate || response?.startDate);
        setShowDate(date.toISOString().split('T')[0]);
      }
    } catch (error) {
      console.error('Load show detail error:', error);
      const errorResult = await handleApiError(error, navigation, logout);
      if (!errorResult.shouldNavigate) {
        Alert.alert('Lỗi', errorResult.message || 'Không thể tải chi tiết show');
      }
    } finally {
      setLoading(false);
    }
  };

  const openBookingModal = () => {
    if (!show) return;
    
    // Set default show date to startDate
    if (show.startDate) {
      const date = new Date(show.startDate);
      setShowDate(date.toISOString().split('T')[0]);
    }
    setSeatNumber('');
    setSeatClass('Standard');
    setShowBookingModal(true);
  };

  const addShowToBasket = async () => {
    try {
      const userId = user?.id;
      if (!userId) {
        Alert.alert('Lỗi', 'Vui lòng đăng nhập');
        setShowBookingModal(false);
        return;
      }

      if (!seatNumber || !showDate) {
        Alert.alert('Lỗi', 'Vui lòng điền đầy đủ thông tin');
        return;
      }

      setBookingLoading(true);

      // Step 1: Create show booking
      const bookingDate = new Date(showDate);
      bookingDate.setHours(19, 0, 0, 0); // 7 PM default show time

      const bookingResponse = await createShowBooking({
        userId,
        showId: show.id,
        seatNumber,
        showDate: bookingDate.toISOString(),
        seatClass: seatClass || null
      });

      // Response structure: { code: 200, message: "...", data: { id: "...", ... } }
      const responseData = bookingResponse?.data;
      const booking = responseData?.data || responseData;
      
      // Extract bookingId from response.data.data.id
      const bookingId = booking?.id || 
                       booking?.bookingId || 
                       responseData?.data?.id ||
                       responseData?.id ||
                       null;

      console.log('[ShowDetail] Booking response structure:', {
        code: responseData?.code,
        message: responseData?.message,
        bookingId: bookingId
      });

      if (!bookingId) {
        console.error('[ShowDetail] Cannot extract bookingId:', responseData);
        Alert.alert('Lỗi', 'Không nhận được booking ID từ server. Vui lòng thử lại.');
        return;
      }

      // Validate bookingId is UUID
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(bookingId)) {
        Alert.alert('Lỗi', `Booking ID không hợp lệ: ${bookingId}`);
        return;
      }

      // Step 2: Add booking to basket
      // productId should be the actual product ID (showId), not bookingId
      // bookingId should be stored in attributes
      console.log('[ShowDetail] Adding to basket with:', {
        userId,
        productId: show.id, // Use showId as productId
        bookingId: bookingId, // Store bookingId in attributes
        quantity: 1
      });

      await addItemToBasket(userId, {
        productId: show.id, // Use showId as productId (actual product)
        quantity: 1,
        attributes: {
          type: 'Show',
          bookingId: bookingId, // Store bookingId in attributes
          showId: show.id,
          showName: show.name,
          seatNumber,
          seatClass,
          showDate: showDate
        }
      });

      setShowBookingModal(false);
      Alert.alert(
        'Thành công! 🎉',
        'Đã tạo booking và thêm show vào giỏ hàng',
        [
          {
            text: 'Xem giỏ hàng',
            onPress: () => navigation.navigate('Basket')
          },
          { text: 'Tiếp tục', style: 'cancel' }
        ]
      );
    } catch (error) {
      console.error('Add show to basket error:', error);
      const errorResult = await handleApiError(error, navigation, logout);
      if (!errorResult.shouldNavigate) {
        Alert.alert(
          'Lỗi',
          errorResult.message || error.response?.data?.message || error.message || 'Không thể tạo booking và thêm vào giỏ hàng'
        );
      }
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết show...</Text>
      </View>
    );
  }

  if (!show) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Không tìm thấy show.</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: show.imageUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop' }}
            style={styles.showImage}
            resizeMode="cover"
          />
          <View style={styles.imageOverlay}>
            <View style={styles.showBadge}>
              <Text style={styles.showBadgeText}>🎭</Text>
            </View>
            <View style={styles.priceBadge}>
              <Text style={styles.priceBadgeText}>
                {show.price ? `${show.price.toLocaleString('vi-VN')} VND` : '2,000 VND'}
              </Text>
            </View>
          </View>
        </View>
        
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{show.name}</Text>
          </View>

          <View style={styles.infoSection}>
            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📍</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Địa điểm</Text>
                <Text style={styles.infoValue}>{show.location}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🏙️</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thành phố</Text>
                <Text style={styles.infoValue}>{show.city}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>📅</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Ngày diễn</Text>
                <Text style={styles.infoValue}>
                  {new Date(show.startDate).toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>⏰</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Thời gian</Text>
                <Text style={styles.infoValue}>
                  {new Date(show.startDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(show.endDate).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>🎫</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Vé còn lại</Text>
                <Text style={styles.infoValue}>{show.availableTickets || 0} vé</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoIcon}>💰</Text>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Giá vé</Text>
                <Text style={styles.infoValue}>
                  {show.price ? `${show.price.toLocaleString('vi-VN')} VND` : '2,000 VND'}
                </Text>
              </View>
            </View>
          </View>

          {show.description && (
            <View style={styles.descriptionSection}>
              <Text style={styles.sectionTitle}>Mô tả</Text>
              <Text style={styles.description}>{show.description}</Text>
            </View>
          )}

          <View style={styles.bookingSection}>
            <TouchableOpacity 
              style={styles.bookButton}
              onPress={openBookingModal}
              activeOpacity={0.8}
            >
              <Text style={styles.bookButtonText}>🎫 Đặt vé ngay</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Booking Modal */}
      <Modal
        visible={showBookingModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowBookingModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Đặt vé show</Text>
            <Text style={styles.modalSubtitle}>{show?.name}</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Số ghế</Text>
              <TextInput
                style={styles.input}
                value={seatNumber}
                onChangeText={setSeatNumber}
                placeholder="VD: A12, B05"
                placeholderTextColor={Colors.inputPlaceholder}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Hạng ghế</Text>
              <TextInput
                style={styles.input}
                value={seatClass}
                onChangeText={setSeatClass}
                placeholder="Standard, VIP, Premium"
                placeholderTextColor={Colors.inputPlaceholder}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Ngày diễn</Text>
              <TextInput
                style={styles.input}
                value={showDate}
                onChangeText={setShowDate}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={Colors.inputPlaceholder}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowBookingModal(false)}
                disabled={bookingLoading}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={addShowToBasket}
                disabled={bookingLoading}
              >
                {bookingLoading ? (
                  <ActivityIndicator color={Colors.textWhite} />
                ) : (
                  <Text style={styles.confirmButtonText}>Xác nhận</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}
