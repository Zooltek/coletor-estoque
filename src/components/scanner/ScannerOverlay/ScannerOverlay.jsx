import React from 'react';
import OverlayMask from './OverlayMask';
import OverlayFrame from './OverlayFrame';
import OverlayCorners from './OverlayCorners';
import OverlayAnimation from './OverlayAnimation';
import OverlayStatus from './OverlayStatus';
import { useScanner } from '../../../hooks/useScanner';
import './scanner-overlay.css';

export default function ScannerOverlay({ pipelineState }) {
  const { state: contextState } = useScanner();
  
  // Use pipelineState if provided, otherwise fallback to contextState
  const visualState = pipelineState && pipelineState !== 'INITIALIZING' ? pipelineState : contextState;

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
}
