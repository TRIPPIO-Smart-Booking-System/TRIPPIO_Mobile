import { client } from './client';

export async function addItem(userId, item) {
  const { data } = await client.post(`/api/basket/${userId}/items`, {
    productId: item.productId,
    quantity: item.quantity,
    price: item.price
  });
  return data;
}

export async function getBasket(userId) {
  const { data } = await client.get(`/api/basket/${userId}`);
  return data;
}

export async function updateItemQuantity(userId, productId, quantity) {
  const { data } = await client.put(`/api/basket/${userId}/items/quantity`, { productId, quantity });
  return data;
}

export async function removeItem(userId, productId) {
  const { data } = await client.delete(`/api/basket/${userId}/items/${productId}`);
  return data;
}

export async function clearBasket(userId) {
  const { data } = await client.delete(`/api/basket/${userId}`);
  return data;
}