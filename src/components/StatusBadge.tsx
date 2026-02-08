/**
 * StatusBadge Component
 * Displays status with appropriate color
 */
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme';
import { DueStatus } from '../types';

interface StatusBadgeProps {
  status: DueStatus | string;
  size?: 'small' | 'medium';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  size = 'small',
}) => {
  const getStatusStyle = () => {
    switch (status.toLowerCase()) {
      case 'paid':
        return { bg: colors.successLight, text: '#065F46' };
      case 'due':
        return { bg: colors.warningLight, text: '#92400E' };
      case 'overdue':
        return { bg: colors.errorLight, text: colors.error };
      case 'pending':
        return { bg: colors.warningLight, text: '#92400E' };
      case 'entered':
        return { bg: colors.successLight, text: '#065F46' };
      case 'exited':
        return { bg: colors.infoLight, text: '#1E40AF' };
      case 'denied':
        return { bg: colors.errorLight, text: colors.error };
      default:
        return { bg: colors.surfaceLight, text: colors.textSecondary };
    }
  };

  const statusStyle = getStatusStyle();

  return (
    <View
      style={[
        styles.badge,
        size === 'medium' && styles.mediumBadge,
        { backgroundColor: statusStyle.bg },
      ]}
    >
      <Text
        style={[
          styles.text,
          size === 'medium' && styles.mediumText,
          { color: statusStyle.text },
        ]}
      >
        {status.toUpperCase()}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  mediumBadge: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mediumText: {
    fontSize: 12,
  },
});

export default StatusBadge;
