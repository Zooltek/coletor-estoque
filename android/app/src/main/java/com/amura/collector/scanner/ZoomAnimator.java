package com.amura.collector.scanner;

import android.animation.ValueAnimator;
import androidx.camera.core.CameraControl;

public class ZoomAnimator {
    private ValueAnimator currentAnimator;

    public void animateZoom(CameraControl cameraControl, float startZoom, float endZoom, long durationMs) {
        if (currentAnimator != null && currentAnimator.isRunning()) {
            currentAnimator.cancel();
        }

        currentAnimator = ValueAnimator.ofFloat(startZoom, endZoom);
        currentAnimator.setDuration(durationMs);
        currentAnimator.addUpdateListener(animation -> {
            float value = (float) animation.getAnimatedValue();
            cameraControl.setZoomRatio(value);
        });
        currentAnimator.start();
    }
    
    public void cancel() {
        if (currentAnimator != null && currentAnimator.isRunning()) {
            currentAnimator.cancel();
        }
    }
}
