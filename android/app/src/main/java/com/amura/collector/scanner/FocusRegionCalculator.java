package com.amura.collector.scanner;

import android.graphics.Rect;
import androidx.camera.core.MeteringPoint;
import androidx.camera.core.SurfaceOrientedMeteringPointFactory;

public class FocusRegionCalculator {
    public MeteringPoint calculate(Rect boundingBox, int imageWidth, int imageHeight) {
        if (boundingBox == null) return null;
        
        float centerX = boundingBox.centerX();
        float centerY = boundingBox.centerY();
        
        SurfaceOrientedMeteringPointFactory factory = new SurfaceOrientedMeteringPointFactory(imageWidth, imageHeight);
        return factory.createPoint(centerX, centerY);
    }
}
