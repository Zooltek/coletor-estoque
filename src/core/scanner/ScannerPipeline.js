import DuplicateReadGuard from './DuplicateReadGuard';
import CooldownManager from './CooldownManager';
import ScannerSession from './ScannerSession';
import { ScannerStateMachine, ScannerState, ScannerEvent } from './state';

export const ScannerPipelineEvents = ScannerEvent;

export default class ScannerPipeline {
  constructor(onEvent) {
    this.onEvent = onEvent;
    
    this.fsm = new ScannerStateMachine(ScannerState.INITIALIZING);
    
    this.fsm.subscribe((event, state, payload) => {
      // Re-emit FSM events upwards to the old listener (React hook)
      if (this.onEvent && event === ScannerEvent.STATE_CHANGED) {
        this.onEvent(state, payload);
      }
    });
    
    this.guard = new DuplicateReadGuard(1000);
    this.cooldown = new CooldownManager(500);
    this.session = new ScannerSession();
    
    this.isPaused = false;
  }

  get state() {
    return this.fsm.getState();
  }

  transition(newState, payload = null, reason = null) {
    return this.fsm.transition(newState, payload, reason);
  }

  pause() {
    this.isPaused = true;
    this.transition(ScannerState.PAUSED, null, 'User paused');
  }

  resume() {
    this.isPaused = false;
    this.guard.reset();
    this.transition(ScannerState.READY, null, 'User resumed');
  }

  async processRead(code, onValidate) {
    if (this.isPaused || this.state !== ScannerState.READY) {
      return;
    }

    // Duplicate Check
    if (this.guard.shouldIgnore(code)) {
      this.session.recordRead(code, 'DUPLICATED');
      if (this.onEvent) this.onEvent(ScannerEvent.DUPLICATED, code); // Special isolated event not breaking FSM
      return;
    }

    // Start Flow: READY -> DETECTING
    if (!this.transition(ScannerState.DETECTING, { barcode: code }, 'Scan detected')) return;
    
    // DETECTING -> PROCESSING
    if (!this.transition(ScannerState.PROCESSING, { barcode: code }, 'Validating')) return;

    try {
      if (onValidate) {
        const isValid = await onValidate(code);
        if (isValid) {
          this.session.recordRead(code, 'ACCEPTED');
          this.transition(ScannerState.SUCCESS, { barcode: code }, 'Validation accepted');
        } else {
          this.session.recordRead(code, 'REJECTED');
          this.transition(ScannerState.ERROR, { error: new Error("Validation rejected") }, 'Validation rejected');
        }
      } else {
        // Assume valid if no validator provided
        this.session.recordRead(code, 'ACCEPTED');
        this.transition(ScannerState.SUCCESS, { barcode: code }, 'Auto-accepted');
      }
    } catch (err) {
      this.session.recordRead(code, 'REJECTED');
      this.transition(ScannerState.ERROR, { error: err }, 'Validation threw error');
    }

    // Enter Cooldown
    if (this.isPaused) return;

    if (this.state === ScannerState.SUCCESS) {
      this.transition(ScannerState.COOLDOWN, null, 'Start cooldown');
    }

    this.cooldown.startCooldown(() => {
      if (!this.isPaused && (this.state === ScannerState.COOLDOWN || this.state === ScannerState.ERROR)) {
        this.transition(ScannerState.READY, null, 'Cooldown finished');
      }
    }, this.state === ScannerState.ERROR ? 1000 : 500); // 1000ms cooldown for errors
  }

  destroy() {
    this.cooldown.cancel();
    if (this.state !== ScannerState.STOPPED) {
      this.transition(ScannerState.STOPPED, null, 'Destroy called');
    }
  }
}
