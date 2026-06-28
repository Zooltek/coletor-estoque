import PipelineResult from './PipelineResult';
import PipelineEvent from './PipelineEvent';
import PipelineMetrics from './PipelineMetrics';
import PipelineLogger from './PipelineLogger';

export default class PipelineExecutor {
  constructor() {
    this.stages = [];
    this.listeners = new Set();
  }

  addStage(stage) {
    this.stages.push(stage);
    return this;
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _emit(event, context) {
    this.listeners.forEach(listener => {
      try {
        listener(event, context);
      } catch (err) {
        console.error(`[PipelineExecutor] Error in listener for event ${event}:`, err);
      }
    });
  }

  async execute(context) {
    this._emit(PipelineEvent.PIPELINE_STARTED, context);
    PipelineLogger.log('Pipeline Started', context);

    try {
      for (const stage of this.stages) {
        const result = await stage.execute(context);
        
        // Se um estágio retornar um resultado explícito, abortar a cadeia
        if (result && Object.values(PipelineResult).includes(result)) {
          context.finish(result);
          break;
        }
      }

      // Se passou por todos os estágios sem abortar e não tiver resultado definido, é SUCCESS
      if (!context.result) {
        context.finish(PipelineResult.SUCCESS);
      }

    } catch (err) {
      context.validation.errors.push(err);
      context.finish(PipelineResult.ERROR);
      PipelineLogger.log(`[PipelineExecutor] Fatal error: ${err.message}`, context);
    }

    // Registrar métricas
    PipelineMetrics.record(context);
    PipelineLogger.log('Pipeline Finished', context);

    // Emitir eventos finais correspondentes
    switch (context.result) {
      case PipelineResult.SUCCESS:
        this._emit(PipelineEvent.PIPELINE_SUCCESS, context);
        break;
      case PipelineResult.DUPLICATE:
        this._emit(PipelineEvent.PIPELINE_DUPLICATE, context);
        break;
      case PipelineResult.INVALID:
        this._emit(PipelineEvent.PIPELINE_INVALID, context);
        break;
      case PipelineResult.ERROR:
        this._emit(PipelineEvent.PIPELINE_ERROR, context);
        break;
      default:
        break;
    }

    this._emit(PipelineEvent.PIPELINE_FINISHED, context);
    return context.result;
  }
}
