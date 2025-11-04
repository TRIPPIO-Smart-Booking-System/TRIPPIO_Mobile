import { client as apiClient } from './client';

// Admin Dashboard API
export const adminApi = {
  // Lấy thống kê tổng quan dashboard
  getDashboardStats: async () => {
    try {
      console.log('Fetching dashboard stats...');
      
      // Tạo mock data tạm thời cho demo
      // TODO: Thay thế bằng API thật khi backend có sẵn
      const mockStats = {
        totalUsers: 1250,
        totalOrders: 342,
        totalRevenue: 125000000, // VND
        totalHotels: 45,
        totalBookings: 189,
      };

      // Thử gọi API thật nếu có
      try {
        // Lấy doanh thu tháng này từ API thật
        const revenueResponse = await apiClient.get('/api/order/revenue', {
          params: {
            from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString(),
            to: new Date().toISOString()
          }
        });
        
        if (revenueResponse.data) {
          mockStats.totalRevenue = revenueResponse.data;
        }
      } catch (revenueError) {
        console.log('Revenue API not available, using mock data');
      }

      // Thử lấy số users từ API admin
      try {
        const usersResponse = await apiClient.get('/api/admin/user/paging', {
          params: { keyword: '', pageIndex: 1, pageSize: 1 }
        });
        
        if (usersResponse.data?.rowCount) {
          mockStats.totalUsers = usersResponse.data.rowCount;
        }
      } catch (usersError) {
        console.log('Users API not available, using mock data');
      }

      console.log('Dashboard stats loaded:', mockStats);
      return mockStats;
      
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Trả về dữ liệu mặc định nếu có lỗi
      return {
        totalUsers: 0,
        totalOrders: 0,
        totalRevenue: 0,
        totalHotels: 0,
        totalBookings: 0,
      };
    }
  },

  // Lấy danh sách users với phân trang
  getUsers: async (page = 1, pageSize = 10, keyword = '') => {
    try {
      const response = await apiClient.get('/api/admin/user/paging', {
        params: { keyword, pageIndex: page, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { results: [], currentPage: 1, rowCount: 0, pageSize: 10 };
    }
  },

  // Lấy danh sách orders với phân trang
  getOrders: async (page = 1, pageSize = 10, status = '') => {
    try {
      const response = await apiClient.get('/api/order', {
        params: { page, pageSize, status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  },

  // Lấy danh sách bookings với phân trang
  getBookings: async (page = 1, pageSize = 10, status = '') => {
    try {
      const response = await apiClient.get('/api/booking', {
        params: { page, pageSize, status }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching bookings:', error);
      return [];
    }
  },

  // Lấy danh sách hotels
  getHotels: async (page = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get('/api/hotel', {
        params: { page, pageSize }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching hotels:', error);
      return [];
    }
  },

  // Lấy doanh thu theo khoảng thời gian
  getRevenue: async (from, to) => {
    try {
      const response = await apiClient.get('/api/order/revenue', {
        params: { from, to }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue:', error);
      throw error;
    }
  },

  // Lấy thống kê thanh toán
  getPaymentStats: async (from, to) => {
    try {
      const response = await apiClient.get('/api/payment/total', {
        params: { from, to }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching payment stats:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái order
  updateOrderStatus: async (orderId, status) => {
    try {
      const response = await apiClient.put(`/api/order/${orderId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  },

  // Cập nhật trạng thái booking
  updateBookingStatus: async (bookingId, status) => {
    try {
      const response = await apiClient.put(`/api/booking/${bookingId}/status`, null, {
        params: { status }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating booking status:', error);
      throw error;
    }
  },

  // Lấy thống kê theo tháng
  getMonthlyStats: async (year = new Date().getFullYear()) => {
    try {
      const months = [];
      for (let month = 0; month < 12; month++) {
        const from = new Date(year, month, 1);
        const to = new Date(year, month + 1, 0);
        
        const [revenueResponse, ordersResponse] = await Promise.allSettled([
          apiClient.get('/api/order/revenue', {
            params: { from: from.toISOString(), to: to.toISOString() }
          }),
          apiClient.get('/api/order/count', {
            params: { from: from.toISOString(), to: to.toISOString() }
          })
        ]);

        months.push({
          month: month + 1,
          revenue: revenueResponse.status === 'fulfilled' ? revenueResponse.value.data : 0,
          orders: ordersResponse.status === 'fulfilled' ? ordersResponse.value.data : 0
        });
      }
      
      return months;
    } catch (error) {
      console.error('Error fetching monthly stats:', error);
      throw error;
    }
  }
};
