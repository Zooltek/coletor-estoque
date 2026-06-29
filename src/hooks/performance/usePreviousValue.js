import { useRef, useEffect } from 'react';

/**
 * Hook para manter referência ao valor anterior (previous state/prop).
 */
export function usePreviousValue(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  });
  
  return ref.current;
}
