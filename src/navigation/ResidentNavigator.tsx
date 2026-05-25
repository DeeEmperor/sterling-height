/**
 * Resident Navigator
 * Bottom tab navigation for resident users
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  HomeScreen,
  VisitorHistoryScreen,
  CreateVisitorScreen,
  CreateEventPassScreen,
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
      <Stack.Screen name="CreateEventPass" component={CreateEventPassScreen} />
    </Stack.Navigator>
  );
};

// Home stack with create visitor access
const HomeStack: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} />
      <Stack.Screen name="CreateVisitor" component={CreateVisitorScreen} />
      <Stack.Screen name="CreateEventPass" component={CreateEventPassScreen} />
    </Stack.Navigator>
  );
};

// Icon mapping for each tab
const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Home: { focused: 'home', unfocused: 'home-outline' },
  Visitors: { focused: 'people', unfocused: 'people-outline' },
  MyUnit: { focused: 'business', unfocused: 'business-outline' },
  Announcements: { focused: 'megaphone', unfocused: 'megaphone-outline' },
  Profile: { focused: 'person-circle', unfocused: 'person-circle-outline' },
};

export const ResidentNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          const icons = TAB_ICONS[route.name];
          const iconName = focused ? icons.focused : icons.unfocused;
          return <Ionicons name={iconName} size={size ?? 24} color={color} />;
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
});

export default ResidentNavigator;
