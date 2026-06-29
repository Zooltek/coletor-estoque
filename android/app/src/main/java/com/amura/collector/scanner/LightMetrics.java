package com.amura.collector.scanner;

import com.getcapacitor.JSObject;

public class LightMetrics {
    private int manualOverrides = 0;
    private int autoActivations = 0;
    private long totalTorchTimeMs = 0;
    private long lastTorchStartTime = 0;
    
    private float lastLightLevel = 1.0f;

    public void updateLightLevel(float level) {
        this.lastLightLevel = level;
    }

    public void recordManualOverride() {
        manualOverrides++;
    }

    public void recordAutoActivation() {
        autoActivations++;
    }

    public void markTorchState(boolean on) {
        long now = System.currentTimeMillis();
        if (on) {
            lastTorchStartTime = now;
        } else {
            if (lastTorchStartTime > 0) {
                totalTorchTimeMs += (now - lastTorchStartTime);
                lastTorchStartTime = 0;
            }
        }
    }

    public JSObject getSnapshot() {
        JSObject obj = new JSObject();
        obj.put("lightLevel", lastLightLevel);
        obj.put("manualOverrides", manualOverrides);
        obj.put("autoActivations", autoActivations);
        long currentSession = lastTorchStartTime > 0 ? System.currentTimeMillis() - lastTorchStartTime : 0;
        obj.put("totalTorchTimeMs", totalTorchTimeMs + currentSession);
        return obj;
    }
}
