import { ConfigurationDefaults } from './ConfigurationDefaults';
import { ConfigurationRepository } from './ConfigurationRepository';

class ConfigurationManager {
  constructor() {
    this.repository = new ConfigurationRepository();
    this.listeners = new Set();
    this.snapshot = null;
    this.load();
  }

  load() {
    const saved = this.repository.load();
    if (saved && saved.version === ConfigurationDefaults.version) {
      // Faz merge profundo simples para garantir que novas chaves existam
      this.snapshot = this._merge(ConfigurationDefaults, saved);
    } else {
      // Sem config ou versão antiga (migração simples = overwrite por enquanto)
      this.snapshot = JSON.parse(JSON.stringify(ConfigurationDefaults));
      this.save();
    }
    this._notify();
  }

  getSnapshot() {
    return this.snapshot;
  }

  update(section, key, value) {
    if (!this.snapshot[section]) return false;
    
    // Atualiza
    this.snapshot = {
      ...this.snapshot,
      [section]: {
        ...this.snapshot[section],
        [key]: value
      }
    };
    
    this.save();
    this._notify();
    return true;
  }

  reset() {
    this.repository.reset();
    this.snapshot = JSON.parse(JSON.stringify(ConfigurationDefaults));
    this.save();
    this._notify();
  }

  save() {
    // Usando debounce simples se necessário futuramente. Por agora síncrono.
    this.repository.save(this.snapshot);
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  _notify() {
    for (const listener of this.listeners) {
      try {
        listener(this.snapshot);
      } catch (e) {
        console.error("Erro no listener de configuração", e);
      }
    }
  }

  _merge(defaults, saved) {
    const result = { ...defaults };
    for (const section in saved) {
      if (typeof saved[section] === 'object' && !Array.isArray(saved[section])) {
        result[section] = { ...defaults[section], ...saved[section] };
      } else {
        result[section] = saved[section];
      }
    }
    return result;
  }
}

export default new ConfigurationManager();
