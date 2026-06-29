package com.amura.collector.scanner;

import androidx.camera.core.CameraControl;
import androidx.camera.core.FocusMeteringAction;
import androidx.camera.core.MeteringPoint;

public class FocusAnimator {
    private long lastFocusTime = 0;
    private static final long FOCUS_COOLDOWN_MS = 2000;
    
    public void focusOnPoint(CameraControl cameraControl, MeteringPoint point, CameraMetrics metrics) {
        if (cameraControl == null || point == null) return;
        
        long now = System.currentTimeMillis();
        if (now - lastFocusTime < FOCUS_COOLDOWN_MS) {
            return; 
        }
        
        long start = System.currentTimeMillis();
        
        FocusMeteringAction action = new FocusMeteringAction.Builder(point, FocusMeteringAction.FLAG_AF | FocusMeteringAction.FLAG_AE)
            .setAutoCancelDuration(3, java.util.concurrent.TimeUnit.SECONDS)
            .build();
            
        cameraControl.startFocusAndMetering(action);
        
        if (metrics != null) {
            metrics.recordFocusTime(System.currentTimeMillis() - start);
        }
        
        lastFocusTime = now;
        CameraUtils.logDebug("Focus Requested");
    }
}
