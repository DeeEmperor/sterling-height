/**
 * My Unit Screen
 * Displays unit details, rent info, and estate dues
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Card, StatusBadge, Loading } from '../../components';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme';
import { useAuth } from '../../context';
import { unitService } from '../../services';
import { formatDate, formatCurrency } from '../../utils/helpers';
import { Unit, EstateDue } from '../../types';

export const MyUnitScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [dues, setDues] = useState<EstateDue[]>([]);
  const [daysToExpiry, setDaysToExpiry] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;

    try {
      const unitData = await unitService.getUnitForResident(user.id);
      setUnit(unitData);

      if (unitData) {
        const duesData = await unitService.getEstateDues(unitData.id);
        setDues(duesData);

        if (unitData.ownershipType === 'tenant' && unitData.rentExpiryDate) {
          const days = unitService.getDaysUntilRentExpiry(unitData.rentExpiryDate);
          setDaysToExpiry(days);
        }
      }
    } catch (error) {
      console.error('Error loading unit data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  if (loading) {
    return <Loading message="Loading unit details..." />;
  }

  if (!unit) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Unable to load unit information</Text>
        </View>
      </SafeAreaView>
    );
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
        <Text style={styles.title}>My Unit</Text>

        {/* Unit Info Card */}
        <Card style={styles.unitCard}>
          <View style={styles.unitHeader}>
            <Text style={styles.unitNumber}>{unit.unitNumber}</Text>
            <StatusBadge
              status={unit.ownershipType === 'owner' ? 'OWNER' : 'TENANT'}
              size="medium"
            />
          </View>
          <Text style={styles.residentName}>{unit.residentName}</Text>
        </Card>

        {/* Rent Info (for tenants) */}
        {unit.ownershipType === 'tenant' && unit.rentStartDate && unit.rentExpiryDate && (
          <Card style={styles.rentCard}>
            <Text style={styles.sectionTitle}>Rent Information</Text>

            <View style={styles.rentRow}>
              <View style={styles.rentItem}>
                <Text style={styles.rentLabel}>Start Date</Text>
                <Text style={styles.rentValue}>{formatDate(unit.rentStartDate)}</Text>
              </View>
              <View style={styles.rentItem}>
                <Text style={styles.rentLabel}>Expiry Date</Text>
                <Text style={styles.rentValue}>{formatDate(unit.rentExpiryDate)}</Text>
              </View>
            </View>

            {daysToExpiry !== null && (
              <View
                style={[
                  styles.countdownContainer,
                  daysToExpiry <= 7 && styles.countdownUrgent,
                  daysToExpiry <= 0 && styles.countdownExpired,
                ]}
              >
                <Text style={styles.countdownLabel}>
                  {daysToExpiry < 0 ? 'Expired' : daysToExpiry === 0 ? 'Expires Today' : 'Days Until Expiry'}
                </Text>
                <Text
                  style={[
                    styles.countdownValue,
                    daysToExpiry <= 7 && styles.countdownValueUrgent,
                  ]}
                >
                  {daysToExpiry < 0 ? Math.abs(daysToExpiry) + ' days ago' : daysToExpiry}
                </Text>
              </View>
            )}
          </Card>
        )}

        {/* Estate Dues */}
        <View style={styles.duesSection}>
          <Text style={styles.sectionTitle}>Estate Dues</Text>

          {dues.length === 0 ? (
            <Text style={styles.noDues}>No estate dues to display</Text>
          ) : (
            dues.map((due) => (
              <Card key={due.id} style={styles.dueCard}>
                <View style={styles.dueHeader}>
                  <Text style={styles.dueType}>{due.type}</Text>
                  <StatusBadge status={due.status} />
                </View>
                <View style={styles.dueDetails}>
                  <View>
                    <Text style={styles.dueLabel}>Amount</Text>
                    <Text style={styles.dueAmount}>{formatCurrency(due.amount)}</Text>
                  </View>
                  <View style={styles.dueDateContainer}>
                    <Text style={styles.dueLabel}>Due Date</Text>
                    <Text style={styles.dueDate}>{formatDate(due.dueDate)}</Text>
                  </View>
                </View>
              </Card>
            ))
          )}
        </View>

        {/* Note */}
        <View style={styles.note}>
          <Text style={styles.noteText}>
            ℹ️ For payment inquiries, please contact estate management
          </Text>
        </View>
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  unitCard: {
    marginBottom: spacing.lg,
  },
  unitHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  unitNumber: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
  },
  residentName: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  rentCard: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  rentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  rentItem: {
    flex: 1,
  },
  rentLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  rentValue: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  countdownContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  countdownUrgent: {
    backgroundColor: colors.warningLight,
  },
  countdownExpired: {
    backgroundColor: colors.errorLight,
  },
  countdownLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  countdownValue: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.primary,
  },
  countdownValueUrgent: {
    color: colors.error,
  },
  duesSection: {
    marginBottom: spacing.lg,
  },
  noDues: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    paddingVertical: spacing.lg,
  },
  dueCard: {
    marginBottom: spacing.md,
  },
  dueHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  dueType: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
  },
  dueDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dueLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  dueAmount: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  dueDateContainer: {
    alignItems: 'flex-end',
  },
  dueDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  note: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  noteText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
});

export default MyUnitScreen;
