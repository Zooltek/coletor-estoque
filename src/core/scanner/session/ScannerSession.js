export default class ScannerSession {
  constructor(scannerType = 'html5') {
    this.sessionId = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
    this.startedAt = Date.now();
    this.finishedAt = null;
    this.scannerType = scannerType;
    this.device = navigator ? navigator.userAgent : 'Unknown';
    this.camera = 'environment';
  }
}
