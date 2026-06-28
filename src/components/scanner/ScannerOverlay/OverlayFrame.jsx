import React from 'react';

const OverlayFrame = React.memo(({ state }) => {
  const isAnimating = state === 'SCANNING' || state === 'READY' || state === 'INITIALIZING';
  
  return (
    <div className={`so-frame state-${state.toLowerCase()}`}>
      {isAnimating && <div className="so-scan-line"></div>}
    </div>
  );
});

export default OverlayFrame;
