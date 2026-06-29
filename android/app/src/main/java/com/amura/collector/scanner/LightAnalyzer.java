package com.amura.collector.scanner;

import androidx.camera.core.ImageProxy;
import java.nio.ByteBuffer;

public class LightAnalyzer {
    private AmbientLightEstimator estimator;

    public LightAnalyzer() {
        this.estimator = new AmbientLightEstimator();
    }

    public float analyze(ImageProxy imageProxy) {
        if (imageProxy.getPlanes().length == 0) return 1.0f;
        
        ByteBuffer yBuffer = imageProxy.getPlanes()[0].getBuffer();
        
        int step = 64; 
        int capacity = yBuffer.capacity();
        if (capacity == 0) return 1.0f;
        
        long sum = 0;
        int count = 0;
        
        for (int i = 0; i < capacity; i += step) {
            sum += (yBuffer.get(i) & 0xFF);
            count++;
        }
        
        float avgLuminance = count > 0 ? (float) sum / count : 255.0f;
        return estimator.estimate(avgLuminance);
    }
}
