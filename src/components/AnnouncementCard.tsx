/**
 * Announcement Card Component
 * Displays announcement with priority indicator
 */
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing, shadows } from '../theme';
import { Announcement } from '../types';
import { getRelativeTime, truncateText } from '../utils/helpers';

interface AnnouncementCardProps {
  announcement: Announcement;
  onPress?: () => void;
  preview?: boolean; // Show truncated content
}

export const AnnouncementCard: React.FC<AnnouncementCardProps> = ({
  announcement,
  onPress,
  preview = false,
}) => {
  const isUrgent = announcement.priority === 'urgent';

  const content = (
    <View style={[styles.container, isUrgent && styles.urgentContainer]}>
      <View style={styles.header}>
        {isUrgent && (
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentBadgeText}>URGENT</Text>
          </View>
        )}
        <Text style={styles.time}>{getRelativeTime(announcement.createdAt)}</Text>
      </View>
      <Text style={styles.title}>{announcement.title}</Text>
      <Text style={styles.content}>
        {preview ? truncateText(announcement.content, 100) : announcement.content}
      </Text>
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
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
    ...shadows.small,
  },
  urgentContainer: {
    borderLeftColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  urgentBadge: {
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  urgentBadgeText: {
    color: colors.textOnPrimary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    flex: 1,
    textAlign: 'right',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  content: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default AnnouncementCard;
