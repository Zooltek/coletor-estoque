package com.amura.collector.scanner;

import android.app.Activity;
import android.graphics.Color;
import android.util.Size;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import androidx.camera.core.Camera;
import androidx.camera.core.CameraSelector;
import androidx.camera.core.ImageAnalysis;
import androidx.camera.core.Preview;
import androidx.camera.lifecycle.ProcessCameraProvider;
import androidx.camera.view.PreviewView;
import androidx.core.content.ContextCompat;
import androidx.lifecycle.LifecycleOwner;
import com.getcapacitor.Bridge;
import com.google.common.util.concurrent.ListenableFuture;

public class CameraController {
    public interface OnCameraReadyListener {
        void onCameraReady();
        void onCameraError(Throwable error);
    }

    private Activity activity;
    private Bridge bridge;
    private PreviewView previewView;
    private ProcessCameraProvider cameraProvider;
    private Camera camera;
    private BarcodeAnalyzer analyzer;

    public CameraController(Activity activity, Bridge bridge) {
        this.activity = activity;
        this.bridge = bridge;
    }

    public void start(BarcodeAnalyzer analyzer, OnCameraReadyListener listener) {
        this.analyzer = analyzer;

        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    bridge.getWebView().setBackgroundColor(Color.TRANSPARENT);

                    if (previewView == null) {
                        previewView = new PreviewView(activity);
                        previewView.setScaleType(PreviewView.ScaleType.FILL_CENTER);

                        FrameLayout.LayoutParams layoutParams = new FrameLayout.LayoutParams(
                            FrameLayout.LayoutParams.MATCH_PARENT,
                            FrameLayout.LayoutParams.MATCH_PARENT
                        );

                        ViewGroup viewGroup = (ViewGroup) bridge.getWebView().getParent();
                        viewGroup.addView(previewView, 0, layoutParams);
                    }

                    ListenableFuture<ProcessCameraProvider> cameraProviderFuture =
                        ProcessCameraProvider.getInstance(activity);

                    cameraProviderFuture.addListener(new Runnable() {
                        @Override
                        public void run() {
                            try {
                                cameraProvider = cameraProviderFuture.get();
                                bindUseCases(listener);
                            } catch (Exception e) {
                                listener.onCameraError(e);
                            }
                        }
                    }, ContextCompat.getMainExecutor(activity));

                } catch (Exception e) {
                    listener.onCameraError(e);
                }
            }
        });
    }

    private void bindUseCases(OnCameraReadyListener listener) {
        Preview preview = new Preview.Builder().build();
        preview.setSurfaceProvider(previewView.getSurfaceProvider());

        ImageAnalysis.Builder analysisBuilder = new ImageAnalysis.Builder()
            .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST);
        
        analysisBuilder.setTargetResolution(new Size(1920, 1080));

        ImageAnalysis imageAnalysis = analysisBuilder.build();
        imageAnalysis.setAnalyzer(ContextCompat.getMainExecutor(activity), analyzer);

        CameraSelector cameraSelector = CameraSelector.DEFAULT_BACK_CAMERA;
        try {
            cameraProvider.unbindAll();
            camera = cameraProvider.bindToLifecycle(
                (LifecycleOwner) activity,
                cameraSelector,
                preview,
                imageAnalysis
            );
            
            listener.onCameraReady();
        } catch (Exception e) {
            listener.onCameraError(e);
        }
    }

    public void stop() {
        activity.runOnUiThread(new Runnable() {
            @Override
            public void run() {
                try {
                    if (cameraProvider != null) {
                        cameraProvider.unbindAll();
                        cameraProvider = null;
                    }

                    if (previewView != null) {
                        ViewGroup viewGroup = (ViewGroup) bridge.getWebView().getParent();
                        viewGroup.removeView(previewView);
                        previewView = null;
                    }

                    camera = null;
                } catch (Exception e) {
                    CameraUtils.logError("CameraController: Erro ao parar a camera", e);
                }
            }
        });
    }

    public Camera getCamera() {
        return camera;
    }
}
