export class SyncRetryPolicy {
  static getDelay(attempts) {
    switch (attempts) {
      case 1: return 2000;  // 2s
      case 2: return 5000;  // 5s
      case 3: return 15000; // 15s
      default: return -1;   // falha permanente (limite excedido)
    }
  }
  
  static shouldRetry(attempts, maxRetries = 3) {
    return attempts < maxRetries;
  }
}
