import { useCallback } from 'react';
import ToolbarService from '../services/toolbar/ToolbarService';
import { useScanner } from './useScanner';

export function useToolbar({ onClose, pipelineState }) {
  // Extrai funções e capacidades brutas do serviço de scanner
  const { 
    zoomLevel, 
    setZoom, 
    torchActive, 
    toggleTorch, 
    capabilities 
  } = useScanner();

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
