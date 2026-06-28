import { ScannerState } from './ScannerState';
import { ScannerContext } from './ScannerContext';
import { StateValidator } from './StateValidator';
import { StateLogger } from './StateLogger';
import { ScannerEvent } from './ScannerEvent';

export class ScannerStateMachine {
  constructor(initialState = ScannerState.IDLE) {
    this.context = new ScannerContext();
    this.context.currentState = initialState;
    this.logger = new StateLogger(100);
    this.listeners = new Set();
  }

  getState() {
    return this.context.currentState;
  }

  getContext() {
    return this.context;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  transition(toState, payload = null, reason = null) {
    const fromState = this.context.currentState;

    if (!StateValidator.canTransition(fromState, toState)) {
      console.warn(`[FSM] Invalid transition attempt: ${fromState} -> ${toState}`);
      return false; // Transition rejected
    }

    // Apply state change
    this.context.previousState = fromState;
    this.context.currentState = toState;
    this.context.lastTransition = Date.now();
    this.context.transitionCount++;

    if (payload?.barcode) {
      this.context.lastBarcode = payload.barcode;
    }
    if (payload?.error) {
      this.context.error = payload.error;
    }
    
    if (toState === ScannerState.SUCCESS && payload?.barcode) {
      this.context.lastAcceptedBarcode = payload.barcode;
    }

    this.logger.log(fromState, toState, reason);
    this._notifyListeners(ScannerEvent.STATE_CHANGED, toState, payload);
    
    // Also dispatch specific state event if mapped
    if (ScannerEvent[toState]) {
      this._notifyListeners(ScannerEvent[toState], toState, payload);
    }

    return true;
  }

  _notifyListeners(event, state, payload) {
    this.listeners.forEach(listener => {
      try {
        listener(event, state, payload);
      } catch (err) {
        console.error(`[FSM] Listener error on event ${event}:`, err);
      }
    });
  }
}
