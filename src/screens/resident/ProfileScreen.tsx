import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Card, Button } from '../../components';
import { colors } from '../../theme/colors';
import { spacing, borderRadius } from '../../theme';
import { useAuth } from '../../context';
import { unitService } from '../../services';
import { formatPhoneNumber, getInitials } from '../../utils/helpers';
import { Unit } from '../../types';

export const ProfileScreen: React.FC = () => {
  const { user, logout } = useAuth();
  const [unit, setUnit] = React.useState<Unit | null>(null);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);

  React.useEffect(() => {
    const loadUnit = async () => {
      if (user) {
        const unitData = await unitService.getUnitForResident(user.id);
        setUnit(unitData);
      }
    };
    loadUnit();
  }, [user]);

  const performLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleLogout = () => {
    if (Platform.OS === 'web') {
      // Alert.alert is a no-op on web, use window.confirm instead
      if (window.confirm('Are you sure you want to logout?')) {
        performLogout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: performLogout,
          },
        ]
      );
    }
  };

  if (!user) return null;


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(user.name)}</Text>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>RESIDENT</Text>
          </View>
        </View>

        {/* User Info Card */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          
          <InfoRow label="Full Name" value={user.name} />
          <InfoRow label="Phone Number" value={formatPhoneNumber(user.phone)} />
          <InfoRow label="Role" value="Resident" />
          {unit && (
            <>
              <InfoRow label="Unit Number" value={unit.unitNumber} />
              <InfoRow 
                label="Status" 
                value={unit.ownershipType === 'owner' ? 'Property Owner' : 'Tenant'} 
              />
            </>
          )}
        </Card>

        {/* App Info */}
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <InfoRow label="App Version" value="1.0.0" />
          <InfoRow label="Estate" value="Sterling Height" />
        </Card>

        {/* Logout Button */}
        <Button
          title={isLoggingOut ? 'Logging out...' : 'Logout'}
          onPress={handleLogout}
          variant="danger"
          fullWidth
          size="large"
          style={styles.logoutButton}
          disabled={isLoggingOut}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

// Info Row Component
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    padding: spacing.md,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.textOnPrimary,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  roleBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textOnPrimary,
    letterSpacing: 1,
  },
  infoCard: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  infoLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  logoutButton: {
    marginTop: spacing.lg,
  },
});

export default ProfileScreen;
