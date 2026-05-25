import React, { useState, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';

interface CameraScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (code: string) => void;
  onError: (error: string) => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = ({
  visible,
  onClose,
  onScanned,
  onError,
}) => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [hasScanned, setHasScanned] = useState(false);

  // Request permission via static API when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setHasScanned(false);
      setHasPermission(null);

      (async () => {
        const { status } = await Camera.requestCameraPermissionsAsync();
        if (status === 'granted') {
          setHasPermission(true);
        } else {
          setHasPermission(false);
          onError('Camera permission is required to scan QR codes');
          onClose();
        }
      })();
    }
  }, [visible]);

  const handleBarcodeScanned = useCallback(
    (scanningResult: { data: string }) => {
      if (hasScanned) return;
      setHasScanned(true);
      const scannedCode = scanningResult.data?.trim();
      onScanned(scannedCode);
    },
    [hasScanned, onScanned],
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.scannerContainer}>
        <View style={styles.scannerHeader}>
          <Text style={styles.scannerTitle}>Scan Visitor QR Code</Text>
          <TouchableOpacity onPress={onClose} style={styles.scannerCloseButton}>
            <Text style={styles.scannerCloseText}>Close</Text>
          </TouchableOpacity>
        </View>

        {hasPermission === true ? (
          <View style={styles.cameraWrapper}>
            <CameraView
              style={StyleSheet.absoluteFillObject}
              facing="back"
              onBarcodeScanned={hasScanned ? undefined : handleBarcodeScanned}
            />
            <View style={styles.scanTargetFrame}>
              <View style={styles.scanTargetCornerTL} />
              <View style={styles.scanTargetCornerTR} />
              <View style={styles.scanTargetCornerBL} />
              <View style={styles.scanTargetCornerBR} />
            </View>
          </View>
        ) : (
          <View style={styles.permissionWrapper}>
            <ActivityIndicator size="large" color="#E0A96D" />
            <Text style={styles.permissionText}>
              {hasPermission === null
                ? 'Requesting camera permission...'
                : 'Camera permission denied'}
            </Text>
          </View>
        )}

        <View style={styles.scannerFooter}>
          <Text style={styles.scannerInstructions}>
            Position the visitor's QR code inside the frame
          </Text>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  scannerContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scannerHeader: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#1C1C1E',
  },
  scannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scannerCloseButton: {
    padding: 8,
  },
  scannerCloseText: {
    color: '#E0A96D',
    fontSize: 16,
    fontWeight: '600',
  },
  cameraWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  permissionWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  permissionText: {
    color: '#AEAEB2',
    fontSize: 16,
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
    padding: 24,
    backgroundColor: '#1C1C1E',
    alignItems: 'center',
  },
  scannerInstructions: {
    color: '#AEAEB2',
    fontSize: 14,
    textAlign: 'center',
  },
});
