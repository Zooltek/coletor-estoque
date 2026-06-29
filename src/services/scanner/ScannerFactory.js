import ScannerDetector from './ScannerDetector';
import NativeScannerAdapter from './NativeScannerAdapter';
import Html5ScannerService from './Html5ScannerService';

class ScannerFactory {
  constructor() {
    this.scannerInstance = null;
    this.initializationPromise = null;
  }

  async getScanner() {
    if (this.scannerInstance) {
      return this.scannerInstance;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = (async () => {
      const type = await ScannerDetector.detectBestScanner();
      
      if (type === 'NATIVE') {
        console.log("ScannerFactory: Selecionando NativeScannerAdapter (ML Kit)");
        this.scannerInstance = new NativeScannerAdapter();
      } else {
        console.log("ScannerFactory: Selecionando Html5ScannerService (Fallback)");
        this.scannerInstance = new Html5ScannerService();
      }
      
      return this.scannerInstance;
    })();

    return this.initializationPromise;
  }
}

export default new ScannerFactory();
