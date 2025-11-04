// Test file để kiểm tra Dashboard Simple API
import { dashboardSimpleApi } from './dashboard-simple';

export const testDashboardSimpleApi = async () => {
  console.log('=== Testing Dashboard Simple API ===');
  
  try {
    // Test lấy thống kê cơ bản
    console.log('1. Testing getBasicStats...');
    const basicStats = await dashboardSimpleApi.getBasicStats();
    console.log('Basic stats result:', basicStats);
    
    // Test lấy mock data
    console.log('2. Testing getMockStats...');
    const mockStats = dashboardSimpleApi.getMockStats();
    console.log('Mock stats result:', mockStats);
    
    console.log('=== Dashboard Simple API Test Complete ===');
    return { success: true, basicStats, mockStats };
    
  } catch (error) {
    console.error('Dashboard Simple API test failed:', error);
    return { success: false, error: error.message };
  }
};

// Hàm test API client connection
export const testApiConnection = async () => {
  console.log('=== Testing API Connection ===');
  
  try {
    const { client } = await import('./client');
    
    // Test kết nối cơ bản
    console.log('Testing API client connection...');
    
    // Test một API đơn giản
    try {
      const response = await client.get('/api/hotel');
      console.log('✓ Hotel API response status:', response.status);
      console.log('✓ Hotel API data length:', Array.isArray(response.data) ? response.data.length : 'Not an array');
    } catch (error) {
      console.log('✗ Hotel API error:', error.message);
    }
    
    // Test admin user API
    try {
      const response = await client.get('/api/admin/user/paging', {
        params: { keyword: '', pageIndex: 1, pageSize: 1 }
      });
      console.log('✓ Admin User API response status:', response.status);
      console.log('✓ Admin User API data:', response.data);
    } catch (error) {
      console.log('✗ Admin User API error:', error.message);
    }
    
    console.log('=== API Connection Test Complete ===');
    return { success: true };
    
  } catch (error) {
    console.error('API Connection test failed:', error);
    return { success: false, error: error.message };
  }
};

