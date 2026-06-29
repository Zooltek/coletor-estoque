package com.amura.collector.performance;

import android.content.Context;
import android.os.Build;
import android.os.PowerManager;
import com.getcapacitor.JSObject;

public class ThermalMonitor {
    private Context context;

    public ThermalMonitor(Context context) {
        this.context = context;
    }

    public JSObject getThermalSnapshot() {
        JSObject info = new JSObject();
        
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            PowerManager pm = (PowerManager) context.getSystemService(Context.POWER_SERVICE);
            if (pm != null) {
                int thermalStatus = pm.getCurrentThermalStatus();
                info.put("status", thermalStatus);
                info.put("throttling", thermalStatus >= PowerManager.THERMAL_STATUS_MODERATE);
            } else {
                info.put("status", -1);
                info.put("throttling", false);
            }
        } else {
            info.put("status", -1);
            info.put("throttling", false);
        }
        
        return info;
    }
}
