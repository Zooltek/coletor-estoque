import { MetricsSnapshot } from './MetricsSnapshot';

export class MetricsStore {
  constructor() {
    this.reset();
  }

  reset() {
    this.current = JSON.parse(JSON.stringify(MetricsSnapshot));
    this.timeline = []; // Buffer FIFO de eventos cronológicos
    this.MAX_TIMELINE_SIZE = 1000;
  }

  update(module, data) {
    if (this.current[module]) {
      this.current[module] = { ...this.current[module], ...data };
    }
  }

  addEvent(type, message, metadata = {}) {
    const event = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      type,
      message,
      metadata
    };
    
    this.timeline.unshift(event); // Insere no início
    
    if (this.timeline.length > this.MAX_TIMELINE_SIZE) {
      this.timeline.pop(); // Remove o mais antigo
    }
  }

  getSnapshot() {
    return this.current;
  }

  getTimeline() {
    return this.timeline;
  }
}
