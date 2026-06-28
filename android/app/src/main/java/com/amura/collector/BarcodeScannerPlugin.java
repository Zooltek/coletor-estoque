package com.amura.collector;

import android.Manifest;
import android.content.Intent;
import android.graphics.Color;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;

import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

@CapacitorPlugin(
    name = "BarcodeScannerPlugin",
    permissions = {
        @Permission(
            alias = "camera",
            strings = { Manifest.permission.CAMERA }
        )
    }
)
public class BarcodeScannerPlugin extends Plugin {
    private PreviewView previewView;
    private ProcessCameraProvider cameraProvider;
    private androidx.camera.core.Camera camera;
    private boolean isPaused = false;

    // Lógica para confirmação e controle de leituras falsas
    private String lastDetectedBarcode = "";
    private int detectionCount = 0;
    private long lastDetectionTime = 0;

    private String lastDispatchedBarcode = "";
    private long lastDispatchedTime = 0;

    @PluginMethod
    public void start(PluginCall call) {
        if (getPermissionState("camera") != PermissionState.GRANTED) {
            requestPermissionForAlias("camera", call, "cameraPermCallback");
            return;
        }

        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    // Habilita transparência do WebView
                    getBridge().getWebView().setBackgroundColor(Color.TRANSPARENT);
                    
                    if (previewView == null) {
                        previewView = new PreviewView(getActivity());
                        previewView.setScaleType(PreviewView.ScaleType.FILL_CENTER);
                        
                        FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(
                            FrameLayout.LayoutParams.MATCH_PARENT,
                            FrameLayout.LayoutParams.MATCH_PARENT
                        );
                        
                        ViewGroup viewGroup = (ViewGroup) getBridge().getWebView().getParent();
                        viewGroup.addView(previewView, 0, layoutParams); // Adiciona atrás do WebView
                    }
                    
                    isPaused = false;
                    
                    com.google.common.util.concurrent.ListenableFuture<ProcessCameraProvider> cameraProviderFuture = 
                        ProcessCameraProvider.getInstance(getActivity());
                    
                    cameraProviderFuture.addListener(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                cameraProvider = cameraProviderFuture.get();
                                bindAnalysis(cameraProvider, previewView);
                                call.resolve();
                            } catch (Exception e) {
                                call.reject("Falha ao inicializar provedor de câmera", e);
                            }
                        }
                    }, ContextCompat.getMainExecutor(getActivity()));
                    
                } catch (Exception e) {
                    call.reject("Falha ao iniciar visualização da câmera nativa", e);
                }
            }
        });
    }

    @PermissionCallback
    private void cameraPermCallback(PluginCall call) {
        if (getPermissionState("camera") == PermissionState.GRANTED) {
            start(call);
        } else {
            call.reject("Permissão de câmera negada");
        }
    }

    @androidx.camera.core.ExperimentalGetImage
    private void bindAnalysis(ProcessCameraProvider cameraProvider, PreviewView previewView) {
        Preview preview = new Preview.Builder().build();
        preview.setSurfaceProvider(previewView.getSurfaceProvider());

        ImageAnalysis imageAnalysis = new ImageAnalysis.Builder()
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
            .build();

        com.google.mlkit.vision.barcode.BarcodeScanner scanner = 
            com.google.mlkit.vision.barcode.BarcodeScanning.getClient(
                new com.google.mlkit.vision.barcode.BarcodeScannerOptions.Builder()
                    .setBarcodeFormats(
                        com.google.mlkit.vision.barcode.common.Barcode.FORMAT_EAN_13,
                        com.google.mlkit.vision.barcode.common.Barcode.FORMAT_EAN_8,
                        com.google.mlkit.vision.barcode.common.Barcode.FORMAT_CODE_128,
                        com.google.mlkit.vision.barcode.common.Barcode.FORMAT_CODE_39,
                        com.google.mlkit.vision.barcode.common.Barcode.FORMAT_QR_CODE,
                        com.google.mlkit.vision.barcode.common.Barcode.FORMAT_DATA_MATRIX
                    )
                    .build()
            );

        imageAnalysis.setAnalyzer(ContextCompat.getMainExecutor(getContext()), new ImageAnalysis.Analyzer() {
            @Override
            public void analyze(@androidx.annotation.NonNull androidx.camera.core.ImageProxy imageProxy) {
                android.media.Image mediaImage = imageProxy.getImage();
                if (mediaImage != null) {
                    com.google.mlkit.vision.common.InputImage image =
                        com.google.mlkit.vision.common.InputImage.fromMediaImage(mediaImage, imageProxy.getImageInfo().getRotationDegrees());
                    
                    if (isPaused) {
                        imageProxy.close();
                        return;
                    }

                    scanner.process(image)
                        .addOnSuccessListener(barcodes -> {
                            for (com.google.mlkit.vision.barcode.common.Barcode barcode : barcodes) {
                                String rawValue = barcode.getRawValue();
                                if (rawValue != null && !rawValue.isEmpty()) {
                                    handleBarcodeDetected(rawValue);
                                }
                            }
                        })
                        .addOnFailureListener(e -> {
                            // ignora falhas de frame
                        })
                        .addOnCompleteListener(task -> imageProxy.close());
                } else {
                    imageProxy.close();
                }
            }
        });

        CameraSelector cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA;
        try {
            cameraProvider.unbindAll();
            camera = cameraProvider.bindToLifecycle(
                (androidx.lifecycle.LifecycleOwner) getActivity(),
                cameraSelector,
                preview,
                imageAnalysis
            );
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void handleBarcodeDetected(String barcode) {
        long now = System.currentTimeMillis();
        
        // Evita bipa consecutivamente no mesmo produto num intervalo de 2.5 segundos
        if (barcode.equals(lastDispatchedBarcode) && (now - lastDispatchedTime) < 2500) {
            return;
        }

        if (barcode.equals(lastDetectedBarcode)) {
            detectionCount++;
        } else {
            lastDetectedBarcode = barcode;
            detectionCount = 1;
        }
        
        // Critério de confirmação (Etapa 8):
        // 2 leituras consecutivas iguais OU 3 leituras rápidas (em até 500ms)
        if (detectionCount >= 2 || (now - lastDetectionTime < 500 && detectionCount >= 3)) {
            dispatchBarcode(barcode);
        }
        
        lastDetectionTime = now;
    }

    private void dispatchBarcode(String barcode) {
        lastDispatchedBarcode = barcode;
        lastDispatchedTime = System.currentTimeMillis();
        
        // Dispara feedback tátil e sonoro nativo
        triggerFeedback();

        JSObject ret = new JSObject();
        ret.put("barcode", barcode);
        notifyListeners("barcodeDetected", ret);
    }

    private void triggerFeedback() {
        try {
            // Vibração curta de confirmação
            android.os.Vibrator vibrator = (android.os.Vibrator) getContext().getSystemService(android.content.Context.VIBRATOR_SERVICE);
            if (vibrator != null) {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    vibrator.vibrate(android.os.VibrationEffect.createOneShot(80, android.os.VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(80);
                }
            }
            
            // Beep de confirmação nativo
            android.media.ToneGenerator toneGen = new android.media.ToneGenerator(android.media.AudioManager.STREAM_MUSIC, 100);
            toneGen.startTone(android.media.ToneGenerator.TONE_PROP_BEEP, 150);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        getActivity().runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    if (cameraProvider != null) {
                        cameraProvider.unbindAll();
                        cameraProvider = null;
                    }
                    
                    if (previewView != null) {
                        ViewGroup viewGroup = (ViewGroup) getBridge().getWebView().getParent();
                        viewGroup.removeView(previewView);
                        previewView = null;
                    }
                    
                    camera = null;
                    call.resolve();
                } catch (Exception e) {
                    call.reject("Erro ao parar a câmera nativa", e);
                }
            }
        });
    }

    @PluginMethod
    public void pause(PluginCall call) {
        isPaused = true;
        call.resolve();
    }

    @PluginMethod
    public void resume(PluginCall call) {
        isPaused = false;
        call.resolve();
    }

    @PluginMethod
    public void toggleTorch(PluginCall call) {
        Boolean on = call.getBoolean("on");
        if (camera != null && on != null) {
            camera.getCameraControl().enableTorch(on);
            call.resolve();
        } else {
            call.reject("Câmera nativa indisponível para alternar lanterna");
        }
    }

    @PluginMethod
    public void setZoom(PluginCall call) {
        Float level = call.getFloat("level");
        if (camera != null && level != null) {
            camera.getCameraControl().setZoomRatio(level);
            call.resolve();
        } else {
            call.reject("Câmera nativa indisponível para aplicar zoom");
        }
    }
}
