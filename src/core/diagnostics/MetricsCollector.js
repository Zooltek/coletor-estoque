import { MetricsEvents } from './MetricsEvents';

export class MetricsCollector {
  constructor(store, onUpdate) {
    this.store = store;
    this.onUpdate = onUpdate;
    this.active = false;
  }

  start() {
    this.active = true;
    this.store.addEvent(MetricsEvents.UPDATED, "Diagnostics Collector Started");
    this.onUpdate();
    
    // Na arquitetura real, aqui adicionaríamos os event listeners globais.
    // window.addEventListener(MetricsEvents.CAMERA, this.handleCameraEvent);
  }

  stop() {
    this.active = false;
    this.store.addEvent(MetricsEvents.UPDATED, "Diagnostics Collector Stopped");
    this.onUpdate();
    
    // window.removeEventListener(MetricsEvents.CAMERA, this.handleCameraEvent);
  }

  // Método unificado para receber telemetria de qualquer lugar do App
  record(module, data, message = null) {
    if (!this.active) return;

    if (data) {
      this.store.update(module, data);
    }

    if (message) {
      this.store.addEvent(module, message, data);
    }
    
    this.onUpdate();
  }
}
