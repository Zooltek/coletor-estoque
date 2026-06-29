import { useEffect } from 'react';
import { useMetrics } from './useMetrics';

export function usePerformanceMetrics() {
  const { recordMetric } = useMetrics();

  useEffect(() => {
    // Exemplo: Simular telemetria de heap e render time periodicamente apenas se o DiagnosticsCollector estiver ativo
    // Na prática, isso seria injetado no loop de performance do App.
    const interval = setInterval(() => {
      const memory = performance.memory || {};
      recordMetric('memory', {
        heapTotal: Math.round((memory.totalJSHeapSize || 0) / 1048576) + ' MB',
        heapUsed: Math.round((memory.usedJSHeapSize || 0) / 1048576) + ' MB'
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [recordMetric]);
}
