import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAllReviews, deleteReview } from '../../api/review';
import { handleApiError } from '../../utils/apiErrorHandler';
import { useUser } from '../../contexts/UserContext';
import Colors from '../../constants/colors';

const renderStars = (rating) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text key={i} style={styles.star}>
        {i <= rating ? '⭐' : '☆'}
      </Text>
    );
  }
  return <View style={styles.starsContainer}>{stars}</View>;
};

const ReviewItem = ({ item, onDelete, navigation }) => {
  const handleDelete = () => {
    Alert.alert(
      'Xóa đánh giá',
      'Bạn có chắc chắn muốn xóa đánh giá này?',
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: () => onDelete(item.id),
        },
      ]
    );
  };

  return (
    <View style={styles.reviewCard}>
      <View style={styles.reviewHeader}>
        <View style={styles.reviewHeaderLeft}>
          <Text style={styles.reviewId}>Review #{item.id}</Text>
          <Text style={styles.reviewOrderId}>Order #{item.orderId}</Text>
        </View>
        <View style={styles.reviewHeaderRight}>
          {renderStars(item.rating)}
          <Text style={styles.ratingText}>{item.rating}/5</Text>
        </View>
      </View>

      {item.comment && (
        <View style={styles.commentContainer}>
          <Text style={styles.commentText}>{item.comment}</Text>
        </View>
      )}

      <View style={styles.reviewFooter}>
        <View style={styles.reviewMeta}>
          {item.userName && (
            <Text style={styles.reviewMetaText}>👤 {item.userName}</Text>
          )}
          {item.createdAt && (
            <Text style={styles.reviewMetaText}>
              📅 {new Date(item.createdAt).toLocaleDateString('vi-VN')}
            </Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color={Colors.error} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default function AdminReviewsScreen({ navigation }) {
  const { logout } = useUser();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      console.log('[AdminReviewsScreen] Loading all reviews');
      console.log('[AdminReviewsScreen] User is admin:', true); // Assuming admin access is checked
      
      const response = await getAllReviews();
      console.log('[AdminReviewsScreen] ✅ Reviews API response:', JSON.stringify(response, null, 2));
      
      const reviewsData = response?.data || response || [];
      console.log('[AdminReviewsScreen] Reviews loaded:', reviewsData.length, 'reviews');
      
      if (!Array.isArray(reviewsData)) {
        console.warn('[AdminReviewsScreen] ⚠️ Reviews data is not an array:', typeof reviewsData);
        setReviews([]);
        return;
      }
      
      setReviews(reviewsData);
    } catch (error) {
      console.error('[AdminReviewsScreen] ❌ Load reviews error:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        errorData: error.response?.data,
        url: error.config?.url,
        method: error.config?.method,
      });
      
      const errorResult = await handleApiError(error, navigation, logout);
      if (!errorResult.shouldNavigate) {
        let errorMessage = 'Không thể tải danh sách đánh giá';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.response?.status === 404) {
          errorMessage = 'API endpoint không tồn tại. Vui lòng kiểm tra backend.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Không có quyền truy cập. Vui lòng đăng nhập lại.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Bạn không có quyền admin để xem reviews.';
        }
        
        Alert.alert('Lỗi', errorMessage);
      }
      setReviews([]);
    } finally {
      setLoading(false);
    }
  }, [navigation, logout]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReviews();
    setRefreshing(false);
  }, [loadReviews]);

  const handleDelete = useCallback(
    async (reviewId) => {
      try {
        setDeletingId(reviewId);
        console.log('[AdminReviewsScreen] Deleting review:', reviewId);
        await deleteReview(reviewId);
        Alert.alert('Thành công', 'Đã xóa đánh giá thành công');
        // Reload reviews
        await loadReviews();
      } catch (error) {
        console.error('[AdminReviewsScreen] Delete review error:', error);
        const errorResult = await handleApiError(error, navigation, logout);
        if (!errorResult.shouldNavigate) {
          Alert.alert('Lỗi', errorResult.message || 'Không thể xóa đánh giá');
        }
      } finally {
        setDeletingId(null);
      }
    },
    [loadReviews, navigation, logout]
  );

  const renderReviewItem = useCallback(
    ({ item }) => (
      <ReviewItem item={item} onDelete={handleDelete} navigation={navigation} />
    ),
    [handleDelete, navigation]
  );

  if (loading && reviews.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Đang tải đánh giá...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.textWhite} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Quản lý đánh giá</Text>
        <View style={styles.headerRight} />
      </View>

      <View style={styles.statsBar}>
        <View style={styles.statItem}>
          <Ionicons name="star" size={20} color={Colors.warning} />
          <Text style={styles.statText}>Tổng: {reviews.length} đánh giá</Text>
        </View>
        <View style={styles.statItem}>
          <Ionicons name="star-half" size={20} color={Colors.primary} />
          <Text style={styles.statText}>
            Trung bình:{' '}
            {reviews.length > 0
              ? (
                  reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
                ).toFixed(1)
              : '0.0'}
            /5
          </Text>
        </View>
      </View>

      {reviews.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="star-outline" size={64} color={Colors.textTertiary} />
          <Text style={styles.emptyTitle}>Chưa có đánh giá nào</Text>
          <Text style={styles.emptySubtitle}>
            Hiện tại chưa có đánh giá nào trong hệ thống
          </Text>
        </View>
      ) : (
        <FlatList
          data={reviews}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderReviewItem}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 50,
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
  headerRight: {
    width: 40,
  },
  statsBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.surface,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  listContent: {
    padding: 16,
  },
  reviewCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  reviewHeaderLeft: {
    flex: 1,
  },
  reviewId: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  reviewOrderId: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  reviewHeaderRight: {
    alignItems: 'flex-end',
  },
  starsContainer: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  star: {
    fontSize: 16,
    marginHorizontal: 2,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.warning,
  },
  commentContainer: {
    backgroundColor: Colors.backgroundSecondary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  commentText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  reviewFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  reviewMeta: {
    flex: 1,
    gap: 8,
  },
  reviewMetaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  deleteButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

