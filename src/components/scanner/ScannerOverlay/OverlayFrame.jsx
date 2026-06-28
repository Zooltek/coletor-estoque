import React from 'react';
import { ScannerState } from '../../../core/scanner/state';

const OverlayFrame = React.memo(({ state }) => {
  const isAnimating = state === ScannerState.DETECTING || state === ScannerState.PROCESSING || state === ScannerState.READY || state === ScannerState.INITIALIZING;
  
  return (
    <div className={`so-frame state-${state.toLowerCase()}`}>
      {isAnimating && <div className="so-scan-line"></div>}
    </div>
  );
});

export default OverlayFrame;
