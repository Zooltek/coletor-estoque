import React from 'react';
import ScannerView from './ScannerView';
import ScannerOverlay from './ScannerOverlay';

export default function ScannerCameraArea({ onScan, showFeedback }) {
  return (
    <div className="scanner-camera-area">
      <ScannerView onScan={onScan} />
      <ScannerOverlay showFeedback={showFeedback} />
    </div>
  );
}
