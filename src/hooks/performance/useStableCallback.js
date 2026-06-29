import { useCallback, useRef, useEffect } from 'react';

/**
 * Hook para estabilizar um callback passado via props ou usado como dependência,
 * garantindo que ele tenha sempre acesso ao escopo/state mais recente,
 * mas sem mudar a referência da função (evitando re-renders filhos).
 */
export function useStableCallback(callback) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  return useCallback((...args) => {
    if (callbackRef.current) {
      return callbackRef.current(...args);
    }
  }, []);
}
