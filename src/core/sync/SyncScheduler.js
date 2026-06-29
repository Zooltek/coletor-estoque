export class SyncScheduler {
  constructor(engine) {
    this.engine = engine;
    this.timer = null;
  }

  start(intervalMs = 30000) {
    if (this.timer) clearInterval(this.timer);
    
    // Auto sync routine
    this.timer = setInterval(() => {
      if (this.engine.status === 'offline') {
        this.engine.processQueue(); // Tenta voltar à vida
      }
    }, intervalMs);
    
    // Também ouve quando volta a internet (online event nativo do browser)
    window.addEventListener('online', this.handleOnline);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
    window.removeEventListener('online', this.handleOnline);
  }

  handleOnline = () => {
    // Retoma processamento caso volte a internet
    this.engine.processQueue();
  }
}
