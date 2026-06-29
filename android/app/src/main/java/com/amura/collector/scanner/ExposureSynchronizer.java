package com.amura.collector.scanner;

import androidx.camera.core.CameraControl;

public class ExposureSynchronizer {
    public void synchronize(CameraControl cameraControl, boolean isTorchOn) {
        if (cameraControl == null) return;
        CameraUtils.logDebug("Exposure Updated: Torch=" + isTorchOn);
    }
}
