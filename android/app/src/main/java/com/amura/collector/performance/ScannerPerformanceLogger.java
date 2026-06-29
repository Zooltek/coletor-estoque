package com.amura.collector.performance;

import android.util.Log;

public class ScannerPerformanceLogger {
    private static final String TAG = "ScannerPerformance";
    private static final boolean ENABLED = true; // Deve ser desativado em produção

    public static void log(String event, String message) {
        if (!ENABLED) return;
        Log.d(TAG, "[" + event + "] " + message);
    }
}
