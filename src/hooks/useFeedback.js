import { useEffect } from 'react';

export function useFeedback(pipelineState) {
  // Obs: O feedback sonoro/tátil agora é disparado diretamente pelo próprio
  // ScannerPipeline de forma síncrona, portanto este hook não precisa
  // mais reagir às mudanças do React. 
  // Mantido apenas para evitar quebras em componentes que ainda o importem.
  
  return {};
}
