import { PluginListenerHandle } from '@capacitor/core';
import { BarcodeScannerPlugin } from '../scanner/definitions';

class SmartZoomService {
  constructor() {
    this.listeners = new Map();
  }

  async listenToZoomChanges(callback) {
    const handle = await BarcodeScannerPlugin.addListener('zoomChanged', (data) => {
      callback(data.zoomLevel);
    });
    this.listeners.set('zoomChanged', handle);
    return handle;
  }

  async removeListener(eventName) {
    const handle = this.listeners.get(eventName);
    if (handle) {
      await handle.remove();
      this.listeners.delete(eventName);
    }
  }

  async getMetrics() {
    try {
      return await BarcodeScannerPlugin.getCameraMetrics();
    } catch (e) {
      console.warn("Métricas de câmera indisponíveis:", e);
      return null;
    }
  }
}

export default new SmartZoomService();
