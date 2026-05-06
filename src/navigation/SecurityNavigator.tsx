/**
 * Security Navigator
 * Bottom tab navigation for security personnel
 */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  SecurityHomeScreen,
  VerifyVisitorScreen,
  VisitorLogsScreen,
  SecurityProfileScreen,
} from '../screens/security';
import { colors } from '../theme/colors';

const Tab = createBottomTabNavigator();

// Icon mapping for each tab
const TAB_ICONS: Record<string, { focused: keyof typeof Ionicons.glyphMap; unfocused: keyof typeof Ionicons.glyphMap }> = {
  Home: { focused: 'shield-checkmark', unfocused: 'shield-checkmark-outline' },
  Verify: { focused: 'search', unfocused: 'search-outline' },
  Logs: { focused: 'clipboard', unfocused: 'clipboard-outline' },
  Profile: { focused: 'person-circle', unfocused: 'person-circle-outline' },
};

export const SecurityNavigator: React.FC = () => {
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
});

export default SecurityNavigator;
