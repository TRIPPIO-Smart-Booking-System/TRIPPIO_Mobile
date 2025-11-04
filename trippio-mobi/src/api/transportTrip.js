import { client } from './client';

// Get all transport trips
export async function getAllTransportTrips() {
  const { data } = await client.get('/api/TransportTrip');
  return data;
}

// Get transport trip by ID
export async function getTransportTripById(tripId) {
  const { data } = await client.get(`/api/TransportTrip/${tripId}`);
  return data;
}

// Get transport trip with transport info
export async function getTransportTripWithTransport(tripId) {
  const { data } = await client.get(`/api/TransportTrip/${tripId}/transport`);
  return data;
}

// Get trips by transport ID
export async function getTripsByTransportId(transportId) {
  const { data } = await client.get(`/api/TransportTrip/transport/${transportId}`);
  return data;
}

// Get trips by route (departure and destination)
export async function getTripsByRoute(departure, destination) {
  const params = new URLSearchParams();
  if (departure) params.append('departure', departure);
  if (destination) params.append('destination', destination);
  const { data } = await client.get(`/api/TransportTrip/route?${params.toString()}`);
  return data;
}

// Get available trips by departure date
export async function getAvailableTrips(departureDate) {
  const { data } = await client.get(`/api/TransportTrip/available?departureDate=${departureDate}`);
  return data;
}

// Create transport trip
export async function createTransportTrip({
  transportId,
  departure,
  destination,
  departureTime,
  arrivalTime,
  price,
  availableSeats
}) {
  const { data } = await client.post('/api/TransportTrip', {
    transportId,
    departure,
    destination,
    departureTime,
    arrivalTime,
    price,
    availableSeats: availableSeats || 0
  });
  return data;
}

// Update transport trip
export async function updateTransportTrip(tripId, tripData) {
  const { data } = await client.put(`/api/TransportTrip/${tripId}`, tripData);
  return data;
}

// Delete transport trip
export async function deleteTransportTrip(tripId) {
  const { data } = await client.delete(`/api/TransportTrip/${tripId}`);
  return data;
}
