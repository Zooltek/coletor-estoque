import { useState, useEffect } from 'react';
import SmartZoomService from '../../services/camera/SmartZoomService';

export function useCameraMetrics(intervalMs = 2000) {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchMetrics = async () => {
      const data = await SmartZoomService.getMetrics();
      if (mounted && data) {
        setMetrics(data);
      }
    };

    fetchMetrics();
    const timer = setInterval(fetchMetrics, intervalMs);

    return () => {
      mounted = false;
      clearInterval(timer);
    };
  }, [intervalMs]);

  return { metrics };
}
