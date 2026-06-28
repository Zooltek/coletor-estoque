import React from 'react';
import ToolbarButton from './ToolbarButton';

const ZoomButton = React.memo(({ onZoomIn, onZoomOut, disabled }) => {
  return (
    <>
      <ToolbarButton 
        icon="➖" 
        onClick={onZoomOut} 
        disabled={disabled} 
        title="Zoom Out" 
      />
      <ToolbarButton 
        icon="➕" 
        onClick={onZoomIn} 
        disabled={disabled} 
        title="Zoom In" 
      />
    </>
  );
});

export default ZoomButton;
