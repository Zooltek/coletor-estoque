export default class ScannerSessionSnapshot {
  constructor(session, state, metrics) {
    this.session = { ...session };
    this.state = { ...state };
    this.metrics = { 
      ...metrics,
      averageReadTime: metrics.averageReadTime,
      fastestRead: metrics.fastestRead === Infinity ? 0 : metrics.fastestRead
    };
    Object.freeze(this.session);
    Object.freeze(this.state);
    Object.freeze(this.metrics);
    Object.freeze(this);
  }
}
