import { client } from './client';

// Create room booking
export async function createRoomBooking({ userId, roomId, checkInDate, checkOutDate, guestCount }) {
  console.log('[Booking API] Creating room booking:', {
    userId,
    roomId,
    checkInDate,
    checkOutDate,
    guestCount
  });
  
  const response = await client.post('/api/Booking/room', {
    userId,
    roomId,
    checkInDate,
    checkOutDate,
    guestCount: guestCount || 1
  });
  
  console.log('[Booking API] Response status:', response.status);
  console.log('[Booking API] Response data:', response.data);
  console.log('[Booking API] Response structure:', {
    code: response.data?.code,
    message: response.data?.message,
    hasData: !!response.data?.data,
    bookingId: response.data?.data?.id
  });
  
  // Return the full response object, not just data
  return response;
}

// Create transport booking
export async function createTransportBooking({ userId, tripId, seatNumber, seatClass }) {
  console.log('[Booking API] Creating transport booking:', {
    userId,
    tripId,
    seatNumber,
    seatClass
  });
  
  const response = await client.post('/api/Booking/transport', {
    userId,
    tripId,
    seatNumber,
    seatClass: seatClass || null
  });
  
  console.log('[Booking API] Transport booking response:', {
    status: response.status,
    code: response.data?.code,
    message: response.data?.message,
    bookingId: response.data?.data?.id
  });
  
  // Return the full response object
  return response;
}

// Create show booking
export async function createShowBooking({ userId, showId, seatNumber, showDate, seatClass }) {
  console.log('[Booking API] Creating show booking:', {
    userId,
    showId,
    seatNumber,
    showDate,
    seatClass
  });
  
  const response = await client.post('/api/Booking/show', {
    userId,
    showId,
    seatNumber,
    showDate: showDate || null,
    seatClass: seatClass || null
  });
  
  console.log('[Booking API] Show booking response:', {
    status: response.status,
    code: response.data?.code,
    message: response.data?.message,
    bookingId: response.data?.data?.id
  });
  
  // Return the full response object
  return response;
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
