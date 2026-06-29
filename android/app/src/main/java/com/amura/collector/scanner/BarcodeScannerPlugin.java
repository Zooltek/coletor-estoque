package com.amura.collector.scanner;

import android.Manifest;
import com.getcapacitor.JSObject;
import com.getcapacitor.PermissionState;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;
import com.getcapacitor.annotation.Permission;
import com.getcapacitor.annotation.PermissionCallback;

import com.amura.collector.performance.CameraPerformanceManager;

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
    private CameraController cameraController;
    private BarcodeAnalyzer barcodeAnalyzer;
    private TorchController torchController;
    private SmartZoomController zoomController;
    private SmartLightController lightController;
    private CameraPerformanceManager performanceManager;

    @Override
    public void load() {
        super.load();
        cameraController = new CameraController(getActivity(), getBridge());
        torchController = new TorchController(getContext());
        zoomController = new SmartZoomController();
        lightController = new SmartLightController(torchController, isOn -> {
            JSObject ret = new JSObject();
            ret.put("torchActive", isOn);
            notifyListeners("torchChanged", ret);
        });
        performanceManager = new CameraPerformanceManager(getContext());
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (getPermissionState("camera") != PermissionState.GRANTED) {
            requestPermissionForAlias("camera", call, "cameraPermCallback");
            return;
        }

        barcodeAnalyzer = new BarcodeAnalyzer(new BarcodeAnalyzer.OnBarcodeDetectedListener() {
            @Override
            public void onBarcodeDetected(JSObject barcodeResult) {
                zoomController.resetZoomAfterScan();
                triggerFeedback();
                
                // Emite o JSObject já formatado com todos os dados do Scanner Inteligente
                notifyListeners("barcodeDetected", barcodeResult);
            }
        }, zoomController, lightController);

        cameraController.start(barcodeAnalyzer, new CameraController.OnCameraReadyListener() {
            @Override
            public void onCameraReady() {
                torchController.setCamera(cameraController.getCamera());
                zoomController.setCamera(cameraController.getCamera());

                notifyListeners("cameraReady", new JSObject());
                call.resolve();
            }

            @Override
            public void onCameraError(Throwable error) {
                JSObject err = new JSObject();
                err.put("message", error.getMessage());
                notifyListeners("cameraError", err);
                call.reject("Erro ao iniciar a camera nativa: " + error.getMessage());
            }
        });
    }

    @PermissionCallback
    private void cameraPermCallback(PluginCall call) {
        if (getPermissionState("camera") == PermissionState.GRANTED) {
            start(call);
        } else {
            call.reject("Permissao de camera negada");
        }
    }

    @PluginMethod
    public void stop(PluginCall call) {
        cameraController.stop();
        barcodeAnalyzer = null;
        call.resolve();
    }

    @PluginMethod
    public void pause(PluginCall call) {
        if (barcodeAnalyzer != null) {
            barcodeAnalyzer.setPaused(true);
        }
        call.resolve();
    }

    @PluginMethod
    public void resume(PluginCall call) {
        if (barcodeAnalyzer != null) {
            barcodeAnalyzer.setPaused(false);
        }
        call.resolve();
    }

    @PluginMethod
    public void toggleTorch(PluginCall call) {
        Boolean on = call.getBoolean("on");
        if (on != null) {
            lightController.setManualOverride(on);
            call.resolve();
        } else {
            call.reject("Parametro 'on' ausente");
        }
    }

    @PluginMethod
    public void setZoom(PluginCall call) {
        Float level = call.getFloat("level");
        if (level != null) {
            zoomController.setZoom(level, true); // true = isManual
            JSObject ret = new JSObject();
            ret.put("zoomLevel", level);
            notifyListeners("zoomChanged", ret);
            call.resolve();
        } else {
            call.reject("Parametro 'level' ausente");
        }
    }

    @PluginMethod
    public void getCameraMetrics(PluginCall call) {
        if (zoomController != null) {
            CameraMetrics metrics = zoomController.getMetrics();
            call.resolve(metrics.getSnapshot());
        } else {
            call.reject("Zoom Controller inativo");
        }
    }

    @PluginMethod
    public void getPerformance(PluginCall call) {
        if (performanceManager != null) {
            double fps = barcodeAnalyzer != null ? barcodeAnalyzer.getCurrentFps() : 0.0;
            long avgProcTime = barcodeAnalyzer != null ? barcodeAnalyzer.getAverageProcessingTimeMs() : 0;
            call.resolve(performanceManager.getFullPerformanceSnapshot(fps, avgProcTime));
        } else {
            call.reject("Manager não inicializado");
        }
    }

    @PluginMethod
    public void getMemory(PluginCall call) {
        if (performanceManager != null) {
            call.resolve(performanceManager.getMemoryMonitor().getMemorySnapshot());
        } else {
            call.reject("Manager não inicializado");
        }
    }

    @PluginMethod
    public void getBattery(PluginCall call) {
        if (performanceManager != null) {
            call.resolve(performanceManager.getBatteryMonitor().getBatterySnapshot());
        } else {
            call.reject("Manager não inicializado");
        }
    }

    @PluginMethod
    public void getThermal(PluginCall call) {
        if (performanceManager != null) {
            call.resolve(performanceManager.getThermalMonitor().getThermalSnapshot());
        } else {
            call.reject("Manager não inicializado");
        }
    }

    private void triggerFeedback() {
        try {
            android.os.Vibrator vibrator = (android.os.Vibrator) getContext().getSystemService(android.content.Context.VIBRATOR_SERVICE);
            if (vibrator != null) {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.O) {
                    vibrator.vibrate(android.os.VibrationEffect.createOneShot(80, android.os.VibrationEffect.DEFAULT_AMPLITUDE));
                } else {
                    vibrator.vibrate(80);
                }
            }
            
            android.media.ToneGenerator toneGen = new android.media.ToneGenerator(android.media.AudioManager.STREAM_MUSIC, 100);
            toneGen.startTone(android.media.ToneGenerator.TONE_PROP_BEEP, 150);
        } catch (Exception e) {
            CameraUtils.logError("Plugin: Erro no feedback", e);
        }
    }
}
