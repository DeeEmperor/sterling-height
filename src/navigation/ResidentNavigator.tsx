/**
 * Resident Navigator
 * Bottom tab navigation for resident users
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Text, StyleSheet } from 'react-native';
import {
  HomeScreen,
  VisitorHistoryScreen,
  CreateVisitorScreen,
  MyUnitScreen,
  AnnouncementsScreen,
  ProfileScreen,
} from '../screens/resident';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Visitors stack with create visitor screen
const VisitorsStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="VisitorsList" component={VisitorHistoryScreen} />
      <Stack.Screen name="CreateVisitor" component={CreateVisitorScreen} />
    </Stack.Navigator>
  );
};

// Home stack with create visitor access
const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CreateVisitor" component={CreateVisitorScreen} />
    </Stack.Navigator>
  );
};

export const ResidentNavigator: React.FC = () => {
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
            case 'Visitors':
              icon = '👥';
              break;
            case 'MyUnit':
              icon = '🏢';
              break;
            case 'Announcements':
              icon = '📢';
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
        component={HomeStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen 
        name="Visitors" 
        component={VisitorsStack}
        options={{ tabBarLabel: 'Visitors' }}
      />
      <Tab.Screen 
        name="MyUnit" 
        component={MyUnitScreen}
        options={{ tabBarLabel: 'My Unit' }}
      />
      <Tab.Screen 
        name="Announcements" 
        component={AnnouncementsScreen}
        options={{ tabBarLabel: 'News' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
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

export default ResidentNavigator;
