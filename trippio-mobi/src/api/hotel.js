import { client } from './client';

// Get all hotels
export const getHotels = async () => {
  const response = await client.get('/api/hotel');
  return response.data;
};

// Get hotel by ID
export const getHotel = async (hotelId) => {
  const response = await client.get(`/api/hotel/${hotelId}`);
  return response.data;
};

// Get hotel with rooms
export const getHotelRooms = async (hotelId) => {
  const response = await client.get(`/api/hotel/${hotelId}/rooms`);
  return response.data;
};

// Get hotels by city
export const getHotelsByCity = async (city) => {
  const response = await client.get(`/api/hotel/city/${city}`);
  return response.data;
};

// Get hotels by star rating
export const getHotelsByStars = async (stars) => {
  const response = await client.get(`/api/hotel/stars/${stars}`);
  return response.data;
};