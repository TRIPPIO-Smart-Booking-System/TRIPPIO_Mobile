import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { UserProvider } from './src/contexts/UserContext';

// Auth Screens
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import VerifyEmailScreen from './src/screens/VerifyEmailScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';

// Main Screens
import HomeScreen from './src/screens/HomeScreen';
import HotelsScreen from './src/screens/HotelsScreen';
import HotelDetailScreen from './src/screens/HotelDetailScreen';
import ShowScreen from './src/screens/ShowScreen';
import ShowDetailScreen from './src/screens/ShowDetailScreen';
import TransportScreen from './src/screens/TransportScreen';
import TransportDetailScreen from './src/screens/TransportDetailScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import UserProfileDetailScreen from './src/screens/UserProfileDetailScreen';

// Order & Payment Screens
import BasketScreen from './src/screens/BasketScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import PaymentSuccessScreen from './src/screens/PaymentSuccessScreen';
import PaymentCancelScreen from './src/screens/PaymentCancelScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import PaymentScreen from './src/screens/PaymentScreen';
import PaymentHistoryScreen from './src/screens/PaymentHistoryScreen';
import BookingsScreen from './src/screens/BookingsScreen';
import BookingDetailScreen from './src/screens/BookingDetailScreen';

// AI & Admin Screens
import AIChatScreen from './src/screens/AIChatScreen';
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Main Tab Navigator
function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Hotels') {
            iconName = focused ? 'bed' : 'bed-outline';
          } else if (route.name === 'Shows') {
            iconName = focused ? 'musical-notes' : 'musical-notes-outline';
          } else if (route.name === 'Transports') {
            iconName = focused ? 'car' : 'car-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#2563EB',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E2E8F0',
          paddingBottom: 8,
          paddingTop: 8,
          height: 65,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ tabBarLabel: 'Trang chủ' }}
      />
      <Tab.Screen 
        name="Hotels" 
        component={HotelsScreen}
        options={{ tabBarLabel: 'Khách sạn' }}
      />
      <Tab.Screen 
        name="Shows" 
        component={ShowScreen}
        options={{ tabBarLabel: 'Shows' }}
      />
      <Tab.Screen 
        name="Transports" 
        component={TransportScreen}
        options={{ tabBarLabel: 'Phương tiện' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ tabBarLabel: 'Cá nhân' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <UserProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        <Stack.Navigator initialRouteName="Splash">
        {/* Splash Screen */}
        <Stack.Screen 
          name="Splash" 
          component={SplashScreen} 
          options={{ headerShown: false }}
        />
        
        {/* Auth Stack */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Register" 
          component={RegisterScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="VerifyEmail" 
          component={VerifyEmailScreen}
          options={{ title: 'Xác thực email' }}
        />
        <Stack.Screen 
          name="ForgotPassword" 
          component={ForgotPasswordScreen}
          options={{ title: 'Quên mật khẩu' }}
        />
        <Stack.Screen 
          name="ResetPassword" 
          component={ResetPasswordScreen}
          options={{ title: 'Đặt lại mật khẩu' }}
        />

        {/* Main App */}
        <Stack.Screen 
          name="MainTabs" 
          component={MainTabs}
          options={{ headerShown: false }}
        />

        {/* Detail Screens */}
        <Stack.Screen 
          name="HotelDetail" 
          component={HotelDetailScreen}
          options={{ title: 'Chi tiết khách sạn' }}
        />
        <Stack.Screen 
          name="ShowDetail" 
          component={ShowDetailScreen}
          options={{ title: 'Chi tiết show' }}
        />
        <Stack.Screen 
          name="TransportDetail" 
          component={TransportDetailScreen}
          options={{ title: 'Chi tiết phương tiện' }}
        />

        {/* Order & Payment Screens */}
        <Stack.Screen 
          name="Basket" 
          component={BasketScreen}
          options={{ title: 'Giỏ hàng' }}
        />
        <Stack.Screen 
          name="Checkout" 
          component={CheckoutScreen}
          options={{ title: 'Thanh toán' }}
        />
        <Stack.Screen 
          name="Payment" 
          component={PaymentScreen}
          options={{ title: 'Thanh toán' }}
        />
        <Stack.Screen 
          name="PaymentSuccess" 
          component={PaymentSuccessScreen}
          options={{ title: 'Thanh toán thành công' }}
        />
        <Stack.Screen 
          name="PaymentCancel" 
          component={PaymentCancelScreen}
          options={{ title: 'Thanh toán thất bại' }}
        />
        <Stack.Screen 
          name="Orders" 
          component={OrdersScreen}
          options={{ 
            title: 'Đơn hàng',
            headerShown: false, // We have custom header
            gestureEnabled: true, // Enable swipe back
          }}
        />
        <Stack.Screen 
          name="OrderDetail" 
          component={OrderDetailScreen}
          options={{ title: 'Chi tiết đơn hàng' }}
        />
        <Stack.Screen 
          name="Payments" 
          component={PaymentHistoryScreen}
          options={{ title: 'Lịch sử thanh toán' }}
        />
        <Stack.Screen 
          name="UserProfileDetail" 
          component={UserProfileDetailScreen}
          options={{ title: 'Thông tin cá nhân' }}
        />
        <Stack.Screen 
          name="Bookings" 
          component={BookingsScreen}
          options={{ title: 'Bookings' }}
        />
        <Stack.Screen 
          name="BookingDetail" 
          component={BookingDetailScreen}
          options={{ title: 'Chi tiết booking' }}
        />

        {/* AI & Admin Screens */}
        <Stack.Screen 
          name="AIChat" 
          component={AIChatScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AdminDashboard" 
          component={AdminDashboardScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});