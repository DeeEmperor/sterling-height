/**
 * Visitor Card Component
 * Displays visitor information with status badge
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing, shadows } from '../theme';
import { Visitor, VisitorStatus } from '../types';
import { formatDate, formatTime } from '../utils/helpers';

interface VisitorCardProps {
  visitor: Visitor;
  onPress?: () => void;
  showResident?: boolean; // For security view
}

export const VisitorCard: React.FC<VisitorCardProps> = ({
  visitor,
  onPress,
  showResident = false,
}) => {
  const getStatusStyle = (status: VisitorStatus) => {
    switch (status) {
      case 'pending':
        return { bg: colors.warningLight, text: '#92400E' };
      case 'entered':
        return { bg: colors.successLight, text: '#065F46' };
      case 'exited':
        return { bg: colors.infoLight, text: '#1E40AF' };
      case 'denied':
        return { bg: colors.errorLight, text: colors.error };
    }
  };

  const statusStyle = getStatusStyle(visitor.status);

  const content = (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>{visitor.name}</Text>
        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.badgeText, { color: statusStyle.text }]}>
            {visitor.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          📅 {formatDate(visitor.visitDate)}
        </Text>
        <Text style={styles.detailText}>
          🕐 {formatTime(visitor.timeWindowStart)} - {formatTime(visitor.timeWindowEnd)}
        </Text>
        {visitor.carPlateNumber && (
          <Text style={styles.detailText}>🚗 {visitor.carPlateNumber}</Text>
        )}
        {showResident && (
          <Text style={styles.detailText}>
            🏠 {visitor.residentName} • {visitor.unitNumber}
          </Text>
        )}
      </View>

      {visitor.status === 'pending' && (
        <View style={styles.codeContainer}>
          <Text style={styles.codeLabel}>Access Code</Text>
          <Text style={styles.code}>{visitor.accessCode}</Text>
        </View>
      )}
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
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  details: {
    gap: spacing.xs,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  codeContainer: {
    marginTop: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
  },
});

export default VisitorCard;
