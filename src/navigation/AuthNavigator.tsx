/**
 * Auth Navigator
 * Stack navigation for authentication flow (Login -> OTP)
 */
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen, OtpScreen } from '../screens/auth';
import { AuthStackParamList } from '../types';
import { colors } from '../theme/colors';

const Stack = createStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: colors.background },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Otp" component={OtpScreen} />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
