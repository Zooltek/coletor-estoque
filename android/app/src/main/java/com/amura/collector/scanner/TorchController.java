package com.amura.collector.scanner;

import android.content.Context;
import androidx.camera.core.Camera;

public class TorchController {
    private Camera camera;
    private boolean isTorchOn = false;

    public TorchController(Context context) {
        // Sem uso do SensorManager.
    }

    public void setCamera(Camera camera) {
        this.camera = camera;
    }

    public void toggleTorch(boolean on) {
        setTorchState(on);
    }

    public void setTorchState(boolean on) {
        if (camera != null && camera.getCameraInfo().hasFlashUnit()) {
            camera.getCameraControl().enableTorch(on);
            isTorchOn = on;
            CameraUtils.logDebug("TorchController: Lanterna alterada para " + on);
        }
    }

    public boolean isTorchOn() {
        return isTorchOn;
    }
}
