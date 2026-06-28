export default class DuplicateReadGuard {
  constructor(timeoutMs = 1000) {
    this.timeoutMs = timeoutMs;
    this.lastCode = null;
    this.lastTime = 0;
  }

  shouldIgnore(code) {
    const now = Date.now();
    if (this.lastCode === code && (now - this.lastTime) < this.timeoutMs) {
      return true; // Ignore duplicate within timeout
    }
    
    this.lastCode = code;
    this.lastTime = now;
    return false;
  }

  reset() {
    this.lastCode = null;
    this.lastTime = 0;
  }
}
