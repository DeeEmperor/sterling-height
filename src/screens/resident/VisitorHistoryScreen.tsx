/**
 * Visitor History Screen
 * Lists all visitors and event passes for the resident
 */
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { VisitorCard, EventPassCard, Loading, EmptyState, Button } from '../../components';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme';
import { useAuth } from '../../context';
import { visitorService, eventPassService } from '../../services';
import { Visitor, EventPass } from '../../types';

export const VisitorHistoryScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  
  const [activeTab, setActiveTab] = useState<'single' | 'event'>('single');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [eventPasses, setEventPasses] = useState<EventPass[]>([]);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      if (activeTab === 'single') {
        const data = await visitorService.getVisitorsForResident(user.id);
        setVisitors(data);
      } else {
        const data = await eventPassService.getEventPassesForResident();
        setEventPasses(data);
      }
    } catch (error) {
      console.error(`Error loading ${activeTab} data:`, error);
    } finally {
      setLoading(false);
    }
  }, [user, activeTab]);

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

  const handleTabChange = (tab: 'single' | 'event') => {
    setActiveTab(tab);
    setLoading(true);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Visitors</Text>
        <Button
          title={activeTab === 'single' ? '+ Single Pass' : '+ Event Pass'}
          onPress={() => navigation.navigate(activeTab === 'single' ? 'CreateVisitor' : 'CreateEventPass')}
          size="small"
        />
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'single' && styles.activeTab,
          ]}
          onPress={() => handleTabChange('single')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'single' && styles.activeTabText,
            ]}
          >
            👤 Single Visits
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'event' && styles.activeTab,
          ]}
          onPress={() => handleTabChange('event')}
          activeOpacity={0.8}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'event' && styles.activeTabText,
            ]}
          >
            🎉 Event Passes
          </Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <Loading message={`Loading ${activeTab === 'single' ? 'visitors' : 'event passes'}...`} />
      ) : activeTab === 'single' ? (
        visitors.length === 0 ? (
          <EmptyState
            icon="👥"
            title="No Visitors Yet"
            message="Add a visitor to generate a single-entry access code for them"
          />
        ) : (
          <FlatList
            data={visitors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <VisitorCard visitor={item} />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
          />
        )
      ) : (
        eventPasses.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="No Event Passes"
            message="Create an event pass to share one multi-guest entry code"
          />
        ) : (
          <FlatList
            data={eventPasses}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <EventPassCard eventPass={item} />
            )}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[colors.primary]}
              />
            }
          />
        )
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: spacing.xs,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.primary,
    ...shadows.small,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    padding: spacing.md,
  },
});

export default VisitorHistoryScreen;
