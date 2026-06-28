export class HistorySession {
  constructor() {
    this.sessionId = Date.now().toString(36);
    this.startedAt = new Date();
    this.totalReads = 0;
    this.successReads = 0;
    this.errorReads = 0;
    this.duplicateReads = 0;
    this.manualReads = 0;
    
    this.records = []; // FIFO max 100
    this.limit = 100;
  }

  addRecord(entry) {
    this.records.unshift(entry); // Adiciona no início (mais recente primeiro)
    
    // Atualiza estatísticas
    this.totalReads++;
    switch(entry.status) {
      case 'SUCCESS': this.successReads++; break;
      case 'ERROR': this.errorReads++; break;
      case 'DUPLICATE': this.duplicateReads++; break;
      case 'MANUAL': this.manualReads++; break;
      default: break;
    }

    if (this.records.length > this.limit) {
      this.records.pop(); // Remove o mais antigo (do final)
    }
  }

  clear() {
    this.records = [];
    this.totalReads = 0;
    this.successReads = 0;
    this.errorReads = 0;
    this.duplicateReads = 0;
    this.manualReads = 0;
  }
}
