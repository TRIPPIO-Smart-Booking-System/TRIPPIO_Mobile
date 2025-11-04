import { StyleSheet, Dimensions } from 'react-native';
import Colors from '../../constants/colors';

const { width, height } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
    opacity: 0.95,
  },
  content: {
    alignItems: 'center',
    zIndex: 2,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoIcon: {
    fontSize: 96,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.textWhite,
    letterSpacing: 3,
  },
  taglineContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  tagline: {
    fontSize: 26,
    fontWeight: '700',
    color: Colors.textWhite,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subTagline: {
    fontSize: 17,
    color: 'rgba(255,255,255,0.85)',
    textAlign: 'center',
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.textWhite,
  },
  loadingText: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  decorativeElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  circle1: {
    width: 240,
    height: 240,
    top: -120,
    right: -120,
  },
  circle2: {
    width: 180,
    height: 180,
    bottom: -90,
    left: -90,
  },
  circle3: {
    width: 120,
    height: 120,
    top: height * 0.3,
    left: -60,
  },
  circle4: {
    width: 80,
    height: 80,
    top: height * 0.6,
    right: -40,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
});

