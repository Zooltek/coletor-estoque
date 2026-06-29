/**
 * Logger centralizado para monitorar performance (renders, tempo).
 * Fica silencioso em modo de produção.
 */
class Logger {
  constructor() {
    this.enabled = process.env.NODE_ENV === 'development';
  }

  logRender(componentName, renderTimeMs = 0) {
    if (!this.enabled) return;
    
    if (renderTimeMs > 0) {
      console.log(`[Performance] Render ${componentName} - ${renderTimeMs.toFixed(2)}ms`);
    } else {
      console.log(`[Performance] Render ${componentName}`);
    }
  }

  time(label) {
    if (this.enabled) {
      console.time(`[Performance] ${label}`);
    }
  }

  timeEnd(label) {
    if (this.enabled) {
      console.timeEnd(`[Performance] ${label}`);
    }
  }
}

export const PerformanceLogger = new Logger();
