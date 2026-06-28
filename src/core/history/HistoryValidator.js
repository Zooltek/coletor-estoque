export const HistoryStatus = {
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
  DUPLICATE: 'DUPLICATE',
  MANUAL: 'MANUAL',
  IGNORED: 'IGNORED'
};

export class HistoryValidator {
  static isValidStatus(status) {
    return Object.values(HistoryStatus).includes(status);
  }

  static validateEntry(entry) {
    if (!entry.barcode) {
      console.warn('[HistoryValidator] Barcode is required');
      return false;
    }
    if (!this.isValidStatus(entry.status)) {
      console.warn(`[HistoryValidator] Invalid status: ${entry.status}`);
      return false;
    }
    return true;
  }
}
