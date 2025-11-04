import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [isCustomer, setIsCustomer] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      console.log('UserContext - Starting to load user data...');
      const userData = await AsyncStorage.getItem('userData');
      console.log('UserContext - Raw user data from AsyncStorage:', userData);
      
      if (userData) {
        const parsedUser = JSON.parse(userData);
        console.log('UserContext - Parsed user data:', parsedUser);
        console.log('UserContext - User ID:', parsedUser.id);
        console.log('UserContext - User roles:', parsedUser.roles);
        setUser(parsedUser);
        updateUserRoles(parsedUser.roles || []);
        console.log('UserContext - User state updated successfully');
      } else {
        console.log('UserContext - No user data found in AsyncStorage');
        // Fallback: check old AsyncStorage format
        const oldUserId = await AsyncStorage.getItem('userId');
        if (oldUserId) {
          console.log('UserContext - Found old userId format:', oldUserId);
          // Try to reconstruct user data from old format
          const oldUserData = await AsyncStorage.multiGet([
            'userId', 'userName', 'email', 'firstName', 'lastName', 
            'phoneNumber', 'fullName', 'balance', 'isEmailVerified', 
            'isPhoneVerified', 'dateCreated', 'dob', 'avatar'
          ]);
          
          const userInfoMap = {};
          oldUserData.forEach(([key, value]) => {
            userInfoMap[key] = value;
          });
          
          if (userInfoMap.userId) {
            const reconstructedUser = {
              id: userInfoMap.userId,
              userName: userInfoMap.userName,
              email: userInfoMap.email,
              firstName: userInfoMap.firstName,
              lastName: userInfoMap.lastName,
              phoneNumber: userInfoMap.phoneNumber,
              fullName: userInfoMap.fullName || `${userInfoMap.firstName || ''} ${userInfoMap.lastName || ''}`.trim() || userInfoMap.userName || 'User',
              balance: userInfoMap.balance ? parseFloat(userInfoMap.balance) : 0,
              isEmailVerified: userInfoMap.isEmailVerified === 'true',
              isPhoneVerified: userInfoMap.isPhoneVerified === 'true',
              dateCreated: userInfoMap.dateCreated,
              dob: userInfoMap.dob,
              avatar: userInfoMap.avatar || '',
              roles: ['customer'] // Default role
            };
            
            console.log('UserContext - Reconstructed user from old format:', reconstructedUser);
            setUser(reconstructedUser);
            updateUserRoles(['customer']);
          }
        }
      }
    } catch (error) {
      console.error('UserContext - Error loading user data:', error);
    } finally {
      setIsLoading(false);
      console.log('UserContext - Loading completed, isLoading set to false');
    }
  };

  const updateUserRoles = (roles) => {
    const roleList = Array.isArray(roles) ? roles : [];
    setIsAdmin(roleList.includes('admin'));
    setIsStaff(roleList.includes('staff'));
    setIsCustomer(roleList.includes('customer') || roleList.includes('user'));
  };

  const login = async (userData) => {
    try {
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setUser(userData);
      updateUserRoles(userData.roles || []);
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userData');
      setUser(null);
      setIsAdmin(false);
      setIsStaff(false);
      setIsCustomer(false);
    } catch (error) {
      console.error('Error clearing user data:', error);
      throw error;
    }
  };

  const updateUser = async (updatedUserData) => {
    try {
      const newUserData = { ...user, ...updatedUserData };
      await AsyncStorage.setItem('userData', JSON.stringify(newUserData));
      setUser(newUserData);
      updateUserRoles(newUserData.roles || []);
    } catch (error) {
      console.error('Error updating user data:', error);
      throw error;
    }
  };

  const checkAdminAccess = () => {
    return isAdmin && user?.roles?.includes('admin');
  };

  const checkStaffAccess = () => {
    return (isAdmin || isStaff) && (user?.roles?.includes('admin') || user?.roles?.includes('staff'));
  };

  const checkCustomerAccess = () => {
    return isCustomer && user?.roles?.includes('customer');
  };

  const hasRole = (role) => {
    return user?.roles?.includes(role) || false;
  };

  const hasAnyRole = (roles) => {
    return roles.some(role => user?.roles?.includes(role));
  };

  const value = {
    user,
    isAdmin,
    isStaff,
    isCustomer,
    isLoading,
    login,
    logout,
    updateUser,
    checkAdminAccess,
    checkStaffAccess,
    checkCustomerAccess,
    hasRole,
    hasAnyRole,
  };

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
