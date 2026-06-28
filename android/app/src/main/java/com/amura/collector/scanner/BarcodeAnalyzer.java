package com.amura.collector.scanner;

import android.graphics.Rect;
import android.media.Image;
import androidx.annotation.NonNull;
import androidx.camera.core.ExperimentalGetImage;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.ImageProxy;
import com.google.mlkit.vision.barcode.BarcodeScanner;
import com.google.mlkit.vision.barcode.BarcodeScanning;
import com.google.mlkit.vision.barcode.common.Barcode;
import com.google.mlkit.vision.barcode.BarcodeScannerOptions;
import com.google.mlkit.vision.common.InputImage;

public class BarcodeAnalyzer implements ImageAnalysis.Analyzer {
    private BarcodeScanner scanner;
    private BarcodeProcessor processor;
    private ZoomController zoomController;
    private boolean isPaused = false;

    private long sessionStartTime = 0;
    private boolean firstReadLogged = false;
    private int frameCount = 0;
    private long lastFpsTime = 0;
    private double currentFps = 0.0;

    public BarcodeAnalyzer(BarcodeProcessor processor, ZoomController zoomController) {
        this.processor = processor;
        this.zoomController = zoomController;
        this.sessionStartTime = System.currentTimeMillis();
        this.lastFpsTime = System.currentTimeMillis();

        BarcodeScannerOptions options = new BarcodeScannerOptions.Builder()
            .setBarcodeFormats(
                Barcode.FORMAT_EAN_13,
                Barcode.FORMAT_EAN_8,
                Barcode.FORMAT_CODE_128,
                Barcode.FORMAT_CODE_39,
                Barcode.FORMAT_QR_CODE,
                Barcode.FORMAT_DATA_MATRIX
            )
            .build();
        this.scanner = BarcodeScanning.getClient(options);
    }

    public void setPaused(boolean paused) {
        this.isPaused = paused;
    }

    public double getCurrentFps() {
        return currentFps;
    }

    public long getSessionStartTime() {
        return sessionStartTime;
    }

    @Override
    @ExperimentalGetImage
    public void analyze(@NonNull ImageProxy imageProxy) {
        frameCount++;
        long now = System.currentTimeMillis();
        if (now - lastFpsTime >= 1000) {
            currentFps = (double) frameCount * 1000.0 / (now - lastFpsTime);
            frameCount = 0;
            lastFpsTime = now;
            CameraUtils.logDebug("BarcodeAnalyzer: Desempenho FPS=" + currentFps);
        }

        Image mediaImage = imageProxy.getImage();
        if (mediaImage != null && !isPaused) {
            InputImage image = InputImage.fromMediaImage(mediaImage, imageProxy.getImageInfo().getRotationDegrees());
            
            scanner.process(image)
                .addOnSuccessListener(barcodes -> {
                    for (Barcode barcode : barcodes) {
                        String rawValue = barcode.getRawValue();
                        Rect bbox = barcode.getBoundingBox();

                        if (bbox != null && zoomController != null) {
                            zoomController.evaluateAutoZoom(bbox, imageProxy.getWidth(), imageProxy.getHeight());
                        }

                        if (rawValue != null && !rawValue.isEmpty()) {
                            if (!firstReadLogged) {
                                long elapsed = System.currentTimeMillis() - sessionStartTime;
                                CameraUtils.logDebug("METRIC: Tempo ate a primeira leitura: " + elapsed + " ms");
                                firstReadLogged = true;
                            }
                            processor.processBarcode(rawValue);
                        }
                    }
                })
                .addOnFailureListener(e -> {
                    CameraUtils.logError("BarcodeAnalyzer: Falha na analise do frame", e);
                })
                .addOnCompleteListener(task -> imageProxy.close());
        } else {
            imageProxy.close();
        }
    }
}
