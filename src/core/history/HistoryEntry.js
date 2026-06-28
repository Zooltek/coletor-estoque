export class HistoryEntry {
  constructor(barcode, status, productId = null, description = '', quantity = 1, scannerType = 'camera') {
    this.id = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).substring(2);
    this.barcode = barcode;
    this.productId = productId;
    this.description = description;
    this.quantity = quantity;
    this.timestamp = new Date();
    this.status = status; // SUCCESS, ERROR, DUPLICATE, MANUAL, IGNORED
    this.scannerType = scannerType;
    this.duration = 0;
  }
}
