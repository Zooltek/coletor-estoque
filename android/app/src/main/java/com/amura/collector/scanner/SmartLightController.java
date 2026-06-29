package com.amura.collector.scanner;

import androidx.camera.core.ImageProxy;

public class SmartLightController {
    private TorchController torchController;
    private LightAnalyzer analyzer;
    private TorchDecisionEngine decisionEngine;
    private ExposureSynchronizer exposureSynchronizer;
    private LightMetrics metrics;

    public interface OnTorchStateChangedListener {
        void onTorchStateChanged(boolean isOn);
    }
    
    private OnTorchStateChangedListener listener;

    private long lastChangeTime = 0;
    private static final long HYSTERESIS_MS = 3000;
    
    private boolean manualOverrideActive = false;
    private long manualOverrideEndTime = 0;
    private static final long MANUAL_OVERRIDE_DURATION_MS = 15000; // 15 seconds

    public SmartLightController(TorchController torchController, OnTorchStateChangedListener listener) {
        this.torchController = torchController;
        this.analyzer = new LightAnalyzer();
        this.decisionEngine = new TorchDecisionEngine();
        this.exposureSynchronizer = new ExposureSynchronizer();
        this.metrics = new LightMetrics();
        this.listener = listener;
    }

    public LightMetrics getMetrics() {
        return metrics;
    }

    public void setManualOverride(boolean on) {
        manualOverrideActive = true;
        manualOverrideEndTime = System.currentTimeMillis() + MANUAL_OVERRIDE_DURATION_MS;
        
        torchController.setTorchState(on);
        metrics.markTorchState(on);
        metrics.recordManualOverride();
        
        if (listener != null) listener.onTorchStateChanged(on);
        CameraUtils.logDebug("Manual Override: Torch=" + on);
    }

    public void evaluateFrame(ImageProxy imageProxy) {
        long now = System.currentTimeMillis();

        if (manualOverrideActive) {
            if (now > manualOverrideEndTime) {
                manualOverrideActive = false;
                CameraUtils.logDebug("Auto Mode Restored");
            } else {
                return;
            }
        }

        if (now - lastChangeTime < HYSTERESIS_MS) {
            return;
        }

        float lightLevel = analyzer.analyze(imageProxy);
        metrics.updateLightLevel(lightLevel);

        boolean isCurrentlyOn = torchController.isTorchOn();
        TorchDecisionEngine.Decision decision = decisionEngine.evaluate(lightLevel, isCurrentlyOn);

        if (decision == TorchDecisionEngine.Decision.TORCH_ON) {
            changeState(true);
            metrics.recordAutoActivation();
        } else if (decision == TorchDecisionEngine.Decision.TORCH_OFF) {
            changeState(false);
        }
    }

    private void changeState(boolean turnOn) {
        torchController.setTorchState(turnOn);
        metrics.markTorchState(turnOn);
        lastChangeTime = System.currentTimeMillis();
        exposureSynchronizer.synchronize(null, turnOn);
        if (listener != null) listener.onTorchStateChanged(turnOn);
        CameraUtils.logDebug(turnOn ? "Torch Enabled" : "Torch Disabled");
    }
}
