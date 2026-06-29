import { registerPlugin } from '@capacitor/core';

const BarcodeScannerPlugin = registerPlugin('BarcodeScannerPlugin');

class AndroidPerformanceService {
  async getPerformance() {
    try {
      return await BarcodeScannerPlugin.getPerformance();
    } catch (e) {
      console.warn("Performance metrics not available:", e);
      return null;
    }
  }

  async getMemory() {
    try {
      return await BarcodeScannerPlugin.getMemory();
    } catch (e) {
      return null;
    }
  }

  async getBattery() {
    try {
      return await BarcodeScannerPlugin.getBattery();
    } catch (e) {
      return null;
    }
  }

  async getThermal() {
    try {
      return await BarcodeScannerPlugin.getThermal();
    } catch (e) {
      return null;
    }
  }
}

export default new AndroidPerformanceService();
