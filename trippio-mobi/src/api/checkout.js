import { client } from './client';

export async function startCheckout({ userId, buyerName, buyerEmail, buyerPhone }) {
  const { data } = await client.post('/api/checkout/start', { userId, buyerName, buyerEmail, buyerPhone });
  return data;
}

export async function getCheckoutStatus(orderCode) {
  const { data } = await client.get(`/api/checkout/status/${orderCode}`);
  return data;
}