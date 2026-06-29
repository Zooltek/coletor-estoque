const STORAGE_KEY = 'sc_config_v1';

export class ConfigurationRepository {
  load() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn("Erro ao ler configurações do localStorage", e);
    }
    return null;
  }

  save(snapshot) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
      return true;
    } catch (e) {
      console.error("Erro ao salvar configurações no localStorage", e);
      return false;
    }
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
  }
}
