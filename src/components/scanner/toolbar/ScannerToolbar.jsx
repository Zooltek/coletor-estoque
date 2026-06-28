import React from 'react';
import { useToolbar } from '../../../hooks/useToolbar';
import ScannerStatusIndicator from './ScannerStatusIndicator';
import TorchButton from './TorchButton';
import ZoomButton from './ZoomButton';
import SettingsButton from './SettingsButton';
import CloseButton from './CloseButton';
import ToolbarDivider from './ToolbarDivider';
import './toolbar.css';

const ScannerToolbar = React.memo(({ title, onClose, pipelineState }) => {
  const {
    torchAvailable,
    torchActive,
    handleTorchToggle,
    zoomAvailable,
    handleZoomIn,
    handleZoomOut,
    handleSettings,
    handleClose
  } = useToolbar({ onClose, pipelineState });

  return (
    <div className="scanner-hud-toolbar">
      <div className="toolbar-left">
        <span className="toolbar-title">← {title || 'Inventário'}</span>
      </div>
      
      <div className="toolbar-center">
        <ScannerStatusIndicator pipelineState={pipelineState} />
      </div>

      <div className="toolbar-right">
        <TorchButton 
          active={torchActive} 
          onClick={handleTorchToggle} 
          disabled={!torchAvailable} 
        />
        <ToolbarDivider />
        
        <ZoomButton 
          onZoomIn={handleZoomIn} 
          onZoomOut={handleZoomOut} 
          disabled={!zoomAvailable} 
        />
        <ToolbarDivider />
        
        <SettingsButton onClick={handleSettings} />
        <CloseButton onClick={handleClose} />
      </div>
    </div>
  );
});

export default ScannerToolbar;
