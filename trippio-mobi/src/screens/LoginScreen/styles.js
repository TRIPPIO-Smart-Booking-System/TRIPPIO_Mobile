import { StyleSheet } from 'react-native';
import Colors from '../../constants/colors';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 100,
    paddingBottom: 48,
  },
  logo: {
    fontSize: 56,
    fontWeight: '800',
    color: Colors.primary,
    marginBottom: 20,
    letterSpacing: -1,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: Colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 10,
    letterSpacing: -0.2,
  },
  input: {
    backgroundColor: Colors.inputBackground,
    borderRadius: 16,
    paddingHorizontal: 20,
    paddingVertical: 16,
    fontSize: 16,
    borderWidth: 1.5,
    borderColor: Colors.inputBorder,
    color: Colors.inputText,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  inputFocused: {
    borderColor: Colors.inputBorderFocused,
    backgroundColor: Colors.inputBackgroundFocused,
  },
  loginButton: {
    backgroundColor: Colors.buttonPrimary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 12,
    shadowColor: Colors.buttonPrimary,
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonPressed: {
    backgroundColor: Colors.buttonPrimaryPressed,
  },
  loginButtonText: {
    color: Colors.buttonText,
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  forgotButton: {
    alignItems: 'center',
    marginTop: 20,
    paddingVertical: 8,
  },
  forgotButtonText: {
    color: Colors.primary,
    fontSize: 15,
    fontWeight: '600',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1.5,
    backgroundColor: Colors.border,
  },
  dividerText: {
    marginHorizontal: 16,
    color: Colors.textTertiary,
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: Colors.buttonSecondary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    color: Colors.primary,
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginTop: 8,
    marginLeft: 4,
    fontWeight: '500',
  },
});

