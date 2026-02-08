/**
 * Security Navigator
 * Bottom tab navigation for security personnel
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, StyleSheet } from 'react-native';
import {
  SecurityHomeScreen,
  VerifyVisitorScreen,
  VisitorLogsScreen,
  SecurityProfileScreen,
} from '../screens/security';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

export const SecurityNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => {
          let icon = '';
          
          switch (route.name) {
            case 'Home':
              icon = '🏠';
              break;
            case 'Verify':
              icon = '🔍';
              break;
            case 'Logs':
              icon = '📋';
              break;
            case 'Profile':
              icon = '👤';
              break;
          }
          
          return (
            <Text style={[styles.tabIcon, focused && styles.tabIconFocused]}>
              {icon}
            </Text>
          );
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabLabel,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={SecurityHomeScreen}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Verify" 
        component={VerifyVisitorScreen}
        options={{ tabBarLabel: 'Verify' }}
      />
      <Tab.Screen 
        name="Logs" 
        component={VisitorLogsScreen}
        options={{ tabBarLabel: 'Logs' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={SecurityProfileScreen}
        options={{ tabBarLabel: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.background,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 8,
    paddingBottom: 8,
    height: 65,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  tabIcon: {
    fontSize: 24,
  },
  tabIconFocused: {
    transform: [{ scale: 1.1 }],
  },
});

export default SecurityNavigator;
