/**
 * App Navigator
 * Root navigator that switches between auth and role-based navigation
 */
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '../context';
import { AuthNavigator } from './AuthNavigator';
import { ResidentNavigator } from './ResidentNavigator';
import { SecurityNavigator } from './SecurityNavigator';
import { Loading } from '../components';

export const AppNavigator: React.FC = () => {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading while checking auth state
  if (isLoading) {
    return <Loading message="Loading..." />;
  }

  return (
    <NavigationContainer>
      {!isAuthenticated ? (
        // Not logged in - show auth flow
        <AuthNavigator />
      ) : user?.role === 'security' ? (
        // Security personnel - show security navigation
        <SecurityNavigator />
      ) : (
        // Resident - show resident navigation
        <ResidentNavigator />
      )}
    </NavigationContainer>
  );
};

export default AppNavigator;
