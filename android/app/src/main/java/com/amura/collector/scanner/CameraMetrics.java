package com.amura.collector.scanner;

import com.getcapacitor.JSObject;

public class CameraMetrics {
    private int autoAdjustments = 0;
    private int manualAdjustments = 0;
    private float maxZoomReached = 1.0f;
    private float sumZoom = 0;
    private int countZoom = 0;
    private long totalFocusTime = 0;
    private int countFocus = 0;

    public void recordAutoZoom(float zoom) {
        autoAdjustments++;
        if (zoom > maxZoomReached) maxZoomReached = zoom;
        sumZoom += zoom;
        countZoom++;
    }

    public void recordManualZoom(float zoom) {
        manualAdjustments++;
        if (zoom > maxZoomReached) maxZoomReached = zoom;
        sumZoom += zoom;
        countZoom++;
    }

    public void recordFocusTime(long timeMs) {
        totalFocusTime += timeMs;
        countFocus++;
    }

    public JSObject getSnapshot() {
        JSObject obj = new JSObject();
        obj.put("maxZoom", maxZoomReached);
        obj.put("autoAdjustments", autoAdjustments);
        obj.put("manualAdjustments", manualAdjustments);
        
        float avgZoom = countZoom > 0 ? sumZoom / countZoom : 1.0f;
        obj.put("avgZoom", avgZoom);

        long avgFocusTime = countFocus > 0 ? totalFocusTime / countFocus : 0;
        obj.put("avgFocusTimeMs", avgFocusTime);
        
        return obj;
    }
}
