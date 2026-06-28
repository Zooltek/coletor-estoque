import PipelineStage from '../PipelineStage';
import HistoryService from '../../../../services/history/HistoryService';
import PipelineResult from '../PipelineResult';

export default class HistoryStage extends PipelineStage {
  constructor() {
    super('HistoryStage');
  }

  async execute(context) {
    // Apenas registra o sucesso. O executor pode lidar com os erros e duplicados no log, 
    // mas se quisermos gravar no histórico os erros também, devemos fazer isso aqui?
    // O PipelineExecutor aborta se retornar DUPLICATE ou ERROR.
    // Assim, essa etapa (que é a #7) só é atingida em caso de SUCCESS.
    // No entanto, para reportar erros e duplicados ao histórico, o PipelineExecutor
    // deve emitir o evento, e o ScannerPipeline se encarrega, ou podemos ter um HistoryReporter
    // Mas vamos manter a lógica base:
    
    // Como a HistoryStage é apenas atingida em sucesso:
    const description = context.product ? context.product.description : '';
    const productId = context.product ? context.product.id : null;
    
    HistoryService.add(context.barcode, 'SUCCESS', productId, description, 1);
  }
}
