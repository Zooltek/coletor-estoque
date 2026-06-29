package com.amura.collector.scanner;

public class TorchDecisionEngine {
    private static final float DARK_THRESHOLD = 0.25f;
    private static final float LIGHT_THRESHOLD = 0.35f;

    public enum Decision {
        TORCH_ON,
        TORCH_OFF,
        MAINTAIN
    }

    public Decision evaluate(float lightLevel, boolean isTorchCurrentlyOn) {
        if (lightLevel < DARK_THRESHOLD && !isTorchCurrentlyOn) {
            return Decision.TORCH_ON;
        } else if (lightLevel > LIGHT_THRESHOLD && isTorchCurrentlyOn) {
            return Decision.TORCH_OFF;
        }
        return Decision.MAINTAIN;
    }
}
