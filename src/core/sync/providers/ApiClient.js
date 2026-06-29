export class ApiClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
  }

  setBaseURL(url) {
    this.baseURL = url;
  }

  async post(endpoint, data, headers = {}) {
    const url = this.baseURL ? `${this.baseURL}${endpoint}` : endpoint;
    
    // Simulaçao de MOCK conforme requisitado
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Simulando log nativo
        if (!window.sc_api_logs) window.sc_api_logs = [];
        window.sc_api_logs.unshift({
          timestamp: new Date().toLocaleTimeString(),
          type: 'API POST',
          message: `Mock POST para ${url}`,
          payload: JSON.stringify(data, null, 2)
        });

        // 80% de sucesso
        if (Math.random() > 0.2) {
          resolve({ status: 200, data: { success: true } });
        } else {
          reject(new Error(`Timeout ou erro interno no servidor (500) ao conectar com ${url}`));
        }
      }, 800);
    });
  }

  // Métodos futuros: get, put, delete, etc.
}

// Exporta uma instância padrão para uso do Provider
export const defaultApiClient = new ApiClient();
