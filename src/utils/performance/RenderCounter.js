/**
 * Simple render counter utility for development.
 * Useful for debugging re-renders.
 */
class RenderCounter {
  constructor() {
    this.counts = new Map();
  }

  record(componentName) {
    if (process.env.NODE_ENV !== 'development') return 0;
    
    const count = (this.counts.get(componentName) || 0) + 1;
    this.counts.set(componentName, count);
    return count;
  }

  get(componentName) {
    return this.counts.get(componentName) || 0;
  }

  reset() {
    this.counts.clear();
  }
}

export const globalRenderCounter = new RenderCounter();
