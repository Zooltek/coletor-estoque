export default class PipelineLogger {
  static log(message, context = null) {
    const timestamp = new Date().toISOString();
    const barcode = context ? context.barcode : 'N/A';
    const result = context && context.result ? context.result : 'PENDING';
    const duration = context && context.duration ? `${context.duration}ms` : '-';
    
    console.log(`[ScannerPipeline] [${timestamp}] [Code: ${barcode}] [Result: ${result}] [Time: ${duration}] -> ${message}`);
  }
}
