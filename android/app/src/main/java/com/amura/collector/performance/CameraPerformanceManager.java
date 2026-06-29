package com.amura.collector.performance;

import android.content.Context;
import com.getcapacitor.JSObject;

public class CameraPerformanceManager {
    private MemoryMonitor memoryMonitor;
    private BatteryMonitor batteryMonitor;
    private ThermalMonitor thermalMonitor;
    private Context context;

    public CameraPerformanceManager(Context context) {
        this.context = context;
        this.memoryMonitor = new MemoryMonitor();
        this.batteryMonitor = new BatteryMonitor(context);
        this.thermalMonitor = new ThermalMonitor(context);
    }

    public JSObject getFullPerformanceSnapshot(double currentFps, long avgProcessTime) {
        JSObject perf = new JSObject();
        perf.put("memory", memoryMonitor.getMemorySnapshot());
        perf.put("battery", batteryMonitor.getBatterySnapshot());
        perf.put("thermal", thermalMonitor.getThermalSnapshot());
        perf.put("fps", currentFps);
        perf.put("avgProcessingTimeMs", avgProcessTime);
        return perf;
    }

    public MemoryMonitor getMemoryMonitor() { return memoryMonitor; }
    public BatteryMonitor getBatteryMonitor() { return batteryMonitor; }
    public ThermalMonitor getThermalMonitor() { return thermalMonitor; }
}
