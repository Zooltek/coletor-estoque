/**
 * Custom comparators for React.memo to avoid deep comparisons
 * and only re-render when specific keys change.
 */

// Comparador raso padrão (similar ao React.memo default, mas exposto para uso manual)
export function shallowCompare(prevProps, nextProps) {
  if (Object.is(prevProps, nextProps)) return true;
  
  if (typeof prevProps !== 'object' || prevProps === null || 
      typeof nextProps !== 'object' || nextProps === null) {
    return false;
  }

  const keysA = Object.keys(prevProps);
  const keysB = Object.keys(nextProps);

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    const key = keysA[i];
    if (!Object.prototype.hasOwnProperty.call(nextProps, key) || !Object.is(prevProps[key], nextProps[key])) {
      return false;
    }
  }

  return true;
}

// Compara props ignorando propriedades específicas
export function createOmitComparator(omittedKeys = []) {
  return (prevProps, nextProps) => {
    const keysA = Object.keys(prevProps).filter(k => !omittedKeys.includes(k));
    const keysB = Object.keys(nextProps).filter(k => !omittedKeys.includes(k));

    if (keysA.length !== keysB.length) return false;

    for (let i = 0; i < keysA.length; i++) {
      const key = keysA[i];
      if (!Object.prototype.hasOwnProperty.call(nextProps, key) || !Object.is(prevProps[key], nextProps[key])) {
        return false;
      }
    }

    return true;
  };
}

// Compara apenas chaves específicas
export function createPickComparator(pickedKeys = []) {
  return (prevProps, nextProps) => {
    for (let i = 0; i < pickedKeys.length; i++) {
      const key = pickedKeys[i];
      if (!Object.is(prevProps[key], nextProps[key])) {
        return false;
      }
    }
    return true;
  };
}
