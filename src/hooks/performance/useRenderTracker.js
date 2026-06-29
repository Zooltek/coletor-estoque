import { useEffect, useRef } from 'react';
import { globalRenderCounter } from '../../utils/performance/RenderCounter';
import { PerformanceLogger } from '../../utils/performance/PerformanceLogger';

/**
 * Hook para ser usado puramente em debug.
 * Mede a quantidade de renders e loga no console.
 */
export function useRenderTracker(componentName) {
  const renderTimeRef = useRef(0);

  if (process.env.NODE_ENV === 'development') {
    renderTimeRef.current = performance.now();
    const count = globalRenderCounter.record(componentName);
    
    // Deixando o log nativo caso haja algo peculiar, mas usamos o PerformanceLogger de preferência
    // PerformanceLogger.logRender(`${componentName} (Render #${count})`);
  }

  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const ms = performance.now() - renderTimeRef.current;
      PerformanceLogger.logRender(componentName, ms);
    }
  });
}
