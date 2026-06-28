import { HistorySession } from '../../core/history/HistorySession';
import { HistoryValidator } from '../../core/history/HistoryValidator';
import { HistoryEntry } from '../../core/history/HistoryEntry';

export const HistoryEvents = {
  HISTORY_ADDED: 'HISTORY_ADDED',
  HISTORY_UPDATED: 'HISTORY_UPDATED',
  HISTORY_REMOVED: 'HISTORY_REMOVED',
  HISTORY_CLEARED: 'HISTORY_CLEARED'
};

class HistoryService {
  constructor() {
    this.session = new HistorySession();
    this.listeners = new Set();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify(event, payload) {
    this.listeners.forEach(listener => {
      try {
        listener(event, payload, this.session.records);
      } catch (err) {
        console.error('[HistoryService] Listener error:', err);
      }
    });
  }

  add(barcode, status, productId = null, description = '', quantity = 1) {
    const entry = new HistoryEntry(barcode, status, productId, description, quantity);
    
    if (!HistoryValidator.validateEntry(entry)) {
      return false;
    }

    this.session.addRecord(entry);
    console.log(`[HistoryService] History Added: ${barcode} (${status})`);
    this.notify(HistoryEvents.HISTORY_ADDED, entry);
    return true;
  }

  clear() {
    this.session.clear();
    console.log('[HistoryService] History Cleared');
    this.notify(HistoryEvents.HISTORY_CLEARED, null);
  }

  getRecords() {
    return [...this.session.records];
  }
}

// Exporta como um singleton para o ciclo de vida do app
export default new HistoryService();
