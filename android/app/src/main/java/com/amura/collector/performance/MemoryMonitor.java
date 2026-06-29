package com.amura.collector.performance;

import com.getcapacitor.JSObject;

public class MemoryMonitor {
    public JSObject getMemorySnapshot() {
        Runtime runtime = Runtime.getRuntime();
        long usedMemInMB = (runtime.totalMemory() - runtime.freeMemory()) / 1048576L;
        long maxHeapSizeInMB = runtime.maxMemory() / 1048576L;
        
        JSObject info = new JSObject();
        info.put("usedHeapMb", usedMemInMB);
        info.put("maxHeapMb", maxHeapSizeInMB);
        return info;
    }
}
