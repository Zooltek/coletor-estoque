export class HistoryFilter {
  // Esqueleto para preparar futuras filtragens
  static apply(records, criteria = {}) {
    let result = [...records];
    
    if (criteria.barcode) {
      result = result.filter(r => r.barcode === criteria.barcode);
    }
    if (criteria.status) {
      result = result.filter(r => r.status === criteria.status);
    }
    
    return result;
  }
}
