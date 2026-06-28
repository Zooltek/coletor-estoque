export default class PipelineMetrics {
  static metrics = {
    totalReads: 0,
    validReads: 0,
    invalidReads: 0,
    duplicateReads: 0,
    errorReads: 0,
    totalDuration: 0,
    maxDuration: 0
  };

  static record(context) {
    if (!context || !context.result) return;
    
    this.metrics.totalReads++;
    
    if (context.duration) {
      this.metrics.totalDuration += context.duration;
      if (context.duration > this.metrics.maxDuration) {
        this.metrics.maxDuration = context.duration;
      }
    }

    switch (context.result) {
      case 'SUCCESS':
        this.metrics.validReads++;
        break;
      case 'INVALID':
        this.metrics.invalidReads++;
        break;
      case 'DUPLICATE':
        this.metrics.duplicateReads++;
        break;
      case 'ERROR':
        this.metrics.errorReads++;
        break;
      default:
        break;
    }
  }

  static getStats() {
    return {
      ...this.metrics,
      avgDuration: this.metrics.totalReads > 0 ? (this.metrics.totalDuration / this.metrics.totalReads).toFixed(2) : 0
    };
  }
}
