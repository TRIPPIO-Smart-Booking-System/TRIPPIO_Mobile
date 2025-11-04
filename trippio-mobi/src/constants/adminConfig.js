// Admin Dashboard Configuration
export const ADMIN_CONFIG = {
  // Dashboard sections
  SECTIONS: {
    OVERVIEW: 'overview',
    USERS: 'users',
    BOOKINGS: 'bookings',
    HOTELS: 'hotels',
    TRANSPORT: 'transport',
    SHOWS: 'shows',
    PAYMENTS: 'payments',
    ANALYTICS: 'analytics',
    SETTINGS: 'settings'
  },
  
  // User roles
  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff'
  },
  
  // Booking status
  BOOKING_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    CANCELLED: 'cancelled',
    COMPLETED: 'completed'
  },
  
  // Payment status
  PAYMENT_STATUS: {
    PENDING: 'pending',
    PAID: 'paid',
    FAILED: 'failed',
    REFUNDED: 'refunded'
  },
  
  // Chart colors
  CHART_COLORS: [
    '#2196F3', '#4CAF50', '#FF9800', '#F44336', 
    '#9C27B0', '#00BCD4', '#FFC107', '#795548'
  ],
  
  // Pagination
  ITEMS_PER_PAGE: 10,
  MAX_ITEMS_PER_PAGE: 50,
  
  // Date formats
  DATE_FORMAT: 'DD/MM/YYYY',
  DATETIME_FORMAT: 'DD/MM/YYYY HH:mm',
  
  // Export formats
  EXPORT_FORMATS: {
    PDF: 'pdf',
    EXCEL: 'excel',
    CSV: 'csv'
  }
};

export default ADMIN_CONFIG;
