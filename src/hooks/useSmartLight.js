import { useState, useEffect } from 'react';
import SmartLightService from '../../services/camera/SmartLightService';

export function useSmartLight() {
  const [torchActive, setTorchActive] = useState(false);

  useEffect(() => {
    let mounted = true;
    let handle = null;

    const initListener = async () => {
      handle = await SmartLightService.listenToTorchChanges((active) => {
        if (mounted) setTorchActive(active);
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

  return { torchActive };
}
