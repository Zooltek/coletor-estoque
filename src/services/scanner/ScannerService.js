import { Capacitor } from '@capacitor/core';
import Html5ScannerService from './Html5ScannerService';
import NativeScannerService from './NativeScannerService';

class ScannerServiceFactory {
  constructor() {
    this.serviceInstance = null;
  }

  getService() {
    if (!this.serviceInstance) {
      if (Capacitor.isNativePlatform()) {
        console.log("ScannerService: Carregando NativeScannerService");
        this.serviceInstance = new NativeScannerService();
      } else {
        console.log("ScannerService: Carregando Html5ScannerService");
        this.serviceInstance = new Html5ScannerService();
      }
    }
    return this.serviceInstance;
  }
}

const ScannerService = new ScannerServiceFactory().getService();
export default ScannerService;
