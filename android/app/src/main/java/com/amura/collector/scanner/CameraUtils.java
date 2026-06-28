package com.amura.collector.scanner;

import android.util.Log;
import android.util.Size;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

public class CameraUtils {
    private static final String TAG = "AmuraScanner";
    private static boolean debugMode = true; // Define se logs detalhados serão impressos

    public static void logDebug(String msg) {
        if (debugMode) {
            Log.d(TAG, msg);
        }
    }

    public static void logError(String msg, Throwable e) {
        Log.e(TAG, msg, e);
    }

    public static Size selectTargetResolution(Size[] supportedSizes) {
        if (supportedSizes == null || supportedSizes.length == 0) {
            return new Size(1280, 720);
        }

        List<Size> sizes = new ArrayList<>();
        for (Size size : supportedSizes) {
            sizes.add(size);
        }

        Collections.sort(sizes, new Comparator<Size>() {
            @Override
            public int compare(Size o1, Size o2) {
                return Integer.compare(o2.getWidth() * o2.getHeight(), o1.getWidth() * o1.getHeight());
            }
        });

        for (Size size : sizes) {
            if (size.getWidth() == 1920 && size.getHeight() == 1080) {
                return size;
            }
        }
        
        for (Size size : sizes) {
            if (size.getWidth() == 1280 && size.getHeight() == 720) {
                return size;
            }
        }

        return sizes.get(0);
    }
}
