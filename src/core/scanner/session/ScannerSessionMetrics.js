export default class ScannerSessionMetrics {
  constructor() {
    this.totalReads = 0;
    this.acceptedReads = 0;
    this.rejectedReads = 0;
    this.duplicateReads = 0;
    this.invalidReads = 0;
    this.manualReads = 0;
    this.ignoredReads = 0;
    
    this.totalDuration = 0;
    this.fastestRead = Infinity;
    this.slowestRead = 0;
  }

  update(durationMs) {
    if (durationMs) {
      this.totalDuration += durationMs;
      if (durationMs < this.fastestRead) this.fastestRead = durationMs;
      if (durationMs > this.slowestRead) this.slowestRead = durationMs;
    }
  }

  get averageReadTime() {
    return this.totalReads > 0 ? (this.totalDuration / this.totalReads).toFixed(2) : 0;
  }
}
