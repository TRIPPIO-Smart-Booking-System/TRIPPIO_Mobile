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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 40,
  },
  errorText: {
    fontSize: 18,
    color: Colors.error,
    fontWeight: '600',
    textAlign: 'center',
  },
  header: {
    backgroundColor: Colors.surface,
    padding: 24,
    paddingTop: 60,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
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
    fontSize: 14,
    fontWeight: '700',
  },
  section: {
    backgroundColor: Colors.surface,
    margin: 16,
    marginTop: 20,
    padding: 20,
    borderRadius: 20,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 16,
    letterSpacing: -0.3,
  },
  info: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 12,
    lineHeight: 24,
    fontWeight: '500',
  },
  bookingItem: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingVertical: 16,
    marginBottom: 12,
  },
  itemName: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  itemDetails: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 8,
    fontWeight: '500',
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.accent,
    marginTop: 8,
    letterSpacing: -0.3,
  },
  cancelButton: {
    backgroundColor: Colors.error,
    margin: 20,
    marginTop: 30,
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: Colors.error,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  cancelButtonText: {
    color: Colors.textWhite,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
});

