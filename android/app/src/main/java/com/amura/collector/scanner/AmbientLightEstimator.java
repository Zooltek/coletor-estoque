package com.amura.collector.scanner;

public class AmbientLightEstimator {
    public float estimate(float avgLuminance) {
        return avgLuminance / 255.0f;
    }
}
