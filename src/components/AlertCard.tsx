/**
 * Alert Card Component
 * Displays important notifications like rent expiry, dues, etc.
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing } from '../theme';

type AlertType = 'warning' | 'error' | 'info' | 'success';

interface AlertCardProps {
  type: AlertType;
  title: string;
  message: string;
  onPress?: () => void;
}

export const AlertCard: React.FC<AlertCardProps> = ({
  type,
  title,
  message,
  onPress,
}) => {
  const getColors = () => {
    switch (type) {
      case 'error':
        return { bg: colors.errorLight, border: colors.error, text: colors.error };
      case 'warning':
        return { bg: colors.warningLight, border: colors.warning, text: '#92400E' };
      case 'info':
        return { bg: colors.infoLight, border: colors.info, text: '#1E40AF' };
      case 'success':
        return { bg: colors.successLight, border: colors.success, text: '#065F46' };
    }
  };

  const colorScheme = getColors();

  const content = (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme.bg, borderLeftColor: colorScheme.border },
      ]}
    >
      <Text style={[styles.title, { color: colorScheme.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colorScheme.text }]}>{message}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: 13,
    lineHeight: 18,
  },
});

export default AlertCard;
