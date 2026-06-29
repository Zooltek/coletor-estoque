import { useRef } from 'react';
import { shallowCompare } from '../../utils/performance/MemoComparator';

/**
 * Hook para estabilizar um objeto literal. 
 * Só retorna uma nova referência se os valores internos (shallow check) mudarem.
 * Muito útil ao passar objetos `{ config: {...} }` em props.
 */
export function useStableObject(obj) {
  const ref = useRef(obj);

  if (!shallowCompare(ref.current, obj)) {
    ref.current = obj;
  }

  return ref.current;
}
