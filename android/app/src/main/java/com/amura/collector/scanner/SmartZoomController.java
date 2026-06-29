package com.amura.collector.scanner;

import android.graphics.Rect;
import androidx.camera.core.Camera;
import androidx.camera.core.MeteringPoint;

public class SmartZoomController {
    private Camera camera;
    private ZoomDecisionEngine decisionEngine;
    private ZoomAnimator zoomAnimator;
    private FocusRegionCalculator focusCalculator;
    private FocusAnimator focusAnimator;
    private CameraMetrics metrics;

    private float currentZoomRatio = 1.0f;
    private long lastEvaluateTime = 0;
    private static final long EVALUATE_THROTTLE_MS = 200; // Máximo 5x por segundo

    private boolean manualOverrideActive = false;
    private long manualOverrideEndTime = 0;
    private static final long MANUAL_OVERRIDE_DURATION_MS = 5000; // 5 segundos

    public SmartZoomController() {
        this.decisionEngine = new ZoomDecisionEngine();
        this.zoomAnimator = new ZoomAnimator();
        this.focusCalculator = new FocusRegionCalculator();
        this.focusAnimator = new FocusAnimator();
        this.metrics = new CameraMetrics();
    }

    public void setCamera(Camera camera) {
        this.camera = camera;
        if (camera != null) {
            float maxZoom = camera.getCameraInfo().getZoomState().getValue().getMaxZoomRatio();
            decisionEngine.setMaxZoomRatio(maxZoom);
            setZoom(1.0f, false);
        }
    }

    public CameraMetrics getMetrics() {
        return metrics;
    }

    public void setZoom(float ratio, boolean isManual) {
        if (camera != null) {
            if (isManual) {
                manualOverrideActive = true;
                manualOverrideEndTime = System.currentTimeMillis() + MANUAL_OVERRIDE_DURATION_MS;
                zoomAnimator.cancel(); // Cancela qualquer animação automática
                camera.getCameraControl().setZoomRatio(ratio);
                currentZoomRatio = ratio;
                metrics.recordManualZoom(ratio);
                CameraUtils.logDebug("Manual Zoom Override: " + ratio);
            } else {
                zoomAnimator.animateZoom(camera.getCameraControl(), currentZoomRatio, ratio, 250);
                currentZoomRatio = ratio;
                metrics.recordAutoZoom(ratio);
                CameraUtils.logDebug("Zoom Changed (Auto): " + ratio);
            }
        }
    }

    public void evaluateFrame(Rect boundingBox, int imageWidth, int imageHeight) {
        if (camera == null || boundingBox == null) return;

        long now = System.currentTimeMillis();

        if (manualOverrideActive) {
            if (now > manualOverrideEndTime) {
                manualOverrideActive = false;
                CameraUtils.logDebug("Smart Zoom Enabled");
            } else {
                return; // Ignora avaliações durante override
            }
        }

        if (now - lastEvaluateTime < EVALUATE_THROTTLE_MS) {
            return;
        }
        lastEvaluateTime = now;

        float targetZoom = decisionEngine.calculateTargetZoom(boundingBox, imageWidth, imageHeight, currentZoomRatio);
        if (Math.abs(targetZoom - currentZoomRatio) > 0.01f) {
            setZoom(targetZoom, false);
        }

        MeteringPoint focusPoint = focusCalculator.calculate(boundingBox, imageWidth, imageHeight);
        if (focusPoint != null) {
            focusAnimator.focusOnPoint(camera.getCameraControl(), focusPoint, metrics);
        }
    }

    public void resetZoomAfterScan() {
        if (!manualOverrideActive && currentZoomRatio != 1.0f) {
            setZoom(1.0f, false);
        }
    }
}
