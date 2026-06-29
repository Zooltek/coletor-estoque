import { useState, useEffect } from 'react';
import { ConfigurationManager } from '../core/configuration';

export function useConfiguration() {
  const [config, setConfig] = useState(ConfigurationManager.getSnapshot());

  useEffect(() => {
    const unsubscribe = ConfigurationManager.subscribe(setConfig);
    return () => unsubscribe();
  }, []);

  const updateConfig = (section, key, value) => {
    ConfigurationManager.update(section, key, value);
  };

  const resetConfig = () => {
    ConfigurationManager.reset();
  };

  return { config, updateConfig, resetConfig };
}
