/**
 * Security Home Screen
 * Main dashboard for security personnel with large verify button
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  RefreshControl,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button, Card, Loading } from '../../components';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme';
import { useAuth } from '../../context';
import { visitorService } from '../../services';
import { getGreeting } from '../../utils/helpers';

export const SecurityHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, entered: 0 });

  const loadStats = useCallback(async () => {
    try {
      const data = await visitorService.getTodayStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading message="Loading..." />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
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
          <Text style={styles.name}>{user?.name?.split(' ')[0]} 🛡️</Text>
          <Text style={styles.role}>Security Personnel</Text>
        </View>

        {/* Main Action - Large Verify Button */}
        <View style={styles.mainActionContainer}>
          <Button
            title="🔍 Verify Visitor"
            onPress={() => navigation.navigate('Verify')}
            size="large"
            fullWidth
            style={styles.verifyButton}
            textStyle={styles.verifyButtonText}
          />
          <Text style={styles.verifyHint}>
            Enter visitor access code to verify
          </Text>
        </View>

        {/* Today's Stats */}
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <View style={styles.statsRow}>
          <Card style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Expected Visitors</Text>
          </Card>
          <Card style={styles.statCard}>
            <Text style={[styles.statValue, styles.enteredValue]}>{stats.entered}</Text>
            <Text style={styles.statLabel}>Checked In</Text>
          </Card>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Button
            title="📋 View Visitor Logs"
            onPress={() => navigation.navigate('Logs')}
            variant="outline"
            fullWidth
            size="large"
          />
        </View>

        {/* Instructions */}
        <Card style={styles.instructionsCard}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <Text style={styles.instructionsText}>
            1. Ask visitor for their access code{'\n'}
            2. Enter code in the verify screen{'\n'}
            3. Confirm visitor details match{'\n'}
            4. Mark as ENTERED or DENIED
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    marginBottom: spacing.xl,
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
  role: {
    fontSize: 14,
    color: colors.primary,
    marginTop: spacing.xs,
    fontWeight: '500',
  },
  mainActionContainer: {
    marginBottom: spacing.xl,
  },
  verifyButton: {
    minHeight: 80,
    backgroundColor: colors.primary,
    ...shadows.medium,
  },
  verifyButtonText: {
    fontSize: 22,
  },
  verifyHint: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.xl,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  statValue: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.text,
  },
  enteredValue: {
    color: colors.success,
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  quickActions: {
    marginBottom: spacing.xl,
  },
  instructionsCard: {
    backgroundColor: colors.surface,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  instructionsText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default SecurityHomeScreen;
