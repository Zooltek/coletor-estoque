export class ISyncProvider {
  constructor(name) {
    this.name = name;
  }

  async initialize() {
    throw new Error("Method not implemented");
  }

  async connect() {
    throw new Error("Method not implemented");
  }

  async disconnect() {
    throw new Error("Method not implemented");
  }

  async send(payload) {
    throw new Error("Method not implemented");
  }

  async receive() {
    throw new Error("Method not implemented");
  }

  async validate() {
    return true;
  }

  async healthCheck() {
    return true;
  }
}
