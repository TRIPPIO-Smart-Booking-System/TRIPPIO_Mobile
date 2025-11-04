import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useUser } from '../contexts/UserContext';

const UserDebugInfo = () => {
  const { user, isAdmin, isStaff, isCustomer, isLoading } = useUser();

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>User Debug Info:</Text>
      <Text style={styles.text}>User: {user ? 'Logged in' : 'Not logged in'}</Text>
      {user && (
        <>
          <Text style={styles.text}>Name: {user.fullName || user.firstName || 'N/A'}</Text>
          <Text style={styles.text}>Email: {user.email || 'N/A'}</Text>
          <Text style={styles.text}>Roles: {JSON.stringify(user.roles || [])}</Text>
          <Text style={styles.text}>Is Admin: {isAdmin ? 'Yes' : 'No'}</Text>
          <Text style={styles.text}>Is Staff: {isStaff ? 'Yes' : 'No'}</Text>
          <Text style={styles.text}>Is Customer: {isCustomer ? 'Yes' : 'No'}</Text>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    margin: 10,
    borderRadius: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  text: {
    fontSize: 12,
    marginBottom: 2,
  },
});

export default UserDebugInfo;
