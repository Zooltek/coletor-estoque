import PipelineStage from '../PipelineStage';
import PipelineResult from '../PipelineResult';

export default class BusinessValidator extends PipelineStage {
  constructor(validationCallback) {
    super('BusinessValidator');
    this.validationCallback = validationCallback;
  }

  setCallback(callback) {
    this.validationCallback = callback;
  }

  async execute(context) {
    if (!this.validationCallback) {
      return; // Permite fluxo caso não haja validador (aceitação automática)
    }

    try {
      const result = await this.validationCallback(context.barcode);
      if (!result) {
        context.validation.errors.push(new Error("Business validation rejected"));
        return PipelineResult.ERROR; // ou INVALID
      }
      
      // Se retornasse o produto, poderíamos guardar no context.product
      if (typeof result === 'object') {
        context.product = result;
      }
      
    } catch (err) {
      context.validation.errors.push(err);
      return PipelineResult.ERROR;
    }
  }
}
