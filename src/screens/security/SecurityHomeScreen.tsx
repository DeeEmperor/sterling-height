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
  Modal,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Button, Card, Loading } from '../../components';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme';
import { useAuth } from '../../context';
import { visitorService } from '../../services';
import { initSocketConnection, joinSecurityRoom, getSocket } from '../../services/socket';
import { getActiveAlarms, resolveAlarm, Alarm } from '../../services/alarm';
import { getGreeting } from '../../utils/helpers';

export const SecurityHomeScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({ total: 0, entered: 0 });
  const [activeAlarms, setActiveAlarms] = useState<Alarm[]>([]);
  const [showAlarmModal, setShowAlarmModal] = useState(false);
  const [currentAlarm, setCurrentAlarm] = useState<Alarm | null>(null);

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

  const loadActiveAlarms = useCallback(async () => {
    try {
      const alarms = await getActiveAlarms();
      setActiveAlarms(alarms);
      if (alarms.length > 0) {
        setCurrentAlarm(alarms[0]);
        setShowAlarmModal(true);
      }
    } catch (error) {
      console.error('Error loading active alarms:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStats();
      loadActiveAlarms();
    }, [loadStats, loadActiveAlarms])
  );

  useEffect(() => {
    initSocketConnection();
    joinSecurityRoom();
    const socket = getSocket();

    socket.on('alarm_triggered', (alarm: Alarm) => {
      setActiveAlarms(prev => [alarm, ...prev]);
      setCurrentAlarm(alarm);
      setShowAlarmModal(true);
    });

    socket.on('alarm_resolved', (updatedAlarm: Alarm) => {
      setActiveAlarms(prev => prev.filter(a => a.id !== updatedAlarm.id));
      if (currentAlarm?.id === updatedAlarm.id) {
        setShowAlarmModal(false);
      }
    });

    return () => {
      socket.off('alarm_triggered');
      socket.off('alarm_resolved');
    };
  }, [currentAlarm]);

  const handleResolveAlarm = async (status: 'RESOLVED' | 'FALSE_ALARM') => {
    if (!currentAlarm) return;
    try {
      await resolveAlarm(currentAlarm.id, status);
      setShowAlarmModal(false);
      loadActiveAlarms();
    } catch (error) {
      console.error('Error resolving alarm:', error);
      Alert.alert('Error', 'Failed to resolve the alarm.');
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStats();
    await loadActiveAlarms();
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
          <Text style={styles.name}>{user?.name?.split(' ')[0]}</Text>
          <Text style={styles.role}>Security Personnel</Text>
        </View>

        {/* Main Action - Large Verify Button */}
        <View style={styles.mainActionContainer}>
          <Button
            title="Verify Visitor"
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

        {/* Active Alarms Indicator */}
        {activeAlarms.length > 0 && (
          <TouchableOpacity 
            style={styles.activeAlarmsBanner}
            onPress={() => {
              setCurrentAlarm(activeAlarms[0]);
              setShowAlarmModal(true);
            }}
          >
            <Ionicons name="warning" size={24} color="#FFF" />
            <Text style={styles.activeAlarmsText}>
              {activeAlarms.length} ACTIVE ALARM{activeAlarms.length > 1 ? 'S' : ''}!
            </Text>
            <Ionicons name="chevron-forward" size={24} color="#FFF" />
          </TouchableOpacity>
        )}

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
            title="View Visitor Logs"
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

      {/* EMERGENCY ALARM MODAL */}
      <Modal visible={showAlarmModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.alarmModalContainer}>
            <View style={styles.alarmHeader}>
              <Ionicons name="warning" size={48} color="#DC2626" />
              <Text style={styles.alarmModalTitle}>EMERGENCY ALARM</Text>
            </View>
            
            <View style={styles.alarmDetails}>
              <Text style={styles.alarmLabel}>UNIT</Text>
              <Text style={styles.alarmValueBig}>{currentAlarm?.unit_number || 'Unknown'}</Text>
              
              <Text style={styles.alarmLabel}>RESIDENT</Text>
              <Text style={styles.alarmValue}>{currentAlarm?.resident_name || 'Unknown'}</Text>
              
              <Text style={styles.alarmLabel}>PHONE</Text>
              <Text style={styles.alarmValue}>{currentAlarm?.resident_phone || 'Unknown'}</Text>
            </View>

            <View style={styles.alarmActions}>
              <TouchableOpacity 
                style={[styles.alarmBtn, styles.resolveBtn]}
                onPress={() => handleResolveAlarm('RESOLVED')}
              >
                <Text style={styles.alarmBtnText}>Mark Resolved</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.alarmBtn, styles.falseAlarmBtn]}
                onPress={() => handleResolveAlarm('FALSE_ALARM')}
              >
                <Text style={styles.alarmBtnText}>False Alarm</Text>
              </TouchableOpacity>
            </View>

            {activeAlarms.length > 1 && (
              <Text style={styles.moreAlarmsText}>
                + {activeAlarms.length - 1} more active alarms
              </Text>
            )}
          </View>
        </View>
      </Modal>
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
  activeAlarmsBanner: {
    backgroundColor: '#DC2626',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  activeAlarmsText: {
    flex: 1,
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  alarmModalContainer: {
    backgroundColor: '#FFF',
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    alignItems: 'center',
  },
  alarmHeader: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  alarmModalTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#DC2626',
    marginTop: spacing.sm,
  },
  alarmDetails: {
    width: '100%',
    backgroundColor: colors.background,
    padding: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.xl,
  },
  alarmLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
    marginTop: spacing.md,
  },
  alarmValue: {
    fontSize: 18,
    color: colors.text,
    fontWeight: '600',
  },
  alarmValueBig: {
    fontSize: 32,
    color: colors.text,
    fontWeight: '800',
  },
  alarmActions: {
    width: '100%',
    gap: spacing.md,
  },
  alarmBtn: {
    width: '100%',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  resolveBtn: {
    backgroundColor: colors.success,
  },
  falseAlarmBtn: {
    backgroundColor: colors.textSecondary,
  },
  alarmBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
  },
  moreAlarmsText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  },
});

export default SecurityHomeScreen;
