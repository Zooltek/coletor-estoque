import DuplicateReadGuard from './DuplicateReadGuard';
import CooldownManager from './CooldownManager';
import ScannerSession from './ScannerSession';

export const ScannerPipelineEvents = {
  READY: 'SCANNER_READY',
  DETECTED: 'SCAN_DETECTED',
  PROCESSING: 'SCAN_PROCESSING',
  ACCEPTED: 'SCAN_ACCEPTED',
  REJECTED: 'SCAN_REJECTED',
  DUPLICATED: 'SCAN_DUPLICATED',
  FINISHED: 'SCAN_FINISHED',
  ERROR: 'SCAN_ERROR',
  PAUSED: 'SCAN_PAUSED'
};

export default class ScannerPipeline {
  constructor(onEvent) {
    this.onEvent = onEvent;
    this.state = 'INITIALIZING'; // INITIALIZING, READY, DETECTING, PROCESSING, SUCCESS, ERROR, COOLDOWN, PAUSED
    
    this.guard = new DuplicateReadGuard(1000);
    this.cooldown = new CooldownManager(500);
    this.session = new ScannerSession();
    
    this.isPaused = false;
  }

  setState(newState, payload = null) {
    this.state = newState;
    if (this.onEvent) {
      this.onEvent(newState, payload);
    }
  }

  pause() {
    this.isPaused = true;
    this.setState('PAUSED');
  }

  resume() {
    this.isPaused = false;
    this.guard.reset();
    this.setState('READY');
  }

  async processRead(code, onValidate) {
    if (this.isPaused || this.state !== 'READY') {
      return;
    }

    // Duplicate Check
    if (this.guard.shouldIgnore(code)) {
      this.session.recordRead(code, 'DUPLICATED');
      if (this.onEvent) this.onEvent(ScannerPipelineEvents.DUPLICATED, code);
      return;
    }

    // Start Flow
    this.setState('DETECTING', code);
    
    // Simulate processing state a bit if validation takes time, 
    // we jump to PROCESSING right away
    this.setState('PROCESSING', code);

    try {
      if (onValidate) {
        const isValid = await onValidate(code);
        if (isValid) {
          this.session.recordRead(code, 'ACCEPTED');
          this.setState('SUCCESS', code);
        } else {
          this.session.recordRead(code, 'REJECTED');
          this.setState('ERROR', new Error("Validation rejected"));
        }
      } else {
        // Assume valid if no validator provided
        this.session.recordRead(code, 'ACCEPTED');
        this.setState('SUCCESS', code);
      }
    } catch (err) {
      this.session.recordRead(code, 'REJECTED');
      this.setState('ERROR', err);
    }

    // Enter Cooldown
    // Avoid double cooldowns if user quickly pauses
    if (this.isPaused) return;

    this.setState('COOLDOWN');
    this.cooldown.startCooldown(() => {
      if (!this.isPaused) {
        this.setState('READY');
      }
    }, this.state === 'ERROR' ? 1000 : 500); // 1000ms cooldown for errors
  }

  destroy() {
    this.cooldown.cancel();
  }
}
