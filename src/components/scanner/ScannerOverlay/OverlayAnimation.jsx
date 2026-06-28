import React from 'react';
import { ScannerState } from '../../../core/scanner/state';

const OverlayAnimation = React.memo(({ state, children }) => {
  const getAnimationClass = () => {
    switch (state) {
      case ScannerState.READY: return 'anim-fade-in';
      case ScannerState.DETECTING: 
      case ScannerState.PROCESSING: return 'anim-pulse';
      case ScannerState.SUCCESS: return 'anim-glow-success';
      case ScannerState.ERROR: return 'anim-shake-error';
      default: return '';
    }
  };

  return (
    <div className={`so-animation-wrapper ${getAnimationClass()}`}>
      {children}
    </div>
  );
});

export default OverlayAnimation;
