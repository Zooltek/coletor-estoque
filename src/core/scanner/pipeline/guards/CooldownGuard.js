import PipelineStage from '../PipelineStage';
import PipelineResult from '../PipelineResult';

export default class CooldownGuard extends PipelineStage {
  constructor() {
    super('CooldownGuard');
    this.cooldownUntil = 0;
  }

  setCooldown(ms) {
    this.cooldownUntil = Date.now() + ms;
  }

  async execute(context) {
    if (Date.now() < this.cooldownUntil) {
      return PipelineResult.COOLDOWN; // Aborta
    }
    // Permite fluxo e agenda cooldown padrão se tudo der certo (feio no pipeline final, 
    // mas a responsabilidade de aplicar o cooldown após SUCCESS deve estar no ScannerPipeline ou num estágio final)
  }
  
  cancel() {
    this.cooldownUntil = 0;
  }
}
