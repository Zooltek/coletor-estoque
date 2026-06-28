import PipelineStage from '../PipelineStage';
import PipelineResult from '../PipelineResult';

export default class BarcodeValidator extends PipelineStage {
  constructor() {
    super('BarcodeValidator');
  }

  async execute(context) {
    const code = context.barcode;
    
    if (!code || typeof code !== 'string') {
      context.validation.errors.push('Barcode is empty or invalid type');
      return PipelineResult.INVALID;
    }

    if (code.length < 3 || code.length > 50) {
      context.validation.errors.push('Barcode length must be between 3 and 50 characters');
      return PipelineResult.INVALID;
    }

    // Permite fluxo
  }
}
