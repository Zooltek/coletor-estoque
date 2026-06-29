import { MetricsStore } from './MetricsStore';
import { MetricsCollector } from './MetricsCollector';
import { MetricsExporter } from './MetricsExporter';
import { MetricsEvents } from './MetricsEvents';

class DiagnosticsManager {
  constructor() {
    this.store = new MetricsStore();
    this.listeners = new Set();
    
    // Passa callback pro Collector avisar quando houver dados novos
    this.collector = new MetricsCollector(this.store, () => this._notify());
  }

  start() {
    this.collector.start();
  }

  stop() {
    this.collector.stop();
  }

  reset() {
    this.store.reset();
    this.store.addEvent(MetricsEvents.RESET, "Metrics Reset by User");
    this._notify();
  }

  exportJSON() {
    MetricsExporter.exportJSON(this.store.getSnapshot(), this.store.getTimeline());
  }

  exportTXT() {
    MetricsExporter.exportTXT(this.store.getSnapshot(), this.store.getTimeline());
  }

  getSnapshot() {
    return this.store.getSnapshot();
  }

  getTimeline() {
    return this.store.getTimeline();
  }
  
  // Endpoint usado pela aplicação para injetar dados de diagnóstico de forma passiva
  recordMetric(module, data, message = null) {
    this.collector.record(module, data, message);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    const payload = {
      snapshot: this.store.getSnapshot(),
      timeline: this.store.getTimeline()
    };
    
    for (const listener of this.listeners) {
      try {
        listener(payload);
      } catch (e) {
        console.error("Erro no listener do Diagnostics", e);
      }
    }
  }
}

export default new DiagnosticsManager();
