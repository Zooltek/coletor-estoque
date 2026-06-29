import { useState, useEffect } from 'react';
import SmartZoomService from '../../services/camera/SmartZoomService';

export function useSmartZoom() {
  const [currentZoom, setCurrentZoom] = useState(1.0);

  useEffect(() => {
    let mounted = true;
    let handle = null;

    const initListener = async () => {
      handle = await SmartZoomService.listenToZoomChanges((zoom) => {
        if (mounted) setCurrentZoom(zoom);
      });
    };

    initListener();

    return () => {
      mounted = false;
      if (handle) {
        handle.remove();
      }
    };
  }, []);

  return { currentZoom };
}
