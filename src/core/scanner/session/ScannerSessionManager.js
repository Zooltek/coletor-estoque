import ScannerSession from './ScannerSession';
import ScannerSessionState from './ScannerSessionState';
import ScannerSessionMetrics from './ScannerSessionMetrics';
import ScannerSessionSnapshot from './ScannerSessionSnapshot';
import ScannerSessionEvent from './ScannerSessionEvent';
import ScannerSessionLogger from './ScannerSessionLogger';
import { PipelineResult } from '../pipeline';

class ScannerSessionManager {
  constructor() {
    this.session = null;
    this.state = null;
    this.metrics = null;
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    // Send immediate snapshot on subscribe
    if (this.session) {
      listener(ScannerSessionEvent.SESSION_UPDATED, this.getSnapshot());
    }
    return () => this.listeners.delete(listener);
  }

  _emit(event) {
    const snapshot = this.getSnapshot();
    ScannerSessionLogger.log(event);
    this.listeners.forEach(listener => {
      try {
        listener(event, snapshot);
      } catch (err) {
        console.error('[ScannerSessionManager] Listener error:', err);
      }
    });
  }

  createSession(scannerType = 'html5') {
    this.session = new ScannerSession(scannerType);
    this.state = new ScannerSessionState();
    this.metrics = new ScannerSessionMetrics();
    this._emit(ScannerSessionEvent.SESSION_STARTED);
  }

  finishSession() {
    if (this.session) {
      this.session.finishedAt = Date.now();
      this._emit(ScannerSessionEvent.SESSION_FINISHED);
    }
  }

  resetSession() {
    if (this.session) {
      const type = this.session.scannerType;
      this.session = new ScannerSession(type);
      this.state = new ScannerSessionState();
      this.metrics = new ScannerSessionMetrics();
      this._emit(ScannerSessionEvent.SESSION_RESET);
    }
  }

  getSnapshot() {
    if (!this.session) return null;
    return new ScannerSessionSnapshot(this.session, this.state, this.metrics);
  }

  updateFromPipelineContext(context) {
    if (!this.session || !context) return;

    this.state.lastBarcode = context.barcode;
    this.state.lastReadTime = context.finishedAt;
    
    this.metrics.totalReads++;
    this.metrics.update(context.duration);

    switch(context.result) {
      case PipelineResult.SUCCESS:
        this.metrics.acceptedReads++;
        this.state.lastAcceptedBarcode = context.barcode;
        this.state.lastProduct = context.product;
        this.state.lastError = null;
        break;
      case PipelineResult.ERROR:
      case PipelineResult.INVALID:
        this.metrics.rejectedReads++;
        this.metrics.invalidReads++;
        this.state.lastRejectedBarcode = context.barcode;
        this.state.lastError = context.validation.errors[0]?.message || 'Leitura Inválida';
        this.state.lastProduct = null;
        break;
      case PipelineResult.DUPLICATE:
        this.metrics.duplicateReads++;
        this.state.lastError = 'Leitura Duplicada';
        break;
      default:
        break;
    }

    this._emit(ScannerSessionEvent.SESSION_UPDATED);
  }

  // Permite atualizações manuais (ex: quando o usuário digita a quantidade)
  updateState(partialState) {
    if (!this.state) return;
    Object.assign(this.state, partialState);
    this._emit(ScannerSessionEvent.SESSION_UPDATED);
  }
}

export default new ScannerSessionManager();
