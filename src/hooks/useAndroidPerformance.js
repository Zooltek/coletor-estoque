import { useState, useEffect } from 'react';
import AndroidPerformanceService from '../../services/performance/AndroidPerformanceService';

export function useAndroidPerformance(pollingIntervalMs = 5000) {
  const [metrics, setMetrics] = useState({
    memory: null,
    battery: null,
    thermal: null,
    fps: 0,
    avgProcessingTimeMs: 0
  });

  useEffect(() => {
    let intervalId = null;

    const fetchMetrics = async () => {
      const data = await AndroidPerformanceService.getPerformance();
      if (data) {
        setMetrics(data);
      }
    };

    // Initial fetch
    fetchMetrics();

    if (pollingIntervalMs > 0) {
      intervalId = setInterval(fetchMetrics, pollingIntervalMs);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pollingIntervalMs]);

  return metrics;
}
