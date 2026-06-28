import React from 'react';
import OverlayMask from './OverlayMask';
import OverlayFrame from './OverlayFrame';
import OverlayCorners from './OverlayCorners';
import OverlayAnimation from './OverlayAnimation';
import OverlayStatus from './OverlayStatus';
import { useScanner } from '../../../hooks/useScanner';
import './scanner-overlay.css';

export default function ScannerOverlay({ showFeedback }) {
  const { state } = useScanner();
  
  // Se houver feedback de bipagem externo, podemos forçar o estado para SUCCESS visualmente
  const visualState = showFeedback ? 'SUCCESS' : state;

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
