import { SyncQueue } from './SyncQueue';
import { SyncRepository } from './SyncRepository';
import { SyncEvents } from './SyncEvents';
import { SyncSnapshot } from './SyncSnapshot';
import { SyncRetryPolicy } from './SyncRetryPolicy';
import { SyncScheduler } from './SyncScheduler';
import { HttpSyncProvider } from './providers/HttpSyncProvider';

export class SyncEngine {
  constructor() {
    this.repository = new SyncRepository();
    this.queue = new SyncQueue(this.repository, () => this._notify());
    this.scheduler = new SyncScheduler(this);
    
    // Default provider (pode ser trocado via configuração)
    this.provider = new HttpSyncProvider();
    
    this.status = 'online'; // online, syncing, offline, error
    this.listeners = new Set();
    
    this.isProcessing = false;
    this.errors = 0;
    this.lastSync = null;
    this.nextRetry = null;
    this.retryTimer = null;
  }

  start() {
    this.scheduler.start();
    this._notify();
  }

  setProvider(provider) {
    this.provider = provider;
    this._notify();
  }

  enqueue(type, payload, priority = 1) {
    // importação dinâmica para evitar referências circulares graves
    import('./SyncJob.js').then(({ SyncJob }) => {
      const job = new SyncJob(type, payload, priority);
      this.queue.addJob(job);
      this._notify();
      
      // Auto-inicia o processamento
      if (this.status !== 'offline') {
        this.processQueue();
      }
    });
  }

  async processQueue() {
    if (this.isProcessing) return;
    this.isProcessing = true;
    
    let job = this.queue.getNextJob();
    if (job) {
      this.status = 'syncing';
      this._notify();
    }
    
    while (job) {
      try {
        await this.provider.send(job.payload);
        
        // Sucesso
        job.status = 'completed';
        this.queue.removeJob(job.id);
        this.errors = 0; // zera erros
        this.lastSync = new Date().toISOString();
        
      } catch (err) {
        // Falha
        job.attempts += 1;
        job.lastError = err.message || "Erro desconhecido";
        this.errors += 1;
        
        if (SyncRetryPolicy.shouldRetry(job.attempts)) {
          job.status = 'pending'; // Volta pra fila
          const delay = SyncRetryPolicy.getDelay(job.attempts);
          this.queue.updateJob(job.id, job);
          this.status = 'offline'; // Assume que rede caiu
          
          this.nextRetry = new Date(Date.now() + delay).toISOString();
          this._notify();
          
          // Agenda retry
          if (this.retryTimer) clearTimeout(this.retryTimer);
          this.retryTimer = setTimeout(() => {
            this.nextRetry = null;
            this.processQueue();
          }, delay);
          
          break; // Sai do loop para esperar o delay
        } else {
          // Falha permanente
          job.status = 'failed';
          this.queue.updateJob(job.id, job);
          // Continua para o próximo job? Depende da arquitetura. Vamos apenas deixá-lo como 'failed' na fila para revisão manual.
        }
      }
      
      job = this.queue.getNextJob();
    }
    
    this.isProcessing = false;
    if (this.status === 'syncing') {
      this.status = 'online';
      this._notify();
    }
  }

  clearQueue() {
    this.queue.clear();
    this._notify();
  }

  getSnapshot() {
    const jobs = this.queue.getJobs();
    return {
      status: this.status,
      provider: this.provider ? this.provider.name : 'none',
      queueSize: jobs.length,
      jobs: jobs,
      lastSync: this.lastSync,
      nextRetry: this.nextRetry,
      errors: this.errors
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    const snap = this.getSnapshot();
    for (const listener of this.listeners) {
      try {
        listener(snap);
      } catch (e) {
        console.error("Erro no listener de SyncEngine", e);
      }
    }
  }
}
