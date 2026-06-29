export const ConfigurationDefaults = {
  version: "1.0.0",
  scanner: {
    continuousMode: true,
    blindCount: false, // Permitir itens não cadastrados
    method: 'scan', // 'scan' | 'type'
    minTimeBetweenScans: 500, // ms
    defaultQuantity: 1
  },
  camera: {
    smartZoom: true,
    smartLight: true,
    autoFocus: true,
    autoExposure: true,
    quality: 'high',
    initialZoom: 1.0,
    maxZoom: 3.0
  },
  feedback: {
    soundMuted: false,
    vibrationEnabled: true,
    showOverlay: true,
    showBanner: true,
    durationMs: 1500,
    volume: 1.0
  },
  interface: {
    theme: 'dark', // 'light' | 'dark'
    compactMode: false,
    animationsEnabled: true,
    showHistory: true,
    historyItemsCount: 5,
    showFPS: false
  },
  performance: {
    benchmarkMode: false,
    ecoMode: false,
    memoryMonitor: false,
    thermalMonitor: false,
    batteryMonitor: false,
    logsEnabled: true
  },
  developer: {
    detailedLogs: false,
    debugOverlay: false,
    showPipeline: false,
    showStateMachine: false,
    showSession: false,
    enableDiagnostics: false
  },
  sync: {
    mode: 'manual', // manual, auto
    retryLimit: 3,
    provider: 'http'
  }
};
