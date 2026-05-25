/**
 * Create Event Pass Screen
 * Form to register a multi-entry group pass for events/parties
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
  Image,
  Share,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { Button, Input, Card } from '../../components';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme';
import { eventPassService } from '../../services';
import { formatDate, formatTime } from '../../utils/helpers';
import { EventPass } from '../../types';

const DateTimePicker = Platform.OS !== 'web' ? require('@react-native-community/datetimepicker').default : null;

export const CreateEventPassScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const [eventName, setEventName] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [timeStart, setTimeStart] = useState('');
  const [timeEnd, setTimeEnd] = useState('');
  const [maxEntries, setMaxEntries] = useState('15');
  const [loading, setLoading] = useState(false);
  const [createdPass, setCreatedPass] = useState<EventPass | null>(null);

  // Date/Time picker states for mobile
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const [dateValue, setDateValue] = useState(new Date());
  const [startTimeValue, setStartTimeValue] = useState(new Date());
  const [endTimeValue, setEndTimeValue] = useState(new Date());

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!eventName.trim()) newErrors.eventName = 'Event name is required';
    if (!visitDate) newErrors.visitDate = 'Date is required';
    if (!timeStart) newErrors.timeStart = 'Start time is required';
    if (!timeEnd) newErrors.timeEnd = 'End time is required';
    
    const count = parseInt(maxEntries, 10);
    if (!maxEntries || isNaN(count) || count < 1) {
      newErrors.maxEntries = 'Maximum guest entries must be a positive number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCreate = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await eventPassService.createEventPass({
        eventName: eventName.trim(),
        visitDate,
        timeWindowStart: timeStart,
        timeWindowEnd: timeEnd,
        maxEntries: parseInt(maxEntries, 10),
      });

      if (res.success && res.eventPass) {
        setCreatedPass(res.eventPass);
      } else {
        Alert.alert('Error', res.message || 'Failed to create event pass');
      }
    } catch (error) {
      console.error('Error creating event pass:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async () => {
    if (createdPass) {
      await Clipboard.setStringAsync(createdPass.accessCode);
      Alert.alert('Copied!', 'Access code copied to clipboard');
    }
  };

  const sharePass = async () => {
    if (createdPass) {
      try {
        const message = `🎉 Event Group Pass — Sterling Height Estate\n\nHi everyone! Here is the group access pass for "${createdPass.eventName}".\n\n📅 Date: ${formatDate(createdPass.visitDate)}\n🕐 Time: ${formatTime(createdPass.timeWindowStart)} - ${formatTime(createdPass.timeWindowEnd)}\n🔑 Access Code: ${createdPass.accessCode}\n👥 Expected entries limit: ${createdPass.maxEntries}\n\n📱 Scan QR Code at gate:\nhttps://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${createdPass.accessCode}\n\nPlease show this code or QR code to gate security when entering.`;
        await Share.share({ message });
      } catch (error) {
        console.error('Error sharing event pass:', error);
      }
    }
  };

  const createAnother = () => {
    setCreatedPass(null);
    setEventName('');
    setVisitDate('');
    setTimeStart('');
    setTimeEnd('');
    setMaxEntries('15');
    setErrors({});
    setShowDatePicker(false);
    setShowStartTimePicker(false);
    setShowEndTimePicker(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateValue(selectedDate);
      const yyyy = selectedDate.getFullYear();
      const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dd = String(selectedDate.getDate()).padStart(2, '0');
      setVisitDate(`${yyyy}-${mm}-${dd}`);
      if (errors.visitDate) {
        setErrors(prev => ({ ...prev, visitDate: '' }));
      }
    }
  };

  const handleStartTimeChange = (event: any, selectedTime?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setStartTimeValue(selectedTime);
      const hh = String(selectedTime.getHours()).padStart(2, '0');
      const mm = String(selectedTime.getMinutes()).padStart(2, '0');
      setTimeStart(`${hh}:${mm}`);
      if (errors.timeStart) {
        setErrors(prev => ({ ...prev, timeStart: '' }));
      }
    }
  };

  const handleEndTimeChange = (event: any, selectedTime?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedTime) {
      setEndTimeValue(selectedTime);
      const hh = String(selectedTime.getHours()).padStart(2, '0');
      const mm = String(selectedTime.getMinutes()).padStart(2, '0');
      setTimeEnd(`${hh}:${mm}`);
      if (errors.timeEnd) {
        setErrors(prev => ({ ...prev, timeEnd: '' }));
      }
    }
  };

  // Success view
  if (createdPass) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.successContent}>
          <View style={styles.successIcon}>
            <Text style={styles.successEmoji}>🎉</Text>
          </View>
          <Text style={styles.successTitle}>Event Pass Created!</Text>
          <Text style={styles.successSubtitle}>
            Share this single code or QR code with all guests
          </Text>

          <Card style={styles.codeCard}>
            <Text style={styles.codeLabel}>Event Access Code</Text>
            <Text style={styles.accessCode}>{createdPass.accessCode}</Text>
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
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${createdPass.accessCode}`,
                }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.qrHelpText}>
              Guests can scan this at the gate for group check-in
            </Text>
          </Card>

          <Card style={styles.detailsCard}>
            <DetailRow label="Event Name" value={createdPass.eventName} />
            <DetailRow label="Date" value={formatDate(createdPass.visitDate)} />
            <DetailRow
              label="Time Window"
              value={`${formatTime(createdPass.timeWindowStart)} - ${formatTime(createdPass.timeWindowEnd)}`}
            />
            <DetailRow label="Max Guest Limit" value={`${createdPass.maxEntries} guests`} />
          </Card>

          <View style={styles.buttonGroup}>
            <Button
              title="📤 Share Pass to Group"
              onPress={sharePass}
              variant="primary"
              fullWidth
            />
            <Button
              title="Create Another Event"
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
          <Text style={styles.title}>Create Event Pass</Text>
          <Text style={styles.subtitle}>
            Generates one code/QR pass that can admit multiple expected guests
          </Text>

          <View style={styles.form}>
            <Input
              label="Event Name *"
              value={eventName}
              onChangeText={(text) => {
                setEventName(text);
                if (errors.eventName) setErrors(prev => ({ ...prev, eventName: '' }));
              }}
              placeholder="e.g. Birthday Party, Housewarming"
              error={errors.eventName}
            />

            {/* Date Input */}
            {Platform.OS === 'web' ? (
              <Input
                label="Date *"
                value={visitDate}
                onChangeText={(text) => {
                  setVisitDate(text);
                  if (errors.visitDate) setErrors(prev => ({ ...prev, visitDate: '' }));
                }}
                placeholder="YYYY-MM-DD"
                error={errors.visitDate}
                type="date"
              />
            ) : (
              <TouchableOpacity
                onPress={() => setShowDatePicker(true)}
                activeOpacity={0.8}
              >
                <View pointerEvents="none">
                  <Input
                    label="Date *"
                    value={visitDate ? formatDate(visitDate) : ''}
                    placeholder="Select date"
                    editable={false}
                    error={errors.visitDate}
                  />
                </View>
              </TouchableOpacity>
            )}

            {/* Date Picker Overlay for Native */}
            {showDatePicker && Platform.OS !== 'web' && (
              <DateTimePicker
                value={dateValue}
                mode="date"
                display="default"
                minimumDate={new Date()}
                onChange={handleDateChange}
              />
            )}

            {/* Time Pickers */}
            <View style={styles.timeRow}>
              <View style={styles.timeCol}>
                {Platform.OS === 'web' ? (
                  <Input
                    label="Start Time *"
                    value={timeStart}
                    onChangeText={(text) => {
                      setTimeStart(text);
                      if (errors.timeStart) setErrors(prev => ({ ...prev, timeStart: '' }));
                    }}
                    placeholder="HH:MM"
                    error={errors.timeStart}
                    type="time"
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowStartTimePicker(true)}
                    activeOpacity={0.8}
                  >
                    <View pointerEvents="none">
                      <Input
                        label="Start Time *"
                        value={timeStart ? formatTime(timeStart) : ''}
                        placeholder="Select start"
                        editable={false}
                        error={errors.timeStart}
                      />
                    </View>
                  </TouchableOpacity>
                )}
                {showStartTimePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={startTimeValue}
                    mode="time"
                    display="default"
                    onChange={handleStartTimeChange}
                  />
                )}
              </View>

              <View style={styles.timeCol}>
                {Platform.OS === 'web' ? (
                  <Input
                    label="End Time *"
                    value={timeEnd}
                    onChangeText={(text) => {
                      setTimeEnd(text);
                      if (errors.timeEnd) setErrors(prev => ({ ...prev, timeEnd: '' }));
                    }}
                    placeholder="HH:MM"
                    error={errors.timeEnd}
                    type="time"
                  />
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowEndTimePicker(true)}
                    activeOpacity={0.8}
                  >
                    <View pointerEvents="none">
                      <Input
                        label="End Time *"
                        value={timeEnd ? formatTime(timeEnd) : ''}
                        placeholder="Select end"
                        editable={false}
                        error={errors.timeEnd}
                      />
                    </View>
                  </TouchableOpacity>
                )}
                {showEndTimePicker && Platform.OS !== 'web' && (
                  <DateTimePicker
                    value={endTimeValue}
                    mode="time"
                    display="default"
                    onChange={handleEndTimeChange}
                  />
                )}
              </View>
            </View>

            <Input
              label="Expected Guest Limit"
              value={maxEntries}
              onChangeText={(text) => {
                setMaxEntries(text.replace(/[^0-9]/g, ''));
                if (errors.maxEntries) setErrors(prev => ({ ...prev, maxEntries: '' }));
              }}
              placeholder="e.g. 15"
              keyboardType="number-pad"
              error={errors.maxEntries}
            />

            <Button
              title="Create Event Pass"
              onPress={handleCreate}
              loading={loading}
              style={styles.createButton}
              fullWidth
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

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
    padding: spacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
    width: '100%',
  },
  timeCol: {
    flex: 1,
  },
  createButton: {
    marginTop: spacing.lg,
  },
  successContent: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successEmoji: {
    fontSize: 40,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  successSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  codeCard: {
    width: '100%',
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  codeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  accessCode: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  copyButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  copyButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
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
  },
  detailsCard: {
    width: '100%',
    padding: spacing.md,
    marginBottom: spacing.xl,
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

export default CreateEventPassScreen;
