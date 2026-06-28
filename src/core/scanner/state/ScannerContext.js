import { ScannerState } from './ScannerState';

export class ScannerContext {
  constructor() {
    this.currentState = ScannerState.IDLE;
    this.previousState = null;
    this.sessionId = Date.now().toString();
    this.startedAt = Date.now();
    this.lastBarcode = null;
    this.lastAcceptedBarcode = null;
    this.lastTransition = Date.now();
    this.transitionCount = 0;
    this.error = null;
    this.cooldownUntil = null;
  }
}
