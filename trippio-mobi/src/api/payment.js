import { client } from './client';

export async function getPaymentsByUser(userId) {
  const { data } = await client.get(`/api/payment/user/${userId}`);
  return data;
}

// Hoặc dùng /api/payment/all nếu backend mở endpoint này cho user
export async function getAllPayments() {
  const { data } = await client.get('/api/payment/all');
  return data;
}