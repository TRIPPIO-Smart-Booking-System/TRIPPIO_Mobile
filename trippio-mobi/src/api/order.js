import { client } from './client';

// Create order from basket
export async function createOrderFromBasket(userId) {
  const { data } = await client.post(`/api/Order/from-basket/${userId}`);
  return data;
}

// Create order manually
export async function createOrder(orderData) {
  const { data } = await client.post('/api/Order', orderData);
  return data;
}

// Get orders by user ID
export async function getOrdersByUser(userId) {
  const { data } = await client.get(`/api/Order/user/${userId}`);
  return data;
}

// Get order by ID
export async function getOrderById(orderId) {
  const { data } = await client.get(`/api/Order/${orderId}`);
  return data;
}

// Get orders by status
export async function getOrdersByStatus(status) {
  const { data } = await client.get(`/api/Order/status/${status}`);
  return data;
}

// Update order status
export async function updateOrderStatus(orderId, status) {
  const { data } = await client.put(`/api/Order/${orderId}/status?status=${status}`);
  return data;
}

// Cancel order
export async function cancelOrder(orderId, userId) {
  const { data } = await client.put(`/api/Order/${orderId}/cancel?userId=${userId}`);
  return data;
}

// Get revenue
export async function getRevenue(from, to) {
  const { data } = await client.get(`/api/Order/revenue?from=${from}&to=${to}`);
  return data;
}

// Get pending orders
export async function getPendingOrders() {
  const { data } = await client.get('/api/Order/pending');
  return data;
}