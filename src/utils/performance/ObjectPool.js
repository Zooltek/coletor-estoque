/**
 * Pool genérico para reciclar objetos instanciados frequentemente
 * e evitar o acionamento excessivo do Garbage Collector.
 */
export class ObjectPool {
  constructor(factory, resetFn = (obj) => obj, initialSize = 10) {
    this.factory = factory;
    this.resetFn = resetFn;
    this.pool = [];
    
    for (let i = 0; i < initialSize; i++) {
      this.pool.push(this.factory());
    }
  }

  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.factory();
  }

  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }

  clear() {
    this.pool = [];
  }
}
