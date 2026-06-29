export class SyncQueue {
  constructor(repository, onUpdate) {
    this.repository = repository;
    this.onUpdate = onUpdate;
    this.jobs = this.repository.loadQueue() || [];
  }

  addJob(job) {
    this.jobs.push(job);
    this.jobs.sort((a, b) => b.priority - a.priority);
    this._save();
  }

  getNextJob() {
    return this.jobs.find(j => j.status === 'pending' || j.status === 'failed');
  }

  updateJob(id, updates) {
    const jobIndex = this.jobs.findIndex(j => j.id === id);
    if (jobIndex >= 0) {
      this.jobs[jobIndex] = { ...this.jobs[jobIndex], ...updates };
      this._save();
    }
  }

  removeJob(id) {
    this.jobs = this.jobs.filter(j => j.id !== id);
    this._save();
  }

  getJobs() {
    return [...this.jobs];
  }

  clear() {
    this.jobs = [];
    this._save();
  }

  _save() {
    this.repository.saveQueue(this.jobs);
    if (this.onUpdate) this.onUpdate();
  }
}
