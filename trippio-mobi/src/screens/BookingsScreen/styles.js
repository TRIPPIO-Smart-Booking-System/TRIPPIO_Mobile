import { StyleSheet } from 'react-native';
import Colors from '../../constants/colors';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return Colors.warning;
    case 'confirmed': return Colors.success;
    case 'cancelled': return Colors.error;
    case 'completed': return Colors.info;
    case 'checked-in': return Colors.secondary;
    default: return Colors.textTertiary;
  }
};

export { getStatusColor };

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 18,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: Colors.primary,
    fontWeight: '700',
  },
  bookingItem: {
    backgroundColor: Colors.surface,
    margin: 16,
    padding: 20,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  bookingId: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  statusText: {
    color: Colors.textWhite,
    fontSize: 12,
    fontWeight: '700',
  },
  bookingDate: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  checkInDate: {
    fontSize: 15,
    color: Colors.success,
    marginBottom: 8,
    fontWeight: '600',
  },
  checkOutDate: {
    fontSize: 15,
    color: Colors.warning,
    marginBottom: 8,
    fontWeight: '600',
  },
  bookingTotal: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.accent,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  cancelButton: {
    backgroundColor: Colors.error,
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButtonText: {
    color: Colors.textWhite,
    fontWeight: '700',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '500',
    textAlign: 'center',
  },
});

