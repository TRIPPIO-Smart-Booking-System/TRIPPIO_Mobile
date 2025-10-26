import { client } from './client';

export async function getAllTransports() {
  const { data } = await client.get('/api/transport');
  return data;
}

export async function getTransportById(transportId) {
  const { data } = await client.get(`/api/transport/${transportId}`);
  return data;
}

export async function getTransportWithTrips(transportId) {
  const { data } = await client.get(`/api/transport/${transportId}/trips`);
  return data;
}

export async function getTransportsByType(type) {
  const { data } = await client.get(`/api/transport/type/${type}`);
  return data;
}

export async function createTransport(transportData) {
  const { data } = await client.post('/api/transport', transportData);
  return data;
}

export async function updateTransport(transportId, transportData) {
  const { data } = await client.put(`/api/transport/${transportId}`, transportData);
  return data;
}

export async function deleteTransport(transportId) {
  const { data } = await client.delete(`/api/transport/${transportId}`);
  return data;
}
