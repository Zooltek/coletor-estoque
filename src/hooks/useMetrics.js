import { DiagnosticsManager } from '../core/diagnostics';

// Exportado para injetar em partes do sistema (Session, Pipeline, Scanner) sem precisar conhecer o DiagnosticsManager diretamente
export function useMetrics() {
  const recordMetric = (module, data, message = null) => {
    DiagnosticsManager.recordMetric(module, data, message);
  };

  return { recordMetric };
}
