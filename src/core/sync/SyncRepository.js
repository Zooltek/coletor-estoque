export class SyncRepository {
  constructor(storageKey = 'sc_sync_queue') {
    this.storageKey = storageKey;
  }

  loadQueue() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error("Erro ao ler SyncQueue", e);
      return [];
    }
  }

  saveQueue(jobs) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(jobs));
    } catch (e) {
      console.error("Erro ao salvar SyncQueue", e);
    }
  }
}
