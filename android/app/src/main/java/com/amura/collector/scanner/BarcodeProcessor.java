package com.amura.collector.scanner;

public class BarcodeProcessor {
    public interface OnBarcodeValidatedListener {
        void onBarcodeValidated(String barcode);
    }

    private OnBarcodeValidatedListener listener;
    private String lastDetectedBarcode = "";
    private int detectionCount = 0;
    private long lastDetectionTime = 0;

    private String lastDispatchedBarcode = "";
    private long lastDispatchedTime = 0;
    private static final long DUPLICATE_THROTTLE_MS = 2500;

    public BarcodeProcessor(OnBarcodeValidatedListener listener) {
        this.listener = listener;
    }

    public void processBarcode(String barcode) {
        long now = System.currentTimeMillis();

        if (barcode.equals(lastDispatchedBarcode) && (now - lastDispatchedTime) < DUPLICATE_THROTTLE_MS) {
            return;
        }

        if (barcode.equals(lastDetectedBarcode)) {
            detectionCount++;
        } else {
            lastDetectedBarcode = barcode;
            detectionCount = 1;
        }

        if (detectionCount >= 2 || (now - lastDetectionTime < 500 && detectionCount >= 3)) {
            dispatchBarcode(barcode);
        }

        lastDetectionTime = now;
    }

    private void dispatchBarcode(String barcode) {
        lastDispatchedBarcode = barcode;
        lastDispatchedTime = System.currentTimeMillis();
        detectionCount = 0;

        if (listener != null) {
            listener.onBarcodeValidated(barcode);
        }
    }

    public void clearThrottle() {
        lastDispatchedBarcode = "";
        lastDispatchedTime = 0;
        lastDetectedBarcode = "";
        detectionCount = 0;
    }
}
