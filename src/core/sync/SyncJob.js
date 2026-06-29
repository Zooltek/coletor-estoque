export class SyncJob {
  constructor(type, payload, priority = 1) {
    this.id = 'job_' + Date.now() + '_' + Math.floor(Math.random() * 1000);
    this.type = type;
    this.payload = payload;
    this.priority = priority;
    
    this.createdAt = new Date().toISOString();
    this.status = 'pending'; // pending, processing, failed, completed
    this.attempts = 0;
    this.lastError = null;
  }
}
