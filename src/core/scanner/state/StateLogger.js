export class StateLogger {
  constructor(maxSize = 100) {
    this.maxSize = maxSize;
    this.history = [];
  }

  log(from, to, reason = null) {
    const entry = {
      from,
      to,
      timestamp: Date.now(),
      reason
    };
    
    this.history.push(entry);
    
    if (this.history.length > this.maxSize) {
      this.history.shift();
    }
    
    // Opcional: imprimir logs
    // console.log(`[FSM] ${from} -> ${to}`, reason ? `(${reason})` : '');
  }

  getHistory() {
    return [...this.history];
  }
}
