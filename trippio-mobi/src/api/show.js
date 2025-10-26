import { client } from './client';

export async function getAllShows() {
  const { data } = await client.get('/api/show');
  return data;
}

export async function getShowById(showId) {
  const { data } = await client.get(`/api/show/${showId}`);
  return data;
}

export async function getShowsByCity(city) {
  const { data } = await client.get(`/api/show/city/${city}`);
  return data;
}

export async function getUpcomingShows() {
  const { data } = await client.get('/api/show/upcoming');
  return data;
}

export async function getShowsByDateRange(startDate, endDate) {
  const { data } = await client.get(`/api/show/daterange?startDate=${startDate}&endDate=${endDate}`);
  return data;
}

export async function createShow(showData) {
  const { data } = await client.post('/api/show', showData);
  return data;
}

export async function updateShow(showId, showData) {
  const { data } = await client.put(`/api/show/${showId}`, showData);
  return data;
}

export async function deleteShow(showId) {
  const { data } = await client.delete(`/api/show/${showId}`);
  return data;
}
