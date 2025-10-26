import { client } from './client';

export async function login(usernameOrPhone, password) {
  const { data } = await client.post('/api/admin/auth/login', { usernameOrPhone, password });
  return data;
}

export async function forgotPassword(email) {
  const { data } = await client.post('/api/admin/auth/forgot-password', { email });
  return data;
}

export async function resetPassword(email, otp, newPassword) {
  const { data } = await client.post('/api/admin/auth/reset-password', { email, otp, newPassword });
  return data;
}

export async function verifyEmail(email, otp) {
  const { data } = await client.post('/api/admin/auth/verify-email', { email, otp });
  return data;
}

export async function register(registerData) {
  const { data } = await client.post('/api/admin/auth/register', registerData);
  return data;
}

export async function getUserProfile(userId) {
  const { data } = await client.get(`/api/admin/auth/user/${userId}`);
  return data;
}

export async function updateUserProfile(userId, profileData) {
  const { data } = await client.put(`/api/admin/auth/user/${userId}`, profileData);
  return data;
}