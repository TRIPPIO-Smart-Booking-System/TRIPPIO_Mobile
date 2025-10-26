import { client } from './client';

export async function getAllTransportTrips() {
  const { data } = await client.get('/api/transporttrip');
  return data;
}

export async function getTransportTripById(tripId) {
  const { data } = await client.get(`/api/transporttrip/${tripId}`);
  return data;
}

export async function getTransportTripWithTransport(tripId) {
  const { data } = await client.get(`/api/transporttrip/${tripId}/transport`);
  return data;
}

export async function getTripsByTransportId(transportId) {
  const { data } = await client.get(`/api/transporttrip/transport/${transportId}`);
  return data;
}

export async function getTripsByRoute(departure, destination) {
  const { data } = await client.get(`/api/transporttrip/route?departure=${departure}&destination=${destination}`);
  return data;
}

export async function getAvailableTrips(departureDate) {
  const { data } = await client.get(`/api/transporttrip/available?departureDate=${departureDate}`);
  return data;
}

export async function createTransportTrip(tripData) {
  const { data } = await client.post('/api/transporttrip', tripData);
  return data;
}

export async function updateTransportTrip(tripId, tripData) {
  const { data } = await client.put(`/api/transporttrip/${tripId}`, tripData);
  return data;
}

export async function deleteTransportTrip(tripId) {
  const { data } = await client.delete(`/api/transporttrip/${tripId}`);
  return data;
}
