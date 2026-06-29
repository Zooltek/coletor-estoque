import { unstable_batchedUpdates } from 'react-dom';

/**
 * Utilitário para agrupar múltiplas chamadas de estado em um único render.
 * Muito útil quando não se usa React 18+ (onde batching é automático) 
 * ou ao lidar com Promises/Eventos customizados no React 17 ou inferior.
 */
export const BatchUpdater = {
  execute(callback) {
    unstable_batchedUpdates(() => {
      callback();
    });
  }
};
