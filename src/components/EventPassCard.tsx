/**
 * Event Pass Card Component
 * Displays event group pass details with guest limits, sharing, and a QR code modal.
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Share,
  Modal,
  Image,
} from 'react-native';
import { colors } from '../theme/colors';
import { borderRadius, spacing, shadows } from '../theme';
import { EventPass } from '../types';
import { formatDate, formatTime } from '../utils/helpers';
import { Card } from './Card';
import { Button } from './Button';

interface EventPassCardProps {
  eventPass: EventPass;
}

export const EventPassCard: React.FC<EventPassCardProps> = ({ eventPass }) => {
  const [qrModalVisible, setQrModalVisible] = useState(false);

  const getStatusStyle = (status: 'active' | 'exhausted') => {
    if (status === 'active') {
      return { bg: colors.successLight, text: '#065F46' };
    }
    return { bg: colors.errorLight, text: colors.error };
  };

  const statusStyle = getStatusStyle(eventPass.status);

  const sharePass = async () => {
    try {
      const message = `🎉 Event Group Pass — Sterling Height Estate\n\nHi everyone! Here is the group access pass for "${eventPass.eventName}".\n\n📅 Date: ${formatDate(eventPass.visitDate)}\n🕐 Time: ${formatTime(eventPass.timeWindowStart)} - ${formatTime(eventPass.timeWindowEnd)}\n🔑 Access Code: ${eventPass.accessCode}\n👥 Expected entries limit: ${eventPass.maxEntries}\n\n📱 Scan QR Code at gate:\nhttps://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${eventPass.accessCode}\n\nPlease show this code or QR code to gate security when entering.`;
      await Share.share({ message });
    } catch (error) {
      console.error('Error sharing event pass:', error);
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.name}>🎉 Event: {eventPass.eventName}</Text>
        <View style={[styles.badge, { backgroundColor: statusStyle.bg }]}>
          <Text style={[styles.badgeText, { color: statusStyle.text }]}>
            {eventPass.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          📅 {formatDate(eventPass.visitDate)}
        </Text>
        <Text style={styles.detailText}>
          🕐 {formatTime(eventPass.timeWindowStart)} - {formatTime(eventPass.timeWindowEnd)}
        </Text>
        <Text style={styles.detailText}>
          👥 {eventPass.entriesUsed} of {eventPass.maxEntries} guests checked in
        </Text>
      </View>

      <View style={styles.codeContainer}>
        <Text style={styles.codeLabel}>Event Access Code</Text>
        <Text style={styles.code}>{eventPass.accessCode}</Text>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity
            style={[styles.actionButton, styles.shareBtn]}
            onPress={sharePass}
            activeOpacity={0.7}
          >
            <Text style={styles.shareBtnText}>📤 Share Pass</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.qrBtn]}
            onPress={() => setQrModalVisible(true)}
            activeOpacity={0.7}
          >
            <Text style={styles.qrBtnText}>📷 QR Code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* QR Code Viewer Modal */}
      <Modal
        visible={qrModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Card style={styles.modalCard}>
            <Text style={styles.modalTitle}>🎉 {eventPass.eventName}</Text>
            <Text style={styles.modalSubtitle}>Event Access Pass</Text>

            <View style={styles.qrWrapper}>
              <Image
                source={{
                  uri: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${eventPass.accessCode}`,
                }}
                style={styles.qrImage}
                resizeMode="contain"
              />
            </View>

            <Text style={styles.modalCodeLabel}>Access Code</Text>
            <Text style={styles.modalCodeValue}>{eventPass.accessCode}</Text>

            <Text style={styles.modalHelpText}>
              Share this QR Code or 6-digit access code with all expected guests. Gate security can scan it directly.
            </Text>

            <View style={styles.modalButtons}>
              <Button
                title="📤 Share Pass"
                onPress={sharePass}
                style={styles.modalShareBtn}
              />
              <Button
                title="Close"
                onPress={() => setQrModalVisible(false)}
                variant="outline"
                style={styles.modalCloseBtn}
              />
            </View>
          </Card>
        </View>
      </Modal>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    flex: 1,
  },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  details: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  detailText: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  codeContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
  },
  codeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  code: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtn: {
    backgroundColor: colors.primary,
  },
  shareBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  qrBtn: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrBtnText: {
    color: colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    padding: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    ...shadows.large,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.xs,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  qrWrapper: {
    backgroundColor: '#FFFFFF',
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderLight,
    marginBottom: spacing.md,
    ...shadows.small,
  },
  qrImage: {
    width: 200,
    height: 200,
  },
  modalCodeLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  modalCodeValue: {
    fontSize: 30,
    fontWeight: '700',
    color: colors.primary,
    letterSpacing: 4,
    marginBottom: spacing.md,
  },
  modalHelpText: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: spacing.lg,
  },
  modalButtons: {
    width: '100%',
    gap: spacing.md,
  },
  modalShareBtn: {
    width: '100%',
  },
  modalCloseBtn: {
    width: '100%',
  },
});

export default EventPassCard;
