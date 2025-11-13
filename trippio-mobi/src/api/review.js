import { client } from './client';

/**
 * Create a review for an order
 * @param {Object} reviewData - Review data
 * @param {number} reviewData.orderId - Order ID (required)
 * @param {number} reviewData.rating - Rating from 1 to 5 (required)
 * @param {string} reviewData.comment - Comment (optional, max 1000 chars)
 * @returns {Promise} Review response
 */
export async function createReview(reviewData) {
  try {
    console.log('[Review API] Creating review:', JSON.stringify(reviewData, null, 2));
    
    // Validate required fields
    if (!reviewData.orderId || reviewData.orderId <= 0) {
      throw new Error('orderId is required and must be greater than 0');
    }
    
    if (!reviewData.rating || reviewData.rating < 1 || reviewData.rating > 5) {
      throw new Error('rating is required and must be between 1 and 5');
    }
    
    // Prepare request body according to CreateReviewRequest schema
    const requestBody = {
      orderId: Number(reviewData.orderId),
      rating: Number(reviewData.rating),
      comment: reviewData.comment && reviewData.comment.trim() ? reviewData.comment.trim() : null,
    };
    
    console.log('[Review API] Request body:', JSON.stringify(requestBody, null, 2));
    console.log('[Review API] Endpoint: POST /api/review');
    
    const response = await client.post('/api/review', requestBody);
    
    console.log('[Review API] ✅ Success - Response status:', response.status);
    console.log('[Review API] Response data:', JSON.stringify(response.data, null, 2));
    
    return response.data || response;
  } catch (error) {
    console.error('[Review API] ❌ Error creating review:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      requestBody: JSON.stringify(reviewData, null, 2),
    });
    throw error;
  }
}

/**
 * Check if an order can be reviewed
 * @param {number} orderId - Order ID
 * @returns {Promise<boolean>} Whether the order can be reviewed
 */
export async function canReviewOrder(orderId) {
  try {
    console.log('[Review API] Checking if order can be reviewed:', orderId);
    console.log('[Review API] Endpoint: GET /api/review/can-review/' + orderId);
    
    const response = await client.get(`/api/review/can-review/${orderId}`);
    const data = response.data;
    
    console.log('[Review API] ✅ Can review response status:', response.status);
    console.log('[Review API] Can review response data:', JSON.stringify(data, null, 2));
    
    // API might return a boolean or an object with a boolean property
    const canReview = data === true || data === false ? data : data?.canReview || false;
    
    console.log('[Review API] Parsed canReview result:', canReview);
    
    return canReview;
  } catch (error) {
    console.error('[Review API] ❌ Error checking if can review:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    // If error, assume cannot review (but log it)
    return false;
  }
}

/**
 * Get reviews by order ID
 * @param {number} orderId - Order ID
 * @returns {Promise} Reviews for the order
 */
export async function getReviewsByOrderId(orderId) {
  console.log('[Review API] Getting reviews for order:', orderId);
  const { data } = await client.get(`/api/review/order/${orderId}`);
  console.log('[Review API] Reviews loaded:', data);
  return data;
}

/**
 * Get current user's reviews
 * @returns {Promise} User's reviews
 */
export async function getMyReviews() {
  console.log('[Review API] Getting my reviews');
  const { data } = await client.get('/api/review/my-reviews');
  console.log('[Review API] My reviews loaded:', data);
  return data;
}

/**
 * Get all reviews (Admin only)
 * @returns {Promise} All reviews with data and count
 */
export async function getAllReviews() {
  try {
    console.log('[Review API] Getting all reviews (Admin)');
    console.log('[Review API] Endpoint: GET /api/review');
    
    const response = await client.get('/api/review');
    
    console.log('[Review API] ✅ Success - Response status:', response.status);
    console.log('[Review API] Response data:', JSON.stringify(response.data, null, 2));
    
    // Handle different response formats
    // Could be: { data: [], count: 0 } or just [] or { reviews: [] }
    if (Array.isArray(response.data)) {
      return { data: response.data, count: response.data.length };
    } else if (response.data?.data) {
      return response.data;
    } else if (response.data?.reviews) {
      return { data: response.data.reviews, count: response.data.reviews.length };
    } else {
      return { data: [], count: 0 };
    }
  } catch (error) {
    console.error('[Review API] ❌ Error getting all reviews:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
    });
    
    // If 404, try alternative endpoint
    if (error.response?.status === 404) {
      console.log('[Review API] Trying alternative endpoint: GET /api/review/my-reviews');
      try {
        const altResponse = await client.get('/api/review/my-reviews');
        if (Array.isArray(altResponse.data)) {
          return { data: altResponse.data, count: altResponse.data.length };
        }
      } catch (altError) {
        console.error('[Review API] Alternative endpoint also failed:', altError);
      }
    }
    
    throw error;
  }
}

/**
 * Get review by ID
 * @param {number} reviewId - Review ID
 * @returns {Promise} Review data
 */
export async function getReviewById(reviewId) {
  console.log('[Review API] Getting review by ID:', reviewId);
  const { data } = await client.get(`/api/review/${reviewId}`);
  console.log('[Review API] Review loaded:', data);
  return data;
}

/**
 * Update a review
 * @param {number} reviewId - Review ID
 * @param {Object} updateData - Update data (rating, comment)
 * @returns {Promise} Updated review
 */
export async function updateReview(reviewId, updateData) {
  console.log('[Review API] Updating review:', reviewId, updateData);
  const { data } = await client.put(`/api/review/${reviewId}`, updateData);
  console.log('[Review API] Review updated successfully:', data);
  return data;
}

/**
 * Delete a review
 * @param {number} reviewId - Review ID
 * @returns {Promise} Delete response
 */
export async function deleteReview(reviewId) {
  console.log('[Review API] Deleting review:', reviewId);
  const { data } = await client.delete(`/api/review/${reviewId}`);
  console.log('[Review API] Review deleted successfully:', data);
  return data;
}

