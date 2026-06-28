export default class PipelineStage {
  constructor(name) {
    this.name = name;
  }

  /**
   * Executa a lógica da etapa.
   * Pode retornar de forma síncrona ou assíncrona.
   * Se retornar um PipelineResult explícito, a cadeia é abortada com esse resultado (ex: DUPLICATE).
   * Se retornar undefined, a cadeia continua para o próximo estágio.
   * @param {PipelineContext} context
   * @returns {Promise<string|void>|string|void} PipelineResult
   */
  async execute(context) {
    throw new Error(`Stage ${this.name} must implement execute()`);
  }
}
