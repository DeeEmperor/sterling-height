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
  Modal,
  Image,
  Share,
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

const DateTimePicker = Platform.OS !== 'web' ? require('@react-native-community/datetimepicker').default : null;

// Helper functions for date/time conversion
const formatDateString = (date: Date): string => {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

const formatTimeString = (date: Date): string => {
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
};

const parseDateString = (str: string): Date => {
  if (!str) return new Date();
  const [year, month, day] = str.split('-').map(Number);
  const d = new Date();
  d.setFullYear(year, month - 1, day);
  return d;
};

const parseTimeString = (str: string): Date => {
  if (!str) return new Date();
  const [hours, minutes] = str.split(':').map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
};

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

  // Picker show states (for mobile)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

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

  const sharePass = async () => {
    if (createdVisitor) {
      try {
        const message = `🏘️ Sterling Height Estate — Visitor Pass\n\nHi ${createdVisitor.name}!\n\nYou have a visitor pass scheduled.\n\n📅 Date: ${formatDate(createdVisitor.visitDate)}\n🕐 Time: ${formatTime(createdVisitor.timeWindowStart)} - ${formatTime(createdVisitor.timeWindowEnd)}\n🔑 Access Code: ${createdVisitor.accessCode}\n\n📱 Scan QR Code at gate:\nhttps://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${createdVisitor.accessCode}\n\nShow this code or QR code to security at the gate.`;
        await Share.share({ message });
      } catch (error) {
        console.error('Error sharing visitor pass:', error);
      }
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
    setShowDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
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

          <Card style={styles.qrCard}>
            <Text style={styles.qrLabel}>Pass QR Code</Text>
            <View style={styles.qrWrapper}>
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${createdVisitor.accessCode}`,
                }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.qrHelpText}>
              Visitors can scan this at the gate for instant entry
            </Text>
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
              title="📤 Share Pass"
              onPress={sharePass}
              variant="primary"
              fullWidth
            />
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

          {Platform.OS === 'web' ? (
            <Input
              label="Visit Date *"
              placeholder="YYYY-MM-DD (e.g., 2026-01-08)"
              value={visitDate}
              onChangeText={setVisitDate}
              error={errors.visitDate}
              type="date"
            />
          ) : (
            <TouchableOpacity onPress={() => setShowDatePicker(true)} activeOpacity={0.7}>
              <View pointerEvents="none">
                <Input
                  label="Visit Date *"
                  placeholder="Select Date"
                  value={visitDate}
                  error={errors.visitDate}
                  editable={false}
                />
              </View>
            </TouchableOpacity>
          )}

          {Platform.OS === 'web' ? (
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <Input
                  label="Start Time *"
                  placeholder="HH:MM"
                  value={timeStart}
                  onChangeText={setTimeStart}
                  error={errors.timeStart}
                  type="time"
                />
              </View>
              <View style={styles.timeInput}>
                <Input
                  label="End Time *"
                  placeholder="HH:MM"
                  value={timeEnd}
                  onChangeText={setTimeEnd}
                  error={errors.timeEnd}
                  type="time"
                />
              </View>
            </View>
          ) : (
            <View style={styles.timeRow}>
              <View style={styles.timeInput}>
                <TouchableOpacity onPress={() => setShowStartTimePicker(true)} activeOpacity={0.7}>
                  <View pointerEvents="none">
                    <Input
                      label="Start Time *"
                      placeholder="Select Start"
                      value={timeStart ? formatTime(timeStart) : ''}
                      error={errors.timeStart}
                      editable={false}
                    />
                  </View>
                </TouchableOpacity>
              </View>
              <View style={styles.timeInput}>
                <TouchableOpacity onPress={() => setShowEndTimePicker(true)} activeOpacity={0.7}>
                  <View pointerEvents="none">
                    <Input
                      label="End Time *"
                      placeholder="Select End"
                      value={timeEnd ? formatTime(timeEnd) : ''}
                      error={errors.timeEnd}
                      editable={false}
                    />
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          )}

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

        {Platform.OS !== 'web' && (
          <>
            {/* Date Picker Modal for iOS / Dialog for Android */}
            {Platform.OS === 'ios' ? (
              <Modal
                visible={showDatePicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.modalCloseText}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>Select Date</Text>
                      <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                        <Text style={styles.modalDoneText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={visitDate ? parseDateString(visitDate) : new Date()}
                      mode="date"
                      display="spinner"
                      onChange={(event: any, date?: Date) => {
                        if (date) setVisitDate(formatDateString(date));
                      }}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              showDatePicker && (
                <DateTimePicker
                  value={visitDate ? parseDateString(visitDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={(event: any, date?: Date) => {
                    setShowDatePicker(false);
                    if (date && event.type !== 'dismissed') {
                      setVisitDate(formatDateString(date));
                    }
                  }}
                />
              )
            )}
            
            {/* Start Time Picker */}
            {Platform.OS === 'ios' ? (
              <Modal
                visible={showStartTimePicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                        <Text style={styles.modalCloseText}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>Start Time</Text>
                      <TouchableOpacity onPress={() => setShowStartTimePicker(false)}>
                        <Text style={styles.modalDoneText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={timeStart ? parseTimeString(timeStart) : new Date()}
                      mode="time"
                      display="spinner"
                      is24Hour={true}
                      onChange={(event: any, date?: Date) => {
                        if (date) setTimeStart(formatTimeString(date));
                      }}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              showStartTimePicker && (
                <DateTimePicker
                  value={timeStart ? parseTimeString(timeStart) : new Date()}
                  mode="time"
                  display="default"
                  is24Hour={true}
                  onChange={(event: any, date?: Date) => {
                    setShowStartTimePicker(false);
                    if (date && event.type !== 'dismissed') {
                      setTimeStart(formatTimeString(date));
                    }
                  }}
                />
              )
            )}

            {/* End Time Picker */}
            {Platform.OS === 'ios' ? (
              <Modal
                visible={showEndTimePicker}
                transparent={true}
                animationType="slide"
              >
                <View style={styles.modalOverlay}>
                  <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                      <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                        <Text style={styles.modalCloseText}>Cancel</Text>
                      </TouchableOpacity>
                      <Text style={styles.modalTitle}>End Time</Text>
                      <TouchableOpacity onPress={() => setShowEndTimePicker(false)}>
                        <Text style={styles.modalDoneText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                    <DateTimePicker
                      value={timeEnd ? parseTimeString(timeEnd) : new Date()}
                      mode="time"
                      display="spinner"
                      is24Hour={true}
                      onChange={(event: any, date?: Date) => {
                        if (date) setTimeEnd(formatTimeString(date));
                      }}
                    />
                  </View>
                </View>
              </Modal>
            ) : (
              showEndTimePicker && (
                <DateTimePicker
                  value={timeEnd ? parseTimeString(timeEnd) : new Date()}
                  mode="time"
                  display="default"
                  is24Hour={true}
                  onChange={(event: any, date?: Date) => {
                    setShowEndTimePicker(false);
                    if (date && event.type !== 'dismissed') {
                      setTimeEnd(formatTimeString(date));
                    }
                  }}
                />
              )
            )}
          </>
        )}
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
  // Modal styles for iOS picker
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderLight,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
  },
  modalCloseText: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  modalDoneText: {
    fontSize: 16,
    color: colors.primary,
    fontWeight: '600',
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
  qrCard: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  qrLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.sm,
    ...shadows.small,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrHelpText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default CreateVisitorScreen;
