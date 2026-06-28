export const ScannerState = {
  IDLE: 'IDLE',
  INITIALIZING: 'INITIALIZING',
  READY: 'READY',
  SCANNING: 'SCANNING',
  PAUSED: 'PAUSED',
  ERROR: 'ERROR',
};

/**
 * @typedef {Object} ScannerResult
 * @property {string} code - The scanned barcode text
 * @property {string} [format] - The format of the scanned barcode
 * @property {number} timestamp - The time the code was scanned
 */
