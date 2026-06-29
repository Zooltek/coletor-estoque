import React from 'react';
import ScannerView from './ScannerView';
import ScannerOverlay from './ScannerOverlay';

const ScannerCameraArea = React.memo(({ onScan, pipelineRef, subscribePipeline }) => {
  return (
    <div className="scanner-camera-area">
      <ScannerView onScan={onScan} />
      <ScannerOverlay pipelineRef={pipelineRef} subscribePipeline={subscribePipeline} />
    </div>
  );
});

export default ScannerCameraArea;
