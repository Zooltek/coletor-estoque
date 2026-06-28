export class ScannerError extends Error {
  constructor(message, originalError = null) {
    super(message);
    this.name = 'ScannerError';
    this.originalError = originalError;
  }
}
