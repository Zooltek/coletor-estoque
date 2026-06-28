import React from 'react';

const OverlayAnimation = React.memo(({ state, children }) => {
  const getAnimationClass = () => {
    switch (state) {
      case 'READY': return 'anim-fade-in';
      case 'SCANNING': return 'anim-pulse';
      case 'SUCCESS': return 'anim-glow-success';
      case 'ERROR': return 'anim-shake-error';
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
