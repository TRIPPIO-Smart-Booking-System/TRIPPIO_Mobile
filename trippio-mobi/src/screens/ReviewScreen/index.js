import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { createReview, canReviewOrder, getReviewsByOrderId } from '../../api/review';
import { handleApiError } from '../../utils/apiErrorHandler';
import { useUser } from '../../contexts/UserContext';
import { styles } from './styles';
import Colors from '../../constants/colors';

export default function ReviewScreen({ route, navigation }) {
  const { orderId, order } = route.params || {};
  const { logout, user } = useUser();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [canReview, setCanReview] = useState(true);
  const [checkingCanReview, setCheckingCanReview] = useState(true);
  const [existingReview, setExistingReview] = useState(null);
  const [reviewReason, setReviewReason] = useState('');

  // Load existing review data if available
  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || '');
    }
  }, [existingReview]);

  useEffect(() => {
    checkCanReview();
  }, [orderId]);

  const checkCanReview = async () => {
    if (!orderId) {
      console.log('[ReviewScreen] No orderId provided');
      setCanReview(false);
      setCheckingCanReview(false);
      return;
    }

    try {
      setCheckingCanReview(true);
      console.log('[ReviewScreen] Checking if order can be reviewed, orderId:', orderId);
      
      // Check if order can be reviewed
      const result = await canReviewOrder(orderId);
      console.log('[ReviewScreen] Can review result:', result);
      
      // Also check if there's an existing review
      try {
        const reviews = await getReviewsByOrderId(orderId);
        const reviewsArray = Array.isArray(reviews) ? reviews : (reviews?.data || []);
        console.log('[ReviewScreen] Existing reviews for order:', reviewsArray.length);
        
        if (reviewsArray.length > 0) {
          // Find review by current user if possible
          const userReview = reviewsArray.find(r => r.userId === user?.id) || reviewsArray[0];
          setExistingReview(userReview);
          setReviewReason('Bạn đã đánh giá đơn hàng này rồi. Bạn có thể cập nhật đánh giá của mình.');
          console.log('[ReviewScreen] Found existing review:', userReview);
        } else {
          setExistingReview(null);
          if (!result) {
            setReviewReason('Đơn hàng này không thể đánh giá. Có thể đơn hàng chưa được xác nhận hoặc không tồn tại.');
          }
        }
      } catch (reviewError) {
        console.log('[ReviewScreen] Could not fetch existing reviews:', reviewError.message);
        // Continue anyway
      }
      
      // Allow review even if canReview is false - backend will validate
      // But show warning if canReview is false
      setCanReview(true); // Always allow attempt, backend will validate
      
      if (!result && !existingReview) {
        console.warn('[ReviewScreen] ⚠️ Order cannot be reviewed. Possible reasons:');
        console.warn('  - Order not confirmed');
        console.warn('  - Order does not exist');
        console.warn('  - User does not own this order');
      }
    } catch (error) {
      console.error('[ReviewScreen] ❌ Error checking can review:', {
        message: error.message,
        status: error.response?.status,
        errorData: error.response?.data,
      });
      // If error, allow review attempt (backend will validate)
      console.log('[ReviewScreen] Allowing review attempt despite check error (backend will validate)');
      setCanReview(true);
    } finally {
      setCheckingCanReview(false);
    }
  };

  const handleSubmit = async () => {
    if (!orderId) {
      Alert.alert('Lỗi', 'Không tìm thấy thông tin đơn hàng');
      return;
    }

    if (!rating || rating < 1 || rating > 5) {
      Alert.alert('Lỗi', 'Vui lòng chọn đánh giá từ 1 đến 5 sao');
      return;
    }

    if (comment && comment.length > 1000) {
      Alert.alert('Lỗi', 'Bình luận không được vượt quá 1000 ký tự');
      return;
    }

    try {
      setLoading(true);
      console.log('[ReviewScreen] Submitting review:', { orderId, rating, comment });

      const reviewData = {
        orderId: Number(orderId),
        rating: Number(rating),
        comment: comment.trim() || null,
      };

      console.log('[ReviewScreen] Review data to send:', JSON.stringify(reviewData, null, 2));

      const result = await createReview(reviewData);
      
      console.log('[ReviewScreen] ✅ Review created successfully:', result);

      Alert.alert(
        'Thành công',
        'Cảm ơn bạn đã đánh giá! Đánh giá của bạn đã được ghi nhận.',
        [
          {
            text: 'OK',
            onPress: () => {
              // Navigate back to order detail or orders list
              navigation.goBack();
            },
          },
        ]
      );
    } catch (error) {
      console.error('[ReviewScreen] ❌ Submit review error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        stack: error.stack,
      });
      
      const errorResult = await handleApiError(error, navigation, logout);
      if (!errorResult.shouldNavigate) {
        // Show more detailed error message
        let errorMessage = 'Không thể gửi đánh giá. Vui lòng thử lại.';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        Alert.alert('Lỗi', errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <TouchableOpacity
          key={i}
          onPress={() => setRating(i)}
          activeOpacity={0.7}
          style={styles.starButton}
        >
          <Text style={[styles.star, i <= rating ? styles.starFilled : styles.starEmpty]}>
            {i <= rating ? '⭐' : '☆'}
          </Text>
        </TouchableOpacity>
      );
    }
    return stars;
  };

  if (checkingCanReview) {
    return (
      <View style={[styles.container, styles.centerContainer]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang kiểm tra...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>
            {existingReview ? '✏️ Cập nhật đánh giá' : '⭐ Đánh giá đơn hàng'}
          </Text>
          <Text style={styles.headerSubtitle}>
            Đơn hàng #{orderId || order?.id || 'N/A'}
          </Text>
          {reviewReason && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>⚠️ {reviewReason}</Text>
            </View>
          )}
        </View>

        {/* Order Info */}
        {order && (
          <View style={styles.orderInfoCard}>
            <Text style={styles.orderInfoTitle}>📦 Thông tin đơn hàng</Text>
            <View style={styles.orderInfoRow}>
              <Text style={styles.orderInfoLabel}>Tổng tiền:</Text>
              <Text style={styles.orderInfoValue}>
                {order.totalAmount?.toLocaleString('vi-VN') || 0} VND
              </Text>
            </View>
            <View style={styles.orderInfoRow}>
              <Text style={styles.orderInfoLabel}>Ngày đặt:</Text>
              <Text style={styles.orderInfoValue}>
                {order.orderDate
                  ? new Date(order.orderDate).toLocaleDateString('vi-VN')
                  : 'N/A'}
              </Text>
            </View>
          </View>
        )}

        {/* Rating Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Đánh giá của bạn</Text>
          <View style={styles.starsContainer}>{renderStars()}</View>
          <Text style={styles.ratingText}>
            {rating === 5 && 'Tuyệt vời! 🌟'}
            {rating === 4 && 'Rất tốt! 👍'}
            {rating === 3 && 'Tốt! 👍'}
            {rating === 2 && 'Cần cải thiện 😕'}
            {rating === 1 && 'Không hài lòng 😞'}
          </Text>
        </View>

        {/* Comment Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bình luận (Tùy chọn)</Text>
          <TextInput
            style={styles.commentInput}
            placeholder="Chia sẻ trải nghiệm của bạn về đơn hàng này..."
            placeholderTextColor={Colors.inputPlaceholder}
            value={comment}
            onChangeText={setComment}
            multiline
            numberOfLines={6}
            maxLength={1000}
            textAlignVertical="top"
          />
          <Text style={styles.charCount}>
            {comment.length}/1000 ký tự
          </Text>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color={Colors.textWhite} />
          ) : (
            <Text style={styles.submitButtonText}>
              {existingReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

