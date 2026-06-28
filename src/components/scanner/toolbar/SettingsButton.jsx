import React from 'react';
import ToolbarButton from './ToolbarButton';

const SettingsButton = React.memo(({ onClick }) => {
  return (
    <ToolbarButton 
      icon="⚙️" 
      onClick={onClick} 
      title="Configurações" 
    />
  );
});

export default SettingsButton;
