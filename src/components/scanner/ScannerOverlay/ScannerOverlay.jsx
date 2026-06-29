import React, { useState, useEffect } from 'react';
import OverlayMask from './OverlayMask';
import OverlayFrame from './OverlayFrame';
import OverlayCorners from './OverlayCorners';
import OverlayAnimation from './OverlayAnimation';
import OverlayStatus from './OverlayStatus';
import { useScanner } from '../../../hooks/useScanner';
import { ScannerState } from '../../../core/scanner/state';
import './scanner-overlay.css';

const ScannerOverlay = React.memo(({ pipelineRef, subscribePipeline }) => {
  const { state: contextState } = useScanner();
  
  const [pipelineState, setPipelineState] = useState(() => 
    pipelineRef?.current ? pipelineRef.current.state : null
  );

  useEffect(() => {
    if (subscribePipeline) {
      return subscribePipeline((newState) => {
        setPipelineState(newState);
      });
    }
  }, [subscribePipeline]);

  // Use pipelineState if available and not INITIALIZING, otherwise fallback to contextState
  const visualState = (pipelineState && pipelineState !== ScannerState.INITIALIZING) 
    ? pipelineState 
    : contextState;

  return (
    <div className="so-container">
      <OverlayMask />
      <div className="so-center-area">
        <OverlayAnimation state={visualState}>
          <OverlayFrame state={visualState} />
          <OverlayCorners state={visualState} />
        </OverlayAnimation>
        <OverlayStatus state={visualState} />
      </div>
    </div>
  );
});

export default ScannerOverlay;
