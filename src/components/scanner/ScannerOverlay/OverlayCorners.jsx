import React from 'react';

const OverlayCorners = React.memo(({ state }) => {
  return (
    <div className={`so-corners state-${state.toLowerCase()}`}>
      <div className="so-corner top-left"></div>
      <div className="so-corner top-right"></div>
      <div className="so-corner bottom-left"></div>
      <div className="so-corner bottom-right"></div>
    </div>
  );
});

export default OverlayCorners;
