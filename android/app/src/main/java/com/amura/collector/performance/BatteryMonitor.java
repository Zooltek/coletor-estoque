package com.amura.collector.performance;

import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.BatteryManager;
import com.getcapacitor.JSObject;

public class BatteryMonitor {
    private Context context;

    public BatteryMonitor(Context context) {
        this.context = context;
    }

    public JSObject getBatterySnapshot() {
        IntentFilter ifilter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
        Intent batteryStatus = context.registerReceiver(null, ifilter);
        
        int level = batteryStatus != null ? batteryStatus.getIntExtra(BatteryManager.EXTRA_LEVEL, -1) : -1;
        int scale = batteryStatus != null ? batteryStatus.getIntExtra(BatteryManager.EXTRA_SCALE, -1) : -1;

        float batteryPct = level * 100 / (float)scale;

        JSObject info = new JSObject();
        info.put("level", batteryPct);
        return info;
    }
}
