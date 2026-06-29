import { useCallback, useContext } from 'react';
import ToolbarService from '../services/toolbar/ToolbarService';
import { ToolbarContext } from '../contexts/ToolbarContext';

export function useToolbar({ onClose, pipelineState }) {
  const context = useContext(ToolbarContext);
  if (!context) throw new Error('useToolbar must be within ToolbarProvider');

  // Extrai funções e capacidades brutas do serviço de scanner
  const { 
    zoomLevel, 
    setZoom, 
    torchActive, 
    toggleTorch, 
    capabilities 
  } = context;

  const torchAvailable = capabilities?.torch ?? false;
  const zoomAvailable = capabilities?.zoom ?? false;

  const handleTorchToggle = useCallback(() => {
    if (torchAvailable) {
      ToolbarService.handleTorch(toggleTorch, torchActive);
    }
  }, [torchAvailable, toggleTorch, torchActive]);

  const handleZoomIn = useCallback(() => {
    if (zoomAvailable) {
      ToolbarService.handleZoom(setZoom, zoomLevel, 0.5);
    }
  }, [zoomAvailable, setZoom, zoomLevel]);

  const handleZoomOut = useCallback(() => {
    if (zoomAvailable) {
      ToolbarService.handleZoom(setZoom, zoomLevel, -0.5);
    }
  }, [zoomAvailable, setZoom, zoomLevel]);

  const handleSettings = useCallback(() => {
    ToolbarService.openSettings();
  }, []);

  const handleClose = useCallback(() => {
    ToolbarService.closeScanner(onClose);
  }, [onClose]);

  return {
    pipelineState,
    
    torchAvailable,
    torchActive,
    handleTorchToggle,
    
    zoomAvailable,
    zoomLevel,
    handleZoomIn,
    handleZoomOut,
    
    handleSettings,
    handleClose
  };
}
