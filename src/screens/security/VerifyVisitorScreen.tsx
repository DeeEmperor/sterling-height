/**
 * Verify Visitor Screen
 * Code input and visitor verification for security
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { Button, Card, StatusBadge } from '../../components';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme';
import { visitorService } from '../../services';
import { formatDate, formatTime } from '../../utils/helpers';
import { Visitor } from '../../types';

const CODE_LENGTH = 6;

export const VerifyVisitorScreen: React.FC = () => {
  const [code, setCode] = useState<string[]>(new Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  const handleCodeChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === CODE_LENGTH - 1) {
      const fullCode = newCode.join('');
      if (fullCode.length === CODE_LENGTH) {
        handleVerify(fullCode);
      }
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (codeStr?: string) => {
    const accessCode = codeStr || code.join('');
    
    if (accessCode.length !== CODE_LENGTH) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    setLoading(true);
    setError(null);
    setVisitor(null);

    try {
      const result = await visitorService.verifyVisitorByCode(accessCode);
      
      if (result.success && result.visitor) {
        setVisitor(result.visitor);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to verify code');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: 'entered' | 'denied') => {
    if (!visitor) return;

    setLoading(true);
    try {
      const result = await visitorService.updateVisitorStatus(visitor.id, action);
      
      if (result.success) {
        Alert.alert(
          'Success',
          `Visitor marked as ${action.toUpperCase()}`,
          [
            {
              text: 'OK',
              onPress: () => {
                // Reset form
                setCode(new Array(CODE_LENGTH).fill(''));
                setVisitor(null);
                inputRefs.current[0]?.focus();
              },
            },
          ]
        );
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to update visitor status');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCode(new Array(CODE_LENGTH).fill(''));
    setVisitor(null);
    setError(null);
    inputRefs.current[0]?.focus();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Verify Visitor</Text>
        <Text style={styles.subtitle}>
          Enter the 6-digit access code provided by the visitor
        </Text>

        {/* Code Input */}
        <View style={styles.codeContainer}>
          {code.map((digit, index) => (
            <TextInput
              key={index}
              ref={(ref) => { inputRefs.current[index] = ref; }}
              style={[
                styles.codeInput,
                digit && styles.codeInputFilled,
                error && styles.codeInputError,
              ]}
              value={digit}
              onChangeText={(value) => handleCodeChange(value, index)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
              autoFocus={index === 0}
            />
          ))}
        </View>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title="Verify Code"
          onPress={() => handleVerify()}
          loading={loading && !visitor}
          fullWidth
          size="large"
          style={styles.verifyButton}
        />

        {/* Visitor Details */}
        {visitor && (
          <Card style={styles.visitorCard}>
            <View style={styles.visitorHeader}>
              <Text style={styles.visitorName}>{visitor.name}</Text>
              <StatusBadge status={visitor.status} size="medium" />
            </View>

            <View style={styles.detailsGrid}>
              <DetailItem label="Visiting" value={visitor.residentName} />
              <DetailItem label="Unit" value={visitor.unitNumber} />
              <DetailItem label="Date" value={formatDate(visitor.visitDate)} />
              <DetailItem
                label="Time Window"
                value={`${formatTime(visitor.timeWindowStart)} - ${formatTime(visitor.timeWindowEnd)}`}
              />
              {visitor.carPlateNumber && (
                <DetailItem label="Vehicle" value={visitor.carPlateNumber} />
              )}
            </View>

            {/* Action Buttons */}
            {visitor.status === 'pending' && (
              <View style={styles.actionButtons}>
                <Button
                  title="✓ Mark ENTERED"
                  onPress={() => handleAction('entered')}
                  loading={loading}
                  size="large"
                  style={styles.enterButton}
                  fullWidth
                />
                <Button
                  title="✗ Mark DENIED"
                  onPress={() => handleAction('denied')}
                  loading={loading}
                  variant="danger"
                  size="large"
                  fullWidth
                />
              </View>
            )}

            {visitor.status !== 'pending' && (
              <View style={styles.statusMessage}>
                <Text style={styles.statusMessageText}>
                  This visitor has already been processed
                </Text>
              </View>
            )}

            <Button
              title="Verify Another"
              onPress={resetForm}
              variant="outline"
              fullWidth
              style={styles.resetButton}
            />
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// Detail Item Component
const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  codeInput: {
    width: 52,
    height: 64,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    textAlign: 'center',
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    backgroundColor: colors.surface,
  },
  codeInputFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  codeInputError: {
    borderColor: colors.error,
  },
  errorText: {
    color: colors.error,
    fontSize: 14,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  verifyButton: {
    marginBottom: spacing.xl,
  },
  visitorCard: {
    padding: spacing.lg,
    ...shadows.medium,
  },
  visitorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  visitorName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    flex: 1,
  },
  detailsGrid: {
    marginBottom: spacing.lg,
  },
  detailItem: {
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
    fontWeight: '600',
    color: colors.text,
  },
  actionButtons: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  enterButton: {
    backgroundColor: colors.success,
  },
  statusMessage: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  statusMessageText: {
    textAlign: 'center',
    fontSize: 14,
    color: colors.textSecondary,
  },
  resetButton: {
    marginTop: spacing.sm,
  },
});

export default VerifyVisitorScreen;
