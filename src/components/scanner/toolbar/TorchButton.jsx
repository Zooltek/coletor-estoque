import React from 'react';
import ToolbarButton from './ToolbarButton';

const TorchButton = React.memo(({ active, onClick, disabled }) => {
  return (
    <ToolbarButton 
      icon="🔦" 
      onClick={onClick} 
      active={active} 
      disabled={disabled} 
      title="Lanterna" 
    />
  );
});

export default TorchButton;
