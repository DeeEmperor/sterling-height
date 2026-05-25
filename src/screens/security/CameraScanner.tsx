import React from 'react';

interface CameraScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanned: (code: string) => void;
  onError: (error: string) => void;
}

export const CameraScanner: React.FC<CameraScannerProps> = () => {
  // Fallback for Web. Web QR Simulator is used instead.
  return null;
};
