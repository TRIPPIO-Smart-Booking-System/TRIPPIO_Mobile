import { client } from './client';

// Get basket by user ID
export async function getBasket(userId) {
  const { data } = await client.get(`/api/Basket/${userId}`);
  return data;
}

// Add item to basket
// productId: roomId/showId/tripId (actual product ID)
// attributes.bookingId: bookingId (stored in attributes)
export async function addItemToBasket(userId, item) {
  console.log('[Basket API] Adding item to basket:', {
    userId,
    productId: item.productId,
    quantity: item.quantity,
    attributes: item.attributes,
    hasBookingId: !!item.attributes?.bookingId
  });
  
  if (!userId) {
    throw new Error('userId is required');
  }
  
  if (!item.productId) {
    throw new Error('productId is required (roomId/showId/tripId)');
  }
  
  // Build request body according to AddItemDto schema
  const requestBody = {
    productId: item.productId, // roomId, showId, or tripId
    quantity: item.quantity || 1,
    attributes: item.attributes || null // bookingId stored here
  };
  
  console.log('[Basket API] Request body:', JSON.stringify(requestBody, null, 2));
  console.log('[Basket API] Endpoint:', `/api/Basket/${userId}/items`);
  
  try {
    const response = await client.post(`/api/Basket/${userId}/items`, requestBody);
    console.log('[Basket API] ✅ Success - Response status:', response.status);
    console.log('[Basket API] Response data:', response.data);
    return response.data || response;
  } catch (error) {
    console.error('[Basket API] ❌ Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      url: error.config?.url,
      method: error.config?.method,
      requestBody: JSON.stringify(requestBody, null, 2)
    });
    throw error;
  }
}

// Update item quantity in basket
export async function updateItemQuantity(userId, productId, quantity) {
  const { data } = await client.put(`/api/Basket/${userId}/items/quantity`, {
    productId,
    quantity
  });
  return data;
}

// Remove item from basket
export async function removeItemFromBasket(userId, productId) {
  const { data } = await client.delete(`/api/Basket/${userId}/items/${productId}`);
  return data;
}

// Clear entire basket
export async function clearBasket(userId) {
  const { data } = await client.delete(`/api/Basket/${userId}`);
  return data;
}
