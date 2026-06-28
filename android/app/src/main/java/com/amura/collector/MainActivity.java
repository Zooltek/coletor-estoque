package com.amura.collector;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;
import com.amura.collector.scanner.BarcodeScannerPlugin;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        registerPlugin(BarcodeScannerPlugin.class);
        super.onCreate(savedInstanceState);
    }
}
