import React from 'react';
import ScannerView from './ScannerView';
import ScannerOverlay from './ScannerOverlay';

export default function ScannerCameraArea({ onScan, pipelineState }) {
  return (
    <div className="scanner-camera-area">
      <ScannerView onScan={onScan} />
      <ScannerOverlay pipelineState={pipelineState} />
    </div>
  );
}
