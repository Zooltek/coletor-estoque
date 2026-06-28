import PipelineStage from '../PipelineStage';
import PipelineResult from '../PipelineResult';

export default class ChecksumValidator extends PipelineStage {
  constructor() {
    super('ChecksumValidator');
  }

  async execute(context) {
    // Esqueleto para futuras validações de EAN13, GTIN, etc.
    // Atualmente permite todos
    
    // Se falhasse:
    // context.validation.errors.push('Checksum incorreto');
    // return PipelineResult.INVALID;
  }
}
