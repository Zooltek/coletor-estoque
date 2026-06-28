export default class ScannerSession {
  constructor() {
    this.sessionStart = Date.now();
    this.lastRead = null;
    this.lastAccepted = null;
    this.acceptedReads = 0;
    this.rejectedReads = 0;
    this.duplicatedReads = 0;
  }

  recordRead(code, status) {
    this.lastRead = code;
    
    switch (status) {
      case 'ACCEPTED':
        this.lastAccepted = code;
        this.acceptedReads++;
        break;
      case 'REJECTED':
        this.rejectedReads++;
        break;
      case 'DUPLICATED':
        this.duplicatedReads++;
        break;
    }
  }

  getSessionDurationMs() {
    return Date.now() - this.sessionStart;
  }

  reset() {
    this.sessionStart = Date.now();
    this.lastRead = null;
    this.lastAccepted = null;
    this.acceptedReads = 0;
    this.rejectedReads = 0;
    this.duplicatedReads = 0;
  }
}
