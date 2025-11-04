import { client } from './client';

// Start checkout process
export async function startCheckout({ userId, buyerName, buyerEmail, buyerPhone }) {
  const { data } = await client.post('/api/Checkout/start', {
    userId: userId || null,
    buyerName: buyerName || null,
    buyerEmail: buyerEmail || null,
    buyerPhone: buyerPhone || null
  });
  return data;
}

// Get checkout status by order code
export async function getCheckoutStatus(orderCode) {
  const { data } = await client.get(`/api/Checkout/status/${orderCode}`);
  return data;
}

// Cancel checkout
export async function cancelCheckout(orderCode, reason) {
  const { data } = await client.post(`/api/Checkout/cancel/${orderCode}`, reason || '');
  return data;
}
