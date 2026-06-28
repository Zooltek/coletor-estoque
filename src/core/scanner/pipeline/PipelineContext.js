export default class PipelineContext {
  constructor(barcode, scannerType = 'camera') {
    this.barcode = barcode;
    this.rawValue = barcode; // Em alguns casos, pode ser diferente
    this.scannerType = scannerType;
    this.startedAt = Date.now();
    this.finishedAt = null;
    this.duration = 0;
    this.currentState = null;
    this.metadata = {};
    this.validation = {
      isValid: false,
      errors: []
    };
    this.product = null;
    this.result = null; // Guardará o PipelineResult final
  }

  finish(result) {
    this.result = result;
    this.finishedAt = Date.now();
    this.duration = this.finishedAt - this.startedAt;
  }
}
