import { PluginListenerHandle } from '@capacitor/core';
import { BarcodeScannerPlugin } from '../scanner/definitions';

class SmartLightService {
  constructor() {
    this.listeners = new Map();
  }

  async listenToTorchChanges(callback) {
    const handle = await BarcodeScannerPlugin.addListener('torchChanged', (data) => {
      callback(data.torchActive);
    });
    this.listeners.set('torchChanged', handle);
    return handle;
  }

  async removeListener(eventName) {
    const handle = this.listeners.get(eventName);
    if (handle) {
      await handle.remove();
      this.listeners.delete(eventName);
    }
  }
}

export default new SmartLightService();
