// Test file để kiểm tra Dashboard API
import { dashboardApi } from './dashboard';

export const testDashboardApi = async () => {
  console.log('=== Testing Dashboard API ===');
  
  try {
    // Test lấy thống kê cơ bản
    console.log('1. Testing getBasicStats...');
    const basicStats = await dashboardApi.getBasicStats();
    console.log('Basic stats result:', basicStats);
    
    // Test lấy mock data
    console.log('2. Testing getMockStats...');
    const mockStats = dashboardApi.getMockStats();
    console.log('Mock stats result:', mockStats);
    
    console.log('=== Dashboard API Test Complete ===');
    return { success: true, basicStats, mockStats };
    
  } catch (error) {
    console.error('Dashboard API test failed:', error);
    return { success: false, error: error.message };
  }
};

// Hàm test API client
export const testApiClient = async () => {
  console.log('=== Testing API Client ===');
  
  try {
    const { client } = await import('./client');
    
    // Test kết nối cơ bản
    console.log('Testing API client connection...');
    
    // Test một API đơn giản
    try {
      const response = await client.get('/api/hotel');
      console.log('Hotel API response:', response.status);
    } catch (error) {
      console.log('Hotel API error:', error.message);
    }
    
    console.log('=== API Client Test Complete ===');
    return { success: true };
    
  } catch (error) {
    console.error('API Client test failed:', error);
    return { success: false, error: error.message };
  }
};
