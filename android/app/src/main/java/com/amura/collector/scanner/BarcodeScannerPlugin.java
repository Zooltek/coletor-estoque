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
    private BarcodeProcessor barcodeProcessor;
    private BarcodeAnalyzer barcodeAnalyzer;
    private TorchController torchController;
    private ZoomController zoomController;

    @Override
    public void load() {
        super.load();
        cameraController = new CameraController(getActivity(), getBridge());
        torchController = new TorchController(getContext());
        zoomController = new ZoomController();
        
        barcodeProcessor = new BarcodeProcessor(new BarcodeProcessor.OnBarcodeValidatedListener() {
            @Override
            public void onBarcodeValidated(String barcode) {
                zoomController.resetZoomAfterScan();
                triggerFeedback();
                
                JSObject ret = new JSObject();
                ret.put("barcode", barcode);
                notifyListeners("barcodeDetected", ret);
            }
        });
    }

    @PluginMethod
    public void start(PluginCall call) {
        if (getPermissionState("camera") != PermissionState.GRANTED) {
            requestPermissionForAlias("camera", call, "cameraPermCallback");
            return;
        }

        barcodeProcessor.clearThrottle();
        barcodeAnalyzer = new BarcodeAnalyzer(barcodeProcessor, zoomController);

        cameraController.start(barcodeAnalyzer, new CameraController.OnCameraReadyListener() {
            @Override
            public void onCameraReady() {
                torchController.setCamera(cameraController.getCamera());
                zoomController.setCamera(cameraController.getCamera());
                torchController.startAutoTorch();

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
        torchController.stopAutoTorch();
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
            torchController.toggleTorch(on);
            JSObject ret = new JSObject();
            ret.put("torchActive", on);
            notifyListeners("torchChanged", ret);
            call.resolve();
        } else {
            call.reject("Parametro 'on' ausente");
        }
    }

    @PluginMethod
    public void setZoom(PluginCall call) {
        Float level = call.getFloat("level");
        if (level != null) {
            zoomController.setZoom(level);
            JSObject ret = new JSObject();
            ret.put("zoomLevel", level);
            notifyListeners("zoomChanged", ret);
            call.resolve();
        } else {
            call.reject("Parametro 'level' ausente");
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
