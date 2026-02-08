/**
 * Create Visitor Screen
 * Form to register a new visitor with access code generation
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Button, Input, Card } from '../../components';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme';
import { useAuth } from '../../context';
import { visitorService } from '../../services';
import { formatDate, formatTime } from '../../utils/helpers';
import { Visitor } from '../../types';

export const CreateVisitorScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [createdVisitor, setCreatedVisitor] = useState<Visitor | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [carPlate, setCarPlate] = useState('');

  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Visitor name is required';
    }

    if (!visitDate.trim()) {
      newErrors.visitDate = 'Visit date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) {
      newErrors.visitDate = 'Use format: YYYY-MM-DD';
    }

    if (!timeStart.trim()) {
      newErrors.timeStart = 'Start time is required';
    } else if (!/^\d{2}:\d{2}$/.test(timeStart)) {
      newErrors.timeStart = 'Use format: HH:MM';
    }

    if (!timeEnd.trim()) {
      newErrors.timeEnd = 'End time is required';
    } else if (!/^\d{2}:\d{2}$/.test(timeEnd)) {
      newErrors.timeEnd = 'Use format: HH:MM';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm() || !user) return;

    setLoading(true);
    try {
      const result = await visitorService.createVisitor(user.id, {
        name: name.trim(),
        visitDate: visitDate.trim(),
        timeWindowStart: timeStart.trim(),
        timeWindowEnd: timeEnd.trim(),
        carPlateNumber: carPlate.trim() || undefined,
      });

      if (result.success && result.visitor) {
        setCreatedVisitor(result.visitor);
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to create visitor');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (createdVisitor) {
      await Clipboard.setStringAsync(createdVisitor.accessCode);
      Alert.alert('Copied!', 'Access code copied to clipboard');
    }
  };

  const createAnother = () => {
    setCreatedVisitor(null);
    setName('');
    setVisitDate('');
    setTimeStart('');
    setTimeEnd('');
    setCarPlate('');
    setErrors({});
  };

  // Success view
  if (createdVisitor) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContent}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>✅</Text>
          </View>
          <Text style={styles.successTitle}>Visitor Added!</Text>
          <Text style={styles.successSubtitle}>
            Share this access code with your visitor
          </Text>

          <Card style={styles.codeCard}>
            <Text style={styles.codeLabel}>Access Code</Text>
            <Text style={styles.accessCode}>{createdVisitor.accessCode}</Text>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={copyCode}
              activeOpacity={0.7}
            >
              <Text style={styles.copyButtonText}>📋 Copy Code</Text>
            </TouchableOpacity>
          </Card>

          <Card style={styles.detailsCard}>
            <DetailRow label="Visitor" value={createdVisitor.name} />
            <DetailRow label="Date" value={formatDate(createdVisitor.visitDate)} />
            <DetailRow
              label="Time"
              value={`${formatTime(createdVisitor.timeWindowStart)} - ${formatTime(createdVisitor.timeWindowEnd)}`}
            />
            {createdVisitor.carPlateNumber && (
              <DetailRow label="Vehicle" value={createdVisitor.carPlateNumber} />
            )}
          </Card>

          <View style={styles.buttonGroup}>
            <Button
              title="Add Another Visitor"
              onPress={createAnother}
              variant="outline"
              fullWidth
            />
            <Button
              title="Done"
              onPress={() => navigation.goBack()}
              fullWidth
              style={styles.doneButton}
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Form view
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Add New Visitor</Text>
          <Text style={styles.subtitle}>
            Create an access code for your visitor
          </Text>

          <Input
            label="Visitor Name *"
            placeholder="Enter visitor's full name"
            value={name}
            onChangeText={setName}
            error={errors.name}
            autoCapitalize="words"
          />

          <Input
            label="Visit Date *"
            placeholder="YYYY-MM-DD (e.g., 2026-01-08)"
            value={visitDate}
            onChangeText={setVisitDate}
            error={errors.visitDate}
            keyboardType="numbers-and-punctuation"
          />

          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Input
                label="Start Time *"
                placeholder="HH:MM"
                value={timeStart}
                onChangeText={setTimeStart}
                error={errors.timeStart}
                keyboardType="numbers-and-punctuation"
              />
            </View>
            <View style={styles.timeInput}>
              <Input
                label="End Time *"
                placeholder="HH:MM"
                value={timeEnd}
                onChangeText={setTimeEnd}
                error={errors.timeEnd}
                keyboardType="numbers-and-punctuation"
              />
            </View>
          </View>

          <Input
            label="Car Plate Number"
            placeholder="Optional (e.g., LAG-123-ABC)"
            value={carPlate}
            onChangeText={setCarPlate}
            autoCapitalize="characters"
          />

          <Button
            title="Generate Access Code"
            onPress={handleCreate}
            loading={loading}
            fullWidth
            size="large"
            style={styles.submitButton}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// Detail row component
const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeInput: {
    flex: 1,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  // Success styles
  successContent: {
    padding: spacing.md,
    alignItems: 'center',
  },
  successIcon: {
    marginTop: spacing.xl,
    marginBottom: spacing.lg,
  },
  successEmoji: {
    fontSize: 64,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  codeCard: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  codeLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  accessCode: {
    fontSize: 40,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 8,
    marginBottom: spacing.md,
  },
  copyButton: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  copyButtonText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
  },
  detailsCard: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  detailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
  },
  buttonGroup: {
    width: '100%',
    gap: spacing.md,
  },
  doneButton: {
    marginTop: spacing.sm,
  },
});

export default CreateVisitorScreen;
