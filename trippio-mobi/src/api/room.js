import { client } from './client';

// Get all rooms
export const getRooms = async () => {
  const response = await client.get('/api/room');
  return response.data;
};

// Get room by ID
export const getRoomById = async (roomId) => {
  const response = await client.get(`/api/room/${roomId}`);
  return response.data;
};

// Get room with hotel information
export const getRoomWithHotel = async (roomId) => {
  const response = await client.get(`/api/room/${roomId}/hotel`);
  return response.data;
};

// Get rooms by hotel ID
export const getRoomsByHotel = async (hotelId) => {
  const response = await client.get(`/api/room/hotel/${hotelId}`);
  return response.data;
};

// Get available rooms for a hotel
export const getAvailableRooms = async (hotelId) => {
  const response = await client.get(`/api/room/hotel/${hotelId}/available`);
  return response.data;
};