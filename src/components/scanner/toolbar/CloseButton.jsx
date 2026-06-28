import React from 'react';
import ToolbarButton from './ToolbarButton';

const CloseButton = React.memo(({ onClick }) => {
  return (
    <ToolbarButton 
      icon="✕" 
      onClick={onClick} 
      title="Fechar" 
    />
  );
});

export default CloseButton;
