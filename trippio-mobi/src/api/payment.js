import { client } from './client';

// Create PayOS payment
// According to CreatePayOSPaymentRequest schema:
// - orderCode: integer (1-999999) - REQUIRED
// - amount: integer (2000-2147483647) - REQUIRED
// - description: string (1-255 chars) - REQUIRED
// - buyerName, buyerEmail, buyerPhone, userId: optional
export async function createPayOSPayment({
  orderCode,
  amount,
  description,
  buyerName,
  buyerEmail,
  buyerPhone,
  userId
}) {
  console.log('[Payment API] Creating PayOS payment:', {
    orderCode,
    amount,
    description,
    buyerName,
    buyerEmail,
    buyerPhone,
    userId
  });

  // Validate required fields
  if (!orderCode || orderCode < 1 || orderCode > 999999) {
    throw new Error('orderCode must be between 1 and 999999');
  }
  if (!amount || amount < 2000) {
    throw new Error('amount must be at least 2000');
  }
  if (!description || description.length < 1 || description.length > 255) {
    throw new Error('description must be between 1 and 255 characters');
  }

  // Ensure orderCode and amount are integers
  const requestBody = {
    orderCode: parseInt(orderCode),
    amount: parseInt(amount),
    description: description.substring(0, 255), // Ensure max length
    ...(buyerName && { buyerName: buyerName.substring(0, 100) }), // Max 100 chars
    ...(buyerEmail && { buyerEmail }),
    ...(buyerPhone && { buyerPhone }),
    ...(userId && { userId })
  };

  console.log('[Payment API] Request body:', requestBody);

  try {
    const response = await client.post('/api/payment/realmoney', requestBody);
    console.log('[Payment API] Response status:', response.status);
    console.log('[Payment API] Response data:', response.data);
    
    // Response structure might be nested: { code: 200, data: { checkoutUrl: ... } }
    // or direct: { checkoutUrl: ... }
    const responseData = response.data;
    const paymentData = responseData?.data || responseData;
    
    console.log('[Payment API] Extracted payment data:', paymentData);
    
    return paymentData || responseData;
  } catch (error) {
    console.error('[Payment API] Error details:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      errorData: error.response?.data,
      requestBody: requestBody
    });
    throw error;
  }
}

// Get payment info by order code
export async function getPaymentInfo(orderCode) {
  const { data } = await client.get(`/api/payment/realmoney/${orderCode}`);
  return data;
}

// Cancel payment
export async function cancelPayment(orderCode, reason) {
  const { data } = await client.post(`/api/payment/realmoney/${orderCode}/cancel`, reason || '');
  return data;
}

// Get payments by user ID
export async function getPaymentsByUser(userId) {
  const { data } = await client.get(`/api/payment/user/${userId}`);
  return data;
}

// Get all payments (admin)
export async function getAllPayments() {
  const { data } = await client.get('/api/payment/all');
  return data;
}
