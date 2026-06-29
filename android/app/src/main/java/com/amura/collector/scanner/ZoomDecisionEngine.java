package com.amura.collector.scanner;

import android.graphics.Rect;

public class ZoomDecisionEngine {
    private static final float TARGET_MIN = 1.0f;
    private static final float SMALL_CODE_THRESHOLD = 0.10f; // 10%
    private static final float LARGE_CODE_THRESHOLD = 0.40f; // 40%
    
    // Zoom multipliers
    private static final float ZOOM_IN_FACTOR = 1.5f;
    private static final float ZOOM_OUT_FACTOR = 0.7f;
    
    private float maxZoomRatio = 4.0f; // Será atualizado pela câmera
    
    public void setMaxZoomRatio(float maxZoom) {
        this.maxZoomRatio = maxZoom;
    }

    public float calculateTargetZoom(Rect boundingBox, int imageWidth, int imageHeight, float currentZoom) {
        if (boundingBox == null) return currentZoom;

        float boxArea = boundingBox.width() * boundingBox.height();
        float imageArea = imageWidth * imageHeight;
        float coverage = boxArea / imageArea;

        float target = currentZoom;

        if (coverage < SMALL_CODE_THRESHOLD) {
            target = currentZoom * ZOOM_IN_FACTOR;
        } else if (coverage > LARGE_CODE_THRESHOLD) {
            target = currentZoom * ZOOM_OUT_FACTOR;
        }

        // Histerese / Clamping
        if (target < TARGET_MIN) target = TARGET_MIN;
        if (target > maxZoomRatio) target = maxZoomRatio;

        // Se a diferença for muito pequena, ignora (evita oscilação contínua)
        if (Math.abs(target - currentZoom) < 0.2f) {
            return currentZoom;
        }

        return target;
    }
}
