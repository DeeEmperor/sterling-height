/**
 * Resident Home Screen
 * Displays greeting, alerts, announcements, and upcoming visitors
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AlertCard, AnnouncementCard, VisitorCard, Loading } from '../../components';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme';
import { useAuth } from '../../context';
import { visitorService, announcementService, unitService } from '../../services';
import { getGreeting, formatDate } from '../../utils/helpers';
import { Unit, Visitor, Announcement, EstateDue } from '../../types';

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [upcomingVisitor, setUpcomingVisitor] = useState<Visitor | null>(null);
  const [latestAnnouncement, setLatestAnnouncement] = useState<Announcement | null>(null);
  const [overdueDues, setOverdueDues] = useState<EstateDue[]>([]);
  const [daysToRentExpiry, setDaysToRentExpiry] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      // Load unit data
      const unitData = await unitService.getUnitForResident(user.id);
      setUnit(unitData);

      if (unitData) {
        // Check rent expiry for tenants
        if (unitData.ownershipType === 'tenant' && unitData.rentExpiryDate) {
          const days = unitService.getDaysUntilRentExpiry(unitData.rentExpiryDate);
          if (days <= 30 && days >= 0) {
            setDaysToRentExpiry(days);
          }
        }

        // Load overdue dues
        const dues = await unitService.getEstateDues(unitData.id);
        const overdue = dues.filter(d => d.status === 'overdue');
        setOverdueDues(overdue);
      }

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
    <SafeAreaView style={styles.container}>
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
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()},</Text>
          <Text style={styles.name}>{user?.name?.split(' ')[0]} 👋</Text>
          {unit && (
            <Text style={styles.unitInfo}>Unit {unit.unitNumber}</Text>
          )}
        </View>

        {/* Alerts Section */}
        <View style={styles.section}>
          {/* Rent Expiry Alert */}
          {daysToRentExpiry !== null && (
            <AlertCard
              type={daysToRentExpiry <= 7 ? 'error' : 'warning'}
              title="Rent Expiry Reminder"
              message={
                daysToRentExpiry === 0
                  ? 'Your rent expires TODAY! Please contact management.'
                  : `Your rent expires in ${daysToRentExpiry} day${daysToRentExpiry > 1 ? 's' : ''}. Please arrange for renewal.`
              }
              onPress={() => navigation.navigate('MyUnit')}
            />
          )}

          {/* Overdue Dues Alerts */}
          {overdueDues.map((due) => (
            <AlertCard
              key={due.id}
              type="error"
              title="Overdue Payment"
              message={`${due.type}: ₦${due.amount.toLocaleString()} was due on ${formatDate(due.dueDate)}`}
              onPress={() => navigation.navigate('MyUnit')}
            />
          ))}
        </View>

        {/* Upcoming Visitor */}
        {upcomingVisitor && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Upcoming Visitor</Text>
            <VisitorCard
              visitor={upcomingVisitor}
              onPress={() => navigation.navigate('Visitors')}
            />
          </View>
        )}

        {/* Latest Announcement */}
        {latestAnnouncement && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest Announcement</Text>
            <AnnouncementCard
              announcement={latestAnnouncement}
              preview
              onPress={() => navigation.navigate('Announcements')}
            />
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickActionButton
              icon="person-add"
              label="Add Visitor"
              onPress={() => navigation.navigate('CreateVisitor')}
            />
            <QuickActionButton
              icon="people"
              label="My Visitors"
              onPress={() => navigation.navigate('Visitors')}
            />
            <QuickActionButton
              icon="home"
              label="My Unit"
              onPress={() => navigation.navigate('MyUnit')}
            />
            <QuickActionButton
              icon="megaphone"
              label="News"
              onPress={() => navigation.navigate('Announcements')}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Quick Action Button Component
const QuickActionButton: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}> = ({ icon, label, onPress }) => (
  <TouchableOpacity style={styles.quickActionWrapper} onPress={onPress} activeOpacity={0.7}>
    <View style={styles.quickAction}>
      <Ionicons name={icon} size={28} color={colors.primary} />
    </View>
    <Text style={styles.quickActionLabel}>{label}</Text>
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
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.lg,
  },
  greeting: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.xs,
  },
  unitInfo: {
    fontSize: 14,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionWrapper: {
    alignItems: 'center',
    width: '22%',
  },
  quickAction: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },

  quickActionLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default HomeScreen;
