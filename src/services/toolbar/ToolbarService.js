class ToolbarService {
  constructor() {
    // Pode manter referências se necessário no futuro
  }

  handleTorch(toggleTorch, currentState) {
    if (toggleTorch) {
      const newState = !currentState;
      toggleTorch(newState);
      console.log(`Torch ${newState ? 'Enabled' : 'Disabled'}`);
    }
  }

  handleZoom(setZoom, currentZoom, step, maxZoom = 3, minZoom = 1) {
    if (setZoom) {
      let newZoom = currentZoom + step;
      if (newZoom > maxZoom) newZoom = maxZoom;
      if (newZoom < minZoom) newZoom = minZoom;

      if (newZoom !== currentZoom) {
        setZoom(newZoom);
        console.log(`Zoom ${step > 0 ? '+' : '-'}`);
      }
    }
  }

  openSettings() {
    console.log('OPEN_SCANNER_SETTINGS');
    // Futura integração com modal ou tela de config
  }

  closeScanner(onClose) {
    console.log('Close Scanner');
    if (onClose) {
      onClose();
    }
  }
}

export default new ToolbarService();
