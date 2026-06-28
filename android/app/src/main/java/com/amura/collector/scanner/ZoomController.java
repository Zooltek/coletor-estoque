package com.amura.collector.scanner;

import android.graphics.Rect;
import androidx.camera.core.Camera;

public class ZoomController {
    private Camera camera;
    private float currentZoomRatio = 1.0f;
    private static final float AUTO_ZOOM_RATIO = 2.2f;
    private static final float BASE_ZOOM_RATIO = 1.0f;

    public void setCamera(Camera camera) {
        this.camera = camera;
        if (camera != null) {
            setZoom(BASE_ZOOM_RATIO);
        }
    }

    public void setZoom(float ratio) {
        if (camera != null) {
            camera.getCameraControl().setZoomRatio(ratio);
            currentZoomRatio = ratio;
            CameraUtils.logDebug("ZoomController: Zoom alterado para " + ratio);
        }
    }

    public void evaluateAutoZoom(Rect boundingBox, int imageWidth, int imageHeight) {
        if (boundingBox == null || camera == null) return;

        float pctWidth = (float) boundingBox.width() / imageWidth;
        if (pctWidth < 0.20f && currentZoomRatio == BASE_ZOOM_RATIO) {
            CameraUtils.logDebug("ZoomController: Código pequeno detectado (" + (pctWidth * 100) + "% do frame). Zoom automático " + AUTO_ZOOM_RATIO + "x");
            setZoom(AUTO_ZOOM_RATIO);
        }
    }

    public void resetZoomAfterScan() {
        if (currentZoomRatio != BASE_ZOOM_RATIO) {
            CameraUtils.logDebug("ZoomController: Leitura bem-sucedida, resetando zoom para " + BASE_ZOOM_RATIO + "x");
            setZoom(BASE_ZOOM_RATIO);
        }
    }
}
