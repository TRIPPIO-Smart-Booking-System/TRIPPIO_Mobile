import { client } from './client';

// Create a new booking
export async function createBooking(bookingData) {
  const { data } = await client.post('/api/Booking', bookingData);
  return data;
}

// Get booking by ID
export async function getBookingById(bookingId) {
  const { data } = await client.get(`/api/Booking/${bookingId}`);
  return data;
}

// Get bookings by user ID
export async function getBookingsByUser(userId) {
  const { data } = await client.get(`/api/Booking/user/${userId}`);
  return data;
}

// Get bookings by status
export async function getBookingsByStatus(status) {
  const { data } = await client.get(`/api/Booking/status/${status}`);
  return data;
}

// Get upcoming bookings for user
export async function getUpcomingBookings(userId) {
  const { data } = await client.get(`/api/Booking/upcoming/${userId}`);
  return data;
}

// Update booking status
export async function updateBookingStatus(bookingId, status) {
  const { data } = await client.put(`/api/Booking/${bookingId}/status?status=${status}`);
  return data;
}

// Cancel booking
export async function cancelBooking(bookingId, userId) {
  const { data } = await client.put(`/api/Booking/${bookingId}/cancel?userId=${userId}`);
  return data;
}

// Get total booking value
export async function getTotalBookingValue(from, to) {
  const { data } = await client.get(`/api/Booking/total?from=${from}&to=${to}`);
  return data;
}