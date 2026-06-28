export default class ScannerSessionState {
  constructor() {
    this.currentState = 'READY';
    this.lastBarcode = null;
    this.lastAcceptedBarcode = null;
    this.lastRejectedBarcode = null;
    this.lastProduct = null;
    this.lastQuantity = 1;
    this.lastReadTime = null;
    this.lastError = null;
    this.cooldownUntil = 0;
  }
}
