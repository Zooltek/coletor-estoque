export const MetricsSnapshot = {
  session: {
    startTime: null,
    totalTime: 0,
    readsTotal: 0,
    readsPerMinute: 0,
    longestInterval: 0,
    shortestInterval: Infinity,
    avgTime: 0
  },
  scanner: {
    state: 'UNKNOWN',
    lastCode: null,
    format: null,
    lastReadTime: 0,
    active: false,
    available: false
  },
  camera: {
    fps: 0,
    framesReceived: 0,
    framesDropped: 0,
    zoom: 1.0,
    focusActive: false,
    torchActive: false,
    exposure: 0,
    resolution: '0x0'
  },
  pipeline: {
    accepted: 0,
    rejected: 0,
    duplicates: 0,
    avgProcessingTime: 0,
    lastEvent: null
  },
  performance: {
    renderTime: 0,
    pipelineTime: 0,
    mlKitTime: 0,
    feedbackTime: 0,
    scannerTime: 0,
    cameraTime: 0
  },
  memory: {
    heapTotal: 0,
    heapUsed: 0,
    batteryLevel: 100,
    thermalState: 'NORMAL',
    cpuUsage: 0
  }
};
