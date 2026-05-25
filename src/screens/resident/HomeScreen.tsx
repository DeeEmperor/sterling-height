/**
 * Resident Home Screen
 * Displays greeting, alerts, primary actions, stats, and shortcuts
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AnnouncementCard, VisitorCard, Loading } from '../../components';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme';
import { useAuth } from '../../context';
import { visitorService, announcementService, unitService, eventPassService } from '../../services';
import { getGreeting, formatDate } from '../../utils/helpers';
import { Unit, Visitor, Announcement, EstateDue } from '../../types';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [upcomingVisitor, setUpcomingVisitor] = useState<Visitor | null>(null);
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
  const [overdueDues, setOverdueDues] = useState<EstateDue[]>([]);
  const [visitorCount, setVisitorCount] = useState(0);
  const [eventPassCount, setEventPassCount] = useState(0);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // Load unit data
      const unitData = await unitService.getUnitForResident(user.id);
      setUnit(unitData);

      if (unitData) {
        // Load overdue dues
        const dues = await unitService.getEstateDues(unitData.id);
        const overdue = dues.filter(d => d.status === 'overdue');
        setOverdueDues(overdue);
      }

      // Load counts for stats
      const visitors = await visitorService.getVisitorsForResident(user.id);
      setVisitorCount(visitors.length);
      
      const eventPasses = await eventPassService.getEventPassesForResident();
      setEventPassCount(eventPasses.length);

      // Load upcoming visitor
      const visitor = await visitorService.getUpcomingVisitor(user.id);
      setUpcomingVisitor(visitor);

      // Load latest announcement
      const announcement = await announcementService.getLatest();
      setLatestAnnouncement(announcement);
    } catch (error) {
      console.error('Error loading home data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading message="Loading..." />;
  }

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
      >
        {/* 1. Header Banner */}
        <View style={[styles.headerBanner, { paddingTop: insets.top + spacing.lg }]}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.name}>{user?.name?.split(' ')[0]} 👋</Text>
            </View>
            {unit && (
              <View style={styles.unitBadge}>
                <Text style={styles.unitBadgeText}>Unit {unit.unitNumber}</Text>
              </View>
            )}
          </View>
          <Text style={styles.dateText}>{formatDate(new Date().toISOString())}</Text>
        </View>

        {/* 2. Primary Action Row */}
        <View style={styles.primaryActionRow}>
          <TouchableOpacity 
            style={[styles.primaryActionBtn, styles.actionAddVisitor]} 
            onPress={() => navigation.navigate('CreateVisitor')} 
            activeOpacity={0.8}
          >
            <Ionicons name="person-add" size={24} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Add Visitor</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.primaryActionBtn, styles.actionEventPass]} 
            onPress={() => navigation.navigate('CreateEventPass')} 
            activeOpacity={0.8}
          >
            <Ionicons name="calendar" size={24} color="#FFFFFF" />
            <Text style={styles.primaryActionText}>Event Pass</Text>
          </TouchableOpacity>
        </View>

        {/* 4. At-a-Glance Stats */}
        <View style={styles.statsRow}>
          <TouchableOpacity style={styles.statChip} onPress={() => navigation.navigate('Visitors')} activeOpacity={0.7}>
            <Text style={styles.statValue}>{visitorCount}</Text>
            <Text style={styles.statLabel}>Visits</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statChip} onPress={() => navigation.navigate('Visitors')} activeOpacity={0.7}>
            <Text style={styles.statValue}>{eventPassCount}</Text>
            <Text style={styles.statLabel}>Events</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.statChip} onPress={() => navigation.navigate('MyUnit')} activeOpacity={0.7}>
            <Text style={[styles.statValue, overdueDues.length > 0 && { color: colors.error }]}>{overdueDues.length}</Text>
            <Text style={[styles.statLabel, overdueDues.length > 0 && { color: colors.error }]}>Dues</Text>
          </TouchableOpacity>
        </View>

        {/* 5. Upcoming Visitor */}
        {upcomingVisitor && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming Visitor</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Visitors')} activeOpacity={0.7} style={styles.seeAllBtn}>
                <Text style={styles.seeAllText}>See All</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <VisitorCard visitor={upcomingVisitor} onPress={() => navigation.navigate('Visitors')} />
          </View>
        )}

        {/* 6. Latest Announcement */}
        {latestAnnouncement && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Latest News</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Announcements')} activeOpacity={0.7} style={styles.seeAllBtn}>
                <Text style={styles.seeAllText}>View All</Text>
                <Ionicons name="arrow-forward" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <AnnouncementCard announcement={latestAnnouncement} preview onPress={() => navigation.navigate('Announcements')} />
          </View>
        )}

        {/* 7. Shortcuts */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Shortcuts</Text>
          <View style={styles.shortcutsCard}>
            <ShortcutRow 
              icon="people" 
              label="My Visitors" 
              description="Manage single visits & event passes" 
              onPress={() => navigation.navigate('Visitors')} 
            />
            <View style={styles.divider} />
            <ShortcutRow 
              icon="home" 
              label="My Unit" 
              description="View rent details and estate dues" 
              onPress={() => navigation.navigate('MyUnit')} 
            />
            <View style={styles.divider} />
            <ShortcutRow 
              icon="megaphone" 
              label="Announcements" 
              description="Read estate news and updates" 
              onPress={() => navigation.navigate('Announcements')} 
            />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

// Sub-component for Shortcuts
const ShortcutRow: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  onPress: () => void;
}> = ({ icon, label, description, onPress }) => (
  <TouchableOpacity style={styles.shortcutRow} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.shortcutIconContainer}>
      <Ionicons name={icon} size={22} color={colors.primary} />
    </View>
    <View style={styles.shortcutTextContainer}>
      <Text style={styles.shortcutLabel}>{label}</Text>
      <Text style={styles.shortcutDescription}>{description}</Text>
    </View>
    <Ionicons name="chevron-forward" size={20} color={colors.textLight} />
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  // Header Banner
  headerBanner: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: borderRadius.xl,
    borderBottomRightRadius: borderRadius.xl,
    ...shadows.medium,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 2,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  unitBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.sm,
  },
  unitBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  dateText: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: spacing.sm,
    fontWeight: '500',
  },
  // Alert Strip
  alertStripContainer: {
    marginTop: -spacing.md,
    marginBottom: spacing.md,
  },
  alertStripScroll: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  alertMiniCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    ...shadows.small,
  },
  alertMiniWarning: {
    backgroundColor: colors.warningLight,
    borderColor: colors.warning,
  },
  alertMiniError: {
    backgroundColor: colors.errorLight,
    borderColor: colors.error,
  },
  alertMiniText: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: spacing.xs,
  },
  alertMiniTextWarning: {
    color: '#92400E',
  },
  alertMiniTextError: {
    color: colors.error,
  },
  // Primary Actions
  primaryActionRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    borderRadius: borderRadius.lg,
    ...shadows.medium,
  },
  actionAddVisitor: {
    backgroundColor: colors.primary,
  },
  actionEventPass: {
    backgroundColor: colors.secondaryDark,
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: spacing.sm,
  },
  // Stats Row
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statChip: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderLight,
    ...shadows.small,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Sections
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.primary,
  },
  // Shortcuts
  shortcutsCard: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    overflow: 'hidden',
    ...shadows.small,
  },
  shortcutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  shortcutIconContainer: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primaryLight + '20', // Light tint
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  shortcutTextContainer: {
    flex: 1,
  },
  shortcutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  shortcutDescription: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.borderLight,
    marginLeft: 72, // Aligns with text
  },
});

export default HomeScreen;
