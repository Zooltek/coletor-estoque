import PipelineStage from '../PipelineStage';
import PipelineResult from '../PipelineResult';

export default class DuplicateReadGuard extends PipelineStage {
  constructor(timeoutMs = 1000) {
    super('DuplicateReadGuard');
    this.timeoutMs = timeoutMs;
    this.lastCode = null;
    this.lastTime = 0;
  }

  async execute(context) {
    const now = Date.now();
    if (this.lastCode === context.barcode && (now - this.lastTime) < this.timeoutMs) {
      context.metadata.duplicate = true;
      return PipelineResult.DUPLICATE; // Aborta cadeia
    }
    
    this.lastCode = context.barcode;
    this.lastTime = now;
    // Sem retorno explícito = continua pipeline
  }

  reset() {
    this.lastCode = null;
    this.lastTime = 0;
  }
}
