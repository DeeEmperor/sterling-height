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
  Platform,
  Modal,
  TouchableOpacity,
} from 'react-native';
import { Button, Card, StatusBadge } from '../../components';
import { colors } from '../../theme/colors';
import { spacing, borderRadius, shadows } from '../../theme';
import { visitorService } from '../../services';
import { formatDate, formatTime } from '../../utils/helpers';
import { Visitor } from '../../types';
import { CameraScanner } from './CameraScanner';

const CODE_LENGTH = 6;

export const VerifyVisitorScreen: React.FC = () => {
  const [code, setCode] = useState<string[]>(new Array(CODE_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [visitor, setVisitor] = useState<Visitor | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOutdated, setIsOutdated] = useState(false);
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [modalAction, setModalAction] = useState<'entered' | 'denied' | null>(null);
  const [processedVisitor, setProcessedVisitor] = useState<Visitor | null>(null);
  const [scannerVisible, setScannerVisible] = useState(false);
  const [mockScannerVisible, setMockScannerVisible] = useState(false);
  const [mockScannedCode, setMockScannedCode] = useState('');
  
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
      
      if (result.visitor) {
        setVisitor(result.visitor);
        if (!result.success) {
          setIsOutdated(true);
          setError(result.message);
        } else {
          setIsOutdated(false);
        }
      } else {
        setError(result.message);
        setIsOutdated(false);
      }
    } catch (err) {
      setError('Failed to verify code');
      setIsOutdated(false);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenScanner = () => {
    setError(null);
    if (Platform.OS === 'web') {
      setMockScannerVisible(true);
    } else {
      setScannerVisible(true);
    }
  };

  const handleBarcodeScanned = (scannedCode: string) => {
    if (/^\d{6}$/.test(scannedCode)) {
      setScannerVisible(false);
      setCode(scannedCode.split(''));
      handleVerify(scannedCode);
    } else {
      setScannerVisible(false);
      setError(`Scanned invalid code: "${scannedCode}". Please scan a 6-digit access code.`);
    }
  };

  const handleAction = async (action: 'entered' | 'denied') => {
    if (!visitor) return;

    setLoading(true);
    try {
      const result = await visitorService.updateVisitorStatus(visitor.id, action);
      
      if (result.success) {
        setProcessedVisitor(visitor);
        setModalAction(action);
        setSuccessModalVisible(true);
      } else {
        if (Platform.OS === 'web') {
          window.alert(result.message);
        } else {
          Alert.alert('Error', result.message);
        }
      }
    } catch (err) {
      if (Platform.OS === 'web') {
        window.alert('Failed to update visitor status');
      } else {
        Alert.alert('Error', 'Failed to update visitor status');
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCode(new Array(CODE_LENGTH).fill(''));
    setVisitor(null);
    setError(null);
    setIsOutdated(false);
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

        {error && !visitor && <Text style={styles.errorText}>{error}</Text>}

        <Button
          title="Verify Code"
          onPress={() => handleVerify()}
          loading={loading && !visitor}
          fullWidth
          size="large"
          style={styles.verifyButton}
        />

        <Button
          title="📷 Scan QR Code"
          onPress={handleOpenScanner}
          variant="outline"
          fullWidth
          size="large"
          style={styles.scanButton}
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

            {isOutdated && (
              <View style={styles.outdatedWarning}>
                <Text style={styles.outdatedWarningTitle}>⚠️ INVALID DATE</Text>
                <Text style={styles.outdatedWarningText}>
                  This visit was scheduled for {formatDate(visitor.visitDate)} (not today).
                  Please decline entry.
                </Text>
              </View>
            )}

            {/* Action Buttons */}
            {visitor.status === 'pending' && (
              <View style={styles.actionButtons}>
                {!isOutdated && (
                  <Button
                    title="✓ Mark ENTERED"
                    onPress={() => handleAction('entered')}
                    loading={loading}
                    size="large"
                    style={styles.enterButton}
                    fullWidth
                  />
                )}
                <Button
                  title={isOutdated ? "✗ Decline Entry (Mark DENIED)" : "✗ Mark DENIED"}
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

      {/* Success Modal */}
      <Modal
        visible={successModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSuccessModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.successModalCard}>
            <View style={[
              styles.modalIconContainer,
              modalAction === 'entered' ? styles.iconSuccess : styles.iconDanger
            ]}>
              <Text style={styles.modalIconEmoji}>
                {modalAction === 'entered' ? '✅' : '❌'}
              </Text>
            </View>

            <Text style={styles.modalSuccessTitle}>
              {modalAction === 'entered' ? 'Visitor Admitted' : 'Entry Declined'}
            </Text>
            
            <Text style={styles.modalSuccessSubtitle}>
              {processedVisitor ? `${processedVisitor.name} has been marked as ${modalAction === 'entered' ? 'entered' : 'denied'}.` : ''}
            </Text>

            {processedVisitor && (
              <View style={styles.modalDetails}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Resident</Text>
                  <Text style={styles.modalDetailValue}>{processedVisitor.residentName}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalDetailLabel}>Unit</Text>
                  <Text style={styles.modalDetailValue}>{processedVisitor.unitNumber}</Text>
                </View>
                {modalAction === 'entered' && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalDetailLabel}>Time</Text>
                    <Text style={styles.modalDetailValue}>
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                )}
              </View>
            )}

            <Button
              title="Done"
              onPress={() => {
                setSuccessModalVisible(false);
                setCode(new Array(CODE_LENGTH).fill(''));
                setVisitor(null);
                setProcessedVisitor(null);
                setModalAction(null);
                setTimeout(() => {
                  inputRefs.current[0]?.focus();
                }, 100);
              }}
              fullWidth
              size="large"
              style={modalAction === 'entered' ? styles.modalDoneButtonSuccess : styles.modalDoneButtonDanger}
            />
          </Card>
        </View>
      </Modal>

      {/* Native Camera Scanner Modal */}
      <CameraScanner
        visible={scannerVisible}
        onClose={() => setScannerVisible(false)}
        onScanned={handleBarcodeScanned}
        onError={(err) => setError(err)}
      />

      {/* Web Simulator Mock QR Scanner Modal */}
      <Modal
        visible={mockScannerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMockScannerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.mockScannerCard}>
            <Text style={styles.mockScannerTitle}>Web QR Simulator</Text>
            <Text style={styles.mockScannerSubtitle}>
              Simulate scanning by entering the 6-digit access code below:
            </Text>

            <TextInput
              style={styles.mockScannerInput}
              placeholder="e.g. 169512"
              value={mockScannedCode}
              onChangeText={(text) => {
                const cleaned = text.replace(/\D/g, '').slice(0, 6);
                setMockScannedCode(cleaned);
              }}
              keyboardType="number-pad"
              maxLength={6}
            />

            <View style={styles.mockScannerButtons}>
              <Button
                title="Cancel"
                onPress={() => {
                  setMockScannerVisible(false);
                  setMockScannedCode('');
                }}
                variant="outline"
                style={{ flex: 1 }}
              />
              <Button
                title="Simulate Scan"
                onPress={() => {
                  if (mockScannedCode.length === 6) {
                    setMockScannerVisible(false);
                    setCode(mockScannedCode.split(''));
                    handleVerify(mockScannedCode);
                    setMockScannedCode('');
                  } else {
                    Alert.alert('Error', 'Please enter a valid 6-digit code');
                  }
                }}
                style={{ flex: 1 }}
              />
            </View>
          </Card>
        </View>
      </Modal>
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
  outdatedWarning: {
    backgroundColor: '#FFEBE9',
    borderColor: '#FFC1C0',
    borderWidth: 1,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  outdatedWarningTitle: {
    color: colors.error,
    fontWeight: '700',
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  outdatedWarningText: {
    color: '#651E1B',
    fontSize: 14,
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  successModalCard: {
    width: '90%',
    maxWidth: 400,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.large,
  },
  modalIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconSuccess: {
    backgroundColor: '#E8F5E9',
    borderColor: '#A5D6A7',
    borderWidth: 2,
  },
  iconDanger: {
    backgroundColor: '#FFEBEE',
    borderColor: '#EF9A9A',
    borderWidth: 2,
  },
  modalIconEmoji: {
    fontSize: 40,
  },
  modalSuccessTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  modalSuccessSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  modalDetails: {
    width: '100%',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  modalDetailLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  modalDetailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  modalDoneButtonSuccess: {
    backgroundColor: colors.success,
  },
  modalDoneButtonDanger: {
    backgroundColor: colors.error,
  },
  scanButton: {
    marginTop: spacing.md,
  },
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scannerHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    backgroundColor: '#1C1C1E',
  },
  scannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scannerCloseButton: {
    padding: spacing.sm,
  },
  scannerCloseText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  cameraWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  scanTargetFrame: {
    width: 250,
    height: 250,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanTargetCornerTL: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#722F37',
  },
  scanTargetCornerTR: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 40,
    height: 40,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#722F37',
  },
  scanTargetCornerBL: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#722F37',
  },
  scanTargetCornerBR: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#722F37',
  },
  scannerFooter: {
    padding: spacing.xl,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  scannerInstructions: {
    color: '#AEAEB2',
    fontSize: 14,
    textAlign: 'center',
  },
  mockScannerCard: {
    width: '90%',
    maxWidth: 400,
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.large,
  },
  mockScannerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  mockScannerSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  mockScannerInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: 20,
    textAlign: 'center',
    letterSpacing: 8,
    color: colors.text,
    backgroundColor: colors.background,
    marginBottom: spacing.lg,
  },
  mockScannerButtons: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});

export default VerifyVisitorScreen;
