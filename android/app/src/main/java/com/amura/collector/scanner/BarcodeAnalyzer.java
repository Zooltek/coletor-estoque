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
import com.amura.collector.performance.ScannerPerformanceLogger;

public class BarcodeAnalyzer implements ImageAnalysis.Analyzer {
    public interface OnBarcodeDetectedListener {
        void onBarcodeDetected(com.getcapacitor.JSObject barcodeResult);
    }

    private BarcodeScanner scanner;
    private OnBarcodeDetectedListener listener;
    private SmartZoomController zoomController;
    private SmartLightController lightController;
    private boolean isPaused = false;

    private long sessionStartTime = 0;
    private boolean firstReadLogged = false;
    private int frameCount = 0;
    private long lastFpsTime = 0;
    private double currentFps = 0.0;
    private long totalProcessingTime = 0;
    private long processedFramesCount = 0;

    public BarcodeAnalyzer(OnBarcodeDetectedListener listener, SmartZoomController zoomController, SmartLightController lightController) {
        this.listener = listener;
        this.zoomController = zoomController;
        this.lightController = lightController;
        this.sessionStartTime = System.currentTimeMillis();
        this.lastFpsTime = System.currentTimeMillis();

        BarcodeScannerOptions options = new BarcodeScannerOptions.Builder()
            .setBarcodeFormats(
                Barcode.FORMAT_EAN_13,
                Barcode.FORMAT_EAN_8,
                Barcode.FORMAT_CODE_128,
                Barcode.FORMAT_CODE_39,
                Barcode.FORMAT_QR_CODE,
                Barcode.FORMAT_DATA_MATRIX,
                Barcode.FORMAT_UPC_A,
                Barcode.FORMAT_UPC_E,
                Barcode.FORMAT_CODE_93,
                Barcode.FORMAT_ITF,
                Barcode.FORMAT_CODABAR,
                Barcode.FORMAT_PDF417,
                Barcode.FORMAT_AZTEC
            )
            .build();
        this.scanner = BarcodeScanning.getClient(options);
        ScannerPerformanceLogger.log("Camera", "BarcodeAnalyzer initialized");
    }

    public void setPaused(boolean paused) {
        this.isPaused = paused;
    }

    public double getCurrentFps() {
        return currentFps;
    }
    
    public long getAverageProcessingTimeMs() {
        if (processedFramesCount == 0) return 0;
        return totalProcessingTime / processedFramesCount;
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
            ScannerPerformanceLogger.log("Performance", "FPS=" + currentFps);
        }

        Image mediaImage = imageProxy.getImage();
        if (mediaImage != null && !isPaused) {
            long processingStart = System.currentTimeMillis();
            
            if (lightController != null) {
                lightController.evaluateFrame(imageProxy);
            }

            InputImage image = InputImage.fromMediaImage(mediaImage, imageProxy.getImageInfo().getRotationDegrees());
            
            scanner.process(image)
                .addOnSuccessListener(barcodes -> {
                    // Múltiplos códigos: como a RFC diz "Maior área", no momento enviamos o primeiro detectado.
                    // Em implementações futuras podemos iterar e achar a maior área.
                    if (!barcodes.isEmpty()) {
                        Barcode barcode = barcodes.get(0);
                        String rawValue = barcode.getRawValue();
                        Rect bbox = barcode.getBoundingBox();

                        if (bbox != null && zoomController != null) {
                            zoomController.evaluateFrame(bbox, imageProxy.getWidth(), imageProxy.getHeight());
                        }

                        if (rawValue != null && !rawValue.isEmpty()) {
                            if (!firstReadLogged) {
                                long elapsed = System.currentTimeMillis() - sessionStartTime;
                                ScannerPerformanceLogger.log("Performance", "Tempo ate a primeira leitura: " + elapsed + " ms");
                                firstReadLogged = true;
                            }
                            
                            // Mapeia e emite IMEDIATAMENTE (sem debounce!)
                            BarcodeResult mappedResult = BarcodeMapper.map(barcode);
                            if (listener != null && mappedResult != null) {
                                listener.onBarcodeDetected(mappedResult.toJSObject());
                            }
                        }
                    }
                })
                .addOnFailureListener(e -> {
                    CameraUtils.logError("BarcodeAnalyzer: Falha na analise do frame", e);
                })
                .addOnCompleteListener(task -> {
                    long duration = System.currentTimeMillis() - processingStart;
                    totalProcessingTime += duration;
                    processedFramesCount++;
                    imageProxy.close();
                });
        } else {
            imageProxy.close();
        }
    }
}
